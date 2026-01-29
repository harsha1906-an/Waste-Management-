import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import sequelize, { testConnection } from './config/database';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import predictionRoutes from './routes/predictions';
import wasteRoutes from './routes/waste';
import analyticsRoutes from './routes/analytics';

// Create Express app
const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Local Vendor Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      products: '/api/v1/products',
      sales: '/api/v1/sales',
      predictions: '/api/v1/predictions',
      waste: '/api/v1/waste',
      analytics: '/api/v1/analytics',
      reports: '/api/v1/reports',
    },
  });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/waste', wasteRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Import Prediction model and setup associations
    const { setupPredictionAssociations } = await import('./models/Prediction');
    setupPredictionAssociations();
    
    // Import WasteLog model and setup associations
    const { setupWasteLogAssociations } = await import('./models/WasteLog');
    setupWasteLogAssociations();
    
    // Sync database models (use migrations in production)
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }
    
    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   🚀 Vendor Platform API Server                      ║
║   ⚡ Environment: ${config.nodeEnv.padEnd(35)}║
║   🌐 Port: ${String(config.port).padEnd(41)}║
║   📡 URL: http://localhost:${config.port}${' '.repeat(24)}║
║   🏥 Health: http://localhost:${config.port}/health${' '.repeat(17)}║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

export default app;
