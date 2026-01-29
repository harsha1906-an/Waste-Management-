import { Router } from 'express';
import { 
  createProduct, 
  getProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct,
  getLowStockProducts 
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private
 */
router.post('/', createProduct);

/**
 * @route   GET /api/v1/products
 * @desc    Get all products for vendor
 * @access  Private
 */
router.get('/', getProducts);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get low stock products
 * @access  Private
 */
router.get('/low-stock', getLowStockProducts);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Private
 */
router.get('/:id', getProduct);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private
 */
router.put('/:id', updateProduct);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private
 */
router.delete('/:id', deleteProduct);

export default router;
