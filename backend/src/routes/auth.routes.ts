import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { validateRegistration, validateLogin } from '../utils/validators';
import { validate } from '../middleware/validate.middleware';

const router = Router();
const authController = new AuthController();


router.post(
  '/register',
  uploadMiddleware.array('certifications', 5), 
  validateRegistration,                         
  validate,                                    
  authController.register                       
);
router.post(
  '/login',
  validateLogin,            
  validate,                 
  authController.login       
);

export default router;
