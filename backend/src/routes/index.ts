import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

/**
 * Mount all route modules
 */
router.use('/auth', authRoutes);

/**
 * Health check route for API
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
