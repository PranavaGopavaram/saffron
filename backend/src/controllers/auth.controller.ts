import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegistrationData, LoginData } from '../models/user.model';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract registration data from request body
      const registrationData: RegistrationData = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        phone: req.body.phone,
        role: req.body.role,
        // Buyer-specific fields
        companyName: req.body.companyName,
        shippingAddress: req.body.shippingAddress,
        // Seller-specific fields
        businessName: req.body.businessName,
        taxId: req.body.taxId,
        saffronSource: req.body.saffronSource,
        businessAddress: req.body.businessAddress,
      };

      // Get uploaded files (if any)
      const files = req.files as Express.Multer.File[] | undefined;

      // Call service to register user
      const result = await this.authService.register(registrationData, files);

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      // Handle errors
      if (error instanceof Error) {
        // Check for specific error messages
        if (error.message === 'Email already registered') {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }

        // Generic error response
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        // Unexpected error
        res.status(500).json({
          success: false,
          message: 'An unexpected error occurred during registration',
        });
      }
    }
  };

  /**
   * Login existing user
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract login data from request body
      const loginData: LoginData = {
        email: req.body.email,
        password: req.body.password,
      };

      // Call service to authenticate user
      const result = await this.authService.login(loginData);

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      // Handle errors
      if (error instanceof Error) {
        // Check for specific error messages
        if (
          error.message === 'Invalid email or password' ||
          error.message.includes('Account suspended')
        ) {
          res.status(401).json({
            success: false,
            message: error.message,
          });
          return;
        }

        // Generic error response
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        // Unexpected error
        res.status(500).json({
          success: false,
          message: 'An unexpected error occurred during login',
        });
      }
    }
  };
}
