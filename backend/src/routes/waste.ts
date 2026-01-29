import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as wasteController from '../controllers/wasteController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Log waste
router.post('/', wasteController.logWaste);

// Get waste logs
router.get('/', wasteController.getWasteLogs);

// Get waste statistics
router.get('/stats', wasteController.getWasteStats);

// Get waste by product
router.get('/product/:productId', wasteController.getWasteByProduct);

// Delete waste log
router.delete('/:id', wasteController.deleteWasteLog);

export default router;
