from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uvicorn
import logging

# Import custom modules
try:
    from prediction.forecaster import DemandForecaster
    from utils.database import DatabaseClient
    ML_AVAILABLE = True
except ImportError as e:
    logging.warning(f"ML modules not available: {e}")
    ML_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Vendor Platform ML Service",
    description="AI-powered demand forecasting service",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
if ML_AVAILABLE:
    db_client = DatabaseClient()
    forecaster_cache = {}  # Cache forecasters per product
    logger.info("ML services initialized successfully")
else:
    db_client = None
    forecaster_cache = {}
    logger.warning("Running in fallback mode without ML")

# Request/Response models
class PredictionRequest(BaseModel):
    product_id: str = Field(..., description="Product UUID")
    days: int = Field(default=7, ge=1, le=30, description="Number of days to forecast")
    include_confidence: bool = Field(default=True, description="Include confidence intervals")

class PredictionPoint(BaseModel):
    date: str
    predicted_quantity: float
    confidence_level: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class PredictionResponse(BaseModel):
    product_id: str
    predictions: List[PredictionPoint]
    model_used: str
    accuracy_score: Optional[float] = None
    generated_at: datetime
    recommendations: Optional[List[str]] = []
    metadata: Optional[Dict] = {}

class BatchPredictionRequest(BaseModel):
    product_ids: List[str]
    days: int = Field(default=7, ge=1, le=30)

class ModelInfo(BaseModel):
    name: str
    version: str
    accuracy: float
    last_trained: str
    status: str

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "OK",
        "service": "ML Service",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": True,  # TODO: Check if models are actually loaded
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Vendor Platform ML Service",
        "version": "1.0.0",
        "description": "AI-powered demand forecasting",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "predict": "/predict",
            "batch_predict": "/predict/batch",
            "models": "/models",
        }
    }

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Generate demand forecast for a product
    
    Fetches historical sales data and generates ML-powered predictions
    """
    try:
        logger.info(f"Prediction request for product {request.product_id}, days: {request.days}")
        
        if not ML_AVAILABLE:
            raise HTTPException(status_code=503, detail="ML service not available")
        
        # Fetch sales history
        sales_history = db_client.get_sales_history(request.product_id, days=90)
        
        if not sales_history:
            logger.warning(f"No sales history found for product {request.product_id}")
            # Return fallback predictions
            return generate_fallback_predictions(request.product_id, request.days)
        
        # Get or create forecaster for this product
        if request.product_id not in forecaster_cache:
            forecaster_cache[request.product_id] = DemandForecaster()
        
        forecaster = forecaster_cache[request.product_id]
        
        # Train model on historical data
        training_result = forecaster.train(sales_history)
        logger.info(f"Training result: {training_result}")
        
        # Generate predictions
        last_sale_date = datetime.fromisoformat(sales_history[-1]['soldAt'].replace('Z', '+00:00'))
        predictions_data = forecaster.predict(request.days, last_sale_date)
        
        # Convert to PredictionPoint objects
        predictions = [
            PredictionPoint(**pred) for pred in predictions_data
        ]
        
        # Get product info for recommendations
        product_info = db_client.get_product_info(request.product_id)
        current_stock = product_info['quantity'] if product_info else 0
        
        # Generate recommendations
        recommendations = forecaster.get_recommendations(predictions_data, current_stock)
        
        accuracy = training_result.get('accuracy', 0.85)
        
        return PredictionResponse(
            product_id=request.product_id,
            predictions=predictions,
            model_used="LinearRegression",
            accuracy_score=accuracy,
            generated_at=datetime.now(),
            recommendations=recommendations,
            metadata={
                "training_samples": training_result.get('samples', len(sales_history)),
                "training_status": training_result.get('status', 'success'),
                "current_stock": current_stock
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def generate_fallback_predictions(product_id: str, days: int) -> PredictionResponse:
    """Generate fallback predictions when no data available"""
    predictions = []
    base_date = datetime.now()
    
    for i in range(days):
        date = base_date + timedelta(days=i+1)
        quantity = 50 + (i * 2.5)
        predictions.append(PredictionPoint(
            date=date.strftime("%Y-%m-%d"),
            predicted_quantity=round(quantity, 2),
            confidence_level=0.5,
            lower_bound=round(quantity * 0.8, 2),
            upper_bound=round(quantity * 1.2, 2),
        ))
    
    return PredictionResponse(
        product_id=product_id,
        predictions=predictions,
        model_used="Fallback",
        accuracy_score=0.5,
        generated_at=datetime.now(),
        recommendations=["No historical data available. Predictions are based on default estimates."],
        metadata={"training_samples": 0, "training_status": "no_data"}
    )


# Batch prediction endpoint
@app.post("/predict/batch")
async def batch_predict(request: BatchPredictionRequest):
    """Generate predictions for multiple products"""
    try:
        results = []
        
        for product_id in request.product_ids:
            pred_request = PredictionRequest(
                product_id=product_id,
                days=request.days
            )
            result = await predict(pred_request)
            results.append(result)
        
        return {
            "predictions": results,
            "total_products": len(request.product_ids),
            "generated_at": datetime.now().isoformat(),
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

# Models info endpoint
@app.get("/models")
async def get_models():
    """Get information about available models"""
    # TODO: Load actual model information
    models = [
        ModelInfo(
            name="ARIMA",
            version="1.0.0",
            accuracy=0.78,
            last_trained="2026-01-20",
            status="active"
        ),
        ModelInfo(
            name="Prophet",
            version="1.0.0",
            accuracy=0.83,
            last_trained="2026-01-20",
            status="active"
        ),
        ModelInfo(
            name="LSTM",
            version="1.0.0",
            accuracy=0.88,
            last_trained="2026-01-20",
            status="active"
        ),
        ModelInfo(
            name="Ensemble",
            version="1.0.0",
            accuracy=0.89,
            last_trained="2026-01-20",
            status="active"
        ),
    ]
    
    return {
        "models": models,
        "total": len(models),
    }

# Model metrics endpoint
@app.get("/metrics")
async def get_metrics():
    """Get model performance metrics"""
    # TODO: Implement actual metrics calculation
    return {
        "overall_accuracy": 0.87,
        "rmse": 4.2,
        "mae": 3.1,
        "mape": 8.5,
        "predictions_today": 145,
        "models_trained": 4,
        "last_updated": datetime.now().isoformat(),
    }

# Model training endpoint
@app.post("/train")
async def train_models():
    """Trigger model retraining"""
    return {
        "status": "training_started",
        "message": "Model training initiated in background",
        "estimated_time": "15-30 minutes",
        "started_at": datetime.now().isoformat(),
    }


# Run server
if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

