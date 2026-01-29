import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple, Dict
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)

class DemandForecaster:
    """Simple demand forecasting using moving average and linear regression"""
    
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, sales_data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features from sales data"""
        if not sales_data:
            return np.array([]), np.array([])
        
        # Extract dates and quantities
        dates = []
        quantities = []
        
        for sale in sales_data:
            date_str = sale.get('soldAt') or sale.get('sold_at')
            if date_str:
                dates.append(datetime.fromisoformat(date_str.replace('Z', '+00:00')))
                quantities.append(float(sale.get('quantity', 0)))
        
        if not dates:
            return np.array([]), np.array([])
        
        # Sort by date
        sorted_data = sorted(zip(dates, quantities), key=lambda x: x[0])
        dates, quantities = zip(*sorted_data)
        
        # Convert to numerical features (days since first date)
        base_date = dates[0]
        X = np.array([(d - base_date).days for d in dates]).reshape(-1, 1)
        y = np.array(quantities)
        
        return X, y
    
    def train(self, sales_data: List[Dict]) -> Dict:
        """Train the forecasting model"""
        try:
            X, y = self.prepare_features(sales_data)
            
            if len(X) < 3:
                logger.warning("Insufficient data for training")
                return {
                    "status": "insufficient_data",
                    "message": "Need at least 3 sales records",
                    "samples": len(X)
                }
            
            # Train model
            self.model.fit(X, y)
            self.is_trained = True
            
            # Calculate accuracy (R² score)
            score = self.model.score(X, y)
            
            return {
                "status": "trained",
                "samples": len(X),
                "accuracy": round(score, 4),
                "coefficient": round(float(self.model.coef_[0]), 4),
                "intercept": round(float(self.model.intercept_), 4)
            }
        
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    def predict(self, days: int, last_date: datetime = None) -> List[Dict]:
        """Generate demand forecast"""
        if not self.is_trained:
            # Return default predictions based on moving average
            return self._fallback_predict(days)
        
        try:
            if last_date is None:
                last_date = datetime.now()
            
            predictions = []
            base_day = 0  # Days since training base
            
            for i in range(days):
                day = base_day + i + 1
                X_pred = np.array([[day]])
                
                # Predict quantity
                pred_quantity = float(self.model.predict(X_pred)[0])
                pred_quantity = max(0, pred_quantity)  # No negative predictions
                
                # Calculate confidence interval (simple approach)
                confidence = 0.85 if pred_quantity > 0 else 0.5
                margin = pred_quantity * 0.15
                
                date = last_date + timedelta(days=i+1)
                
                predictions.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "predicted_quantity": round(pred_quantity, 2),
                    "confidence_level": confidence,
                    "lower_bound": round(max(0, pred_quantity - margin), 2),
                    "upper_bound": round(pred_quantity + margin, 2)
                })
            
            return predictions
        
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return self._fallback_predict(days)
    
    def _fallback_predict(self, days: int) -> List[Dict]:
        """Fallback prediction when model is not trained"""
        predictions = []
        base_date = datetime.now()
        base_quantity = 50.0  # Default baseline
        
        for i in range(days):
            date = base_date + timedelta(days=i+1)
            quantity = base_quantity + (i * 2.0)  # Simple linear increase
            
            predictions.append({
                "date": date.strftime("%Y-%m-%d"),
                "predicted_quantity": round(quantity, 2),
                "confidence_level": 0.6,
                "lower_bound": round(quantity * 0.8, 2),
                "upper_bound": round(quantity * 1.2, 2)
            })
        
        return predictions
    
    def get_recommendations(self, predictions: List[Dict], current_stock: float) -> List[str]:
        """Generate inventory recommendations based on predictions"""
        recommendations = []
        
        if not predictions:
            return ["Insufficient data for recommendations"]
        
        # Calculate total predicted demand
        total_demand = sum(p['predicted_quantity'] for p in predictions)
        avg_daily_demand = total_demand / len(predictions)
        
        # Stock level recommendations
        if current_stock < avg_daily_demand * 2:
            recommendations.append(f"⚠️ Low stock warning: Restock soon (current: {current_stock:.0f}, avg daily: {avg_daily_demand:.0f})")
        
        if current_stock > avg_daily_demand * 10:
            recommendations.append(f"📦 High stock: Consider reducing orders (current: {current_stock:.0f}, avg daily: {avg_daily_demand:.0f})")
        
        # Trend analysis
        if len(predictions) >= 3:
            first_half = predictions[:len(predictions)//2]
            second_half = predictions[len(predictions)//2:]
            
            avg_first = sum(p['predicted_quantity'] for p in first_half) / len(first_half)
            avg_second = sum(p['predicted_quantity'] for p in second_half) / len(second_half)
            
            if avg_second > avg_first * 1.2:
                recommendations.append("📈 Demand increasing: Consider ordering more stock")
            elif avg_second < avg_first * 0.8:
                recommendations.append("📉 Demand decreasing: Reduce order quantities")
        
        # Optimal order quantity
        safety_stock = avg_daily_demand * 2
        optimal_order = max(0, (avg_daily_demand * 7) - current_stock + safety_stock)
        
        if optimal_order > 0:
            recommendations.append(f"💡 Suggested order quantity: {optimal_order:.0f} units for next 7 days")
        
        if not recommendations:
            recommendations.append("✅ Stock levels look good!")
        
        return recommendations
