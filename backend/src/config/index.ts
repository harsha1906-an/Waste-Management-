import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // External APIs
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  
  // Email
  sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@vendorplatform.com',
  
  // SMS
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  
  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  
  // ML Service
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};

export default config;
