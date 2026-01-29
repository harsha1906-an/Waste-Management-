import { Router } from 'express';
import { signup, login, getCurrentUser, updateProfile, changePassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', authenticate, changePassword);

export default router;
