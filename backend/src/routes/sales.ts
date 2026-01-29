import { Router } from 'express';
import { createSale, listSales, salesSummary } from '../controllers/salesController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('vendor'), createSale);
router.get('/', authorize('vendor'), listSales);
router.get('/summary', authorize('vendor'), salesSummary);

export default router;