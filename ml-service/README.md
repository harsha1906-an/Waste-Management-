# ML Service - Demand Forecasting

Python-based ML service for demand forecasting and prediction.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL (for data access)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

Or using uvicorn:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 📁 Project Structure

```
ml-service/
├── models/              # Trained ML models
│   ├── arima/
│   ├── prophet/
│   └── lstm/
├── training/            # Model training scripts
│   ├── train_arima.py
│   ├── train_prophet.py
│   └── train_lstm.py
├── prediction/          # Prediction logic
│   ├── forecaster.py
│   └── ensemble.py
├── preprocessing/       # Data preprocessing
│   ├── cleaner.py
│   ├── features.py
│   └── scaler.py
├── notebooks/           # Jupyter notebooks (experiments)
├── utils/               # Helper functions
├── config/              # Configuration
├── app.py               # FastAPI application
└── requirements.txt     # Python dependencies
```

## 🛠️ Technologies

- **Framework**: FastAPI
- **ML Libraries**: 
  - TensorFlow (Deep Learning)
  - scikit-learn (Traditional ML)
  - Prophet (Time Series)
  - statsmodels (ARIMA)
- **Data**: Pandas, NumPy
- **Database**: SQLAlchemy + PostgreSQL

## 📝 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints

#### GET `/health`
Health check

#### POST `/predict`
Generate demand forecast

**Request Body:**
```json
{
  "product_id": "uuid",
  "days": 7,
  "include_confidence": true
}
```

**Response:**
```json
{
  "product_id": "uuid",
  "predictions": [
    {
      "date": "2026-01-26",
      "predicted_quantity": 45.2,
      "confidence_level": 0.85
    }
  ],
  "model_used": "ensemble",
  "generated_at": "2026-01-25T10:30:00Z"
}
```

#### POST `/predict/batch`
Batch predictions for multiple products

#### POST `/train`
Trigger model retraining

#### GET `/models`
List available models

#### GET `/metrics`
Get model performance metrics

## 🤖 ML Models

### 1. ARIMA (AutoRegressive Integrated Moving Average)
- **Best for**: Short-term predictions, stable patterns
- **Accuracy**: ~75-80%
- **Speed**: Fast

### 2. Prophet (Facebook)
- **Best for**: Seasonal patterns, holidays
- **Accuracy**: ~80-85%
- **Speed**: Medium

### 3. LSTM (Long Short-Term Memory)
- **Best for**: Complex patterns, long-term
- **Accuracy**: ~85-90%
- **Speed**: Slow

### 4. Ensemble Model
- **Combines all models**
- **Accuracy**: ~85-92%
- **Speed**: Medium

## 🔧 Configuration

Edit `.env` file:

```env
PORT=8000
DATABASE_URL=postgresql://user:pass@localhost/db
MODEL_PATH=./models
DEFAULT_FORECAST_DAYS=7
WEATHER_API_KEY=your-key
```

## 📊 Model Training

### Train all models:
```bash
python training/train_all.py
```

### Train specific model:
```bash
python training/train_prophet.py --product-id uuid
```

### Evaluate models:
```bash
python training/evaluate.py
```

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=.
```

## 📈 Performance Optimization

- **Caching**: Predictions cached for 1 hour
- **Batch Processing**: Handle multiple products
- **GPU Acceleration**: For LSTM models (if available)
- **Model Versioning**: A/B testing support

## 🔍 Monitoring

- **Metrics**: Accuracy, RMSE, MAE
- **Logs**: Stored in `logs/ml-service.log`
- **Alerts**: Low accuracy warnings

## 🚀 Deployment

```bash
# Production with Gunicorn
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

**Last Updated**: January 25, 2026
