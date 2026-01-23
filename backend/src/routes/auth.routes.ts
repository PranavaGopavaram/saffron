import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { validateRegistration, validateLogin } from '../utils/validators';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (buyer or seller)
 * @access  Public
 */
router.post(
  '/register',
  uploadMiddleware.array('certifications', 5), // Handle file uploads (max 5 files)
  validateRegistration,                         // Validate registration data
  validate,                                     // Check for validation errors
  authController.register                       // Handle registration
);

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @access  Public
 */
router.post(
  '/login',
  validateLogin,              // Validate login data
  validate,                   // Check for validation errors
  authController.login        // Handle login
);

export default router;
