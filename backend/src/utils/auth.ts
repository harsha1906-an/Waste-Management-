import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): { userId: string; role: string } => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
