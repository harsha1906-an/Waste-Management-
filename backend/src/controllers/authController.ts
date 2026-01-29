import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePassword, generateToken, isValidEmail, isStrongPassword, isValidPhone } from '../utils/auth';

/**
 * Register new user
 * POST /api/v1/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, businessName, location, phone } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email, password, and role are required',
      });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      });
      return;
    }

    // Validate role
    if (!['vendor', 'customer', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid role. Must be vendor, customer, or admin',
      });
      return;
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid phone number format',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      role,
      businessName: role === 'vendor' ? businessName : undefined,
      location,
      phone,
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to register user',
    });
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to login',
    });
  }
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to get user information',
    });
  }
};

/**
 * Update user profile
 * PUT /api/v1/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const { businessName, location, phone } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid phone number format',
      });
      return;
    }

    // Update user
    if (businessName !== undefined) user.businessName = businessName;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to update profile',
    });
  }
};

/**
 * Change password
 * PUT /api/v1/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Current password and new password are required',
      });
      return;
    }

    // Validate new password strength
    if (!isStrongPassword(newPassword)) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'New password must be at least 8 characters with uppercase, lowercase, and number',
      });
      return;
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to change password',
    });
  }
};
