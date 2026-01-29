import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSalesAnalytics,
  getDashboardStats,
  getMonthlyComparison
} from '../controllers/analyticsController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get comprehensive sales analytics
router.get('/', getSalesAnalytics);

// Get dashboard stats (quick summary)
router.get('/dashboard', getDashboardStats);

// Get monthly comparison
router.get('/monthly', getMonthlyComparison);

export default router;
