import { Router } from 'express';
import { adjustInventory, getAdjustments, getLowStockSummary } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('vendor'));

router.post('/adjust', adjustInventory);
router.get('/adjustments', getAdjustments);
router.get('/low-stock-summary', getLowStockSummary);

export default router;
