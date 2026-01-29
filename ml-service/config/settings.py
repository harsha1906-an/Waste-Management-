import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """ML Service Configuration"""
    
    # Server
    PORT = int(os.getenv('PORT', 8000))
    HOST = os.getenv('HOST', '0.0.0.0')
    WORKERS = int(os.getenv('WORKERS', 1))
    RELOAD = os.getenv('RELOAD', 'true').lower() == 'true'
    
    # Database
    DATABASE_URL = os.getenv('DATABASE_URL', '')
    
    # Model Configuration
    MODEL_PATH = os.getenv('MODEL_PATH', './models')
    MODEL_VERSION = os.getenv('MODEL_VERSION', 'v1.0')
    RETRAIN_INTERVAL_DAYS = int(os.getenv('RETRAIN_INTERVAL_DAYS', 7))
    
    # Prediction Settings
    DEFAULT_FORECAST_DAYS = int(os.getenv('DEFAULT_FORECAST_DAYS', 7))
    MAX_FORECAST_DAYS = int(os.getenv('MAX_FORECAST_DAYS', 30))
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.7))
    
    # Feature Engineering
    ENABLE_WEATHER_FEATURE = os.getenv('ENABLE_WEATHER_FEATURE', 'false').lower() == 'true'
    ENABLE_HOLIDAY_FEATURE = os.getenv('ENABLE_HOLIDAY_FEATURE', 'true').lower() == 'true'
    ENABLE_SEASONAL_FEATURE = os.getenv('ENABLE_SEASONAL_FEATURE', 'true').lower() == 'true'
    
    # External APIs
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
    WEATHER_API_URL = os.getenv('WEATHER_API_URL', 'https://api.openweathermap.org/data/2.5')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', './logs/ml-service.log')
    
    # Cache
    CACHE_PREDICTIONS = os.getenv('CACHE_PREDICTIONS', 'true').lower() == 'true'
    CACHE_TTL_SECONDS = int(os.getenv('CACHE_TTL_SECONDS', 3600))
    
    # Performance
    BATCH_SIZE = int(os.getenv('BATCH_SIZE', 32))
    MAX_WORKERS = int(os.getenv('MAX_WORKERS', 2))

config = Config()
