import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env';
import { testConnection, pool } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet()); // Set security headers

// CORS middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Body parser middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount API routes
app.use('/api', routes);

/**
 * Test endpoint - Verify server is running
 */
app.get('/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend setup successful!',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: config.server.nodeEnv,
      port: config.server.port,
      database: config.database.name,
      jwtConfigured: config.jwt.secret.length >= 32,
      uploadDir: config.upload.uploadDir,
      maxFileSize: `${config.upload.maxFileSize / 1024 / 1024}MB`,
    },
    dependencies: {
      express: '✓ installed',
      mysql2: '✓ installed',
      bcrypt: '✓ installed',
      jwt: '✓ installed',
      typescript: '✓ installed',
    }
  });
});

/**
 * Health check endpoint - Verify database connection
 */
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database with simple query
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    
    res.status(200).json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        name: config.database.name,
        host: config.database.host,
        port: config.database.port,
      },
      server: {
        uptime: process.uptime(),
        nodeVersion: process.version,
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    });
  }
});

/**
 * 404 handler - Route not found
 * Must be registered after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 * Must be registered last in middleware chain
 */
app.use(errorHandler);

/**
 * Start server with database connection test
 */
const startServer = async () => {
  try {
    console.log('\n=== Starting Saffron Marketplace Backend ===\n');
    
    // Test database connection before starting server
    console.log('Testing database connection...');
    await testConnection();
    
    console.log('\nStarting HTTP server...');
    app.listen(config.server.port, () => {
      console.log('\n✓ Server started successfully!\n');
      console.log(`  Environment:     ${config.server.nodeEnv}`);
      console.log(`  Port:            ${config.server.port}`);
      console.log(`  Database:        ${config.database.name}`);
      console.log(`  Base URL:        http://localhost:${config.server.port}`);
      console.log(`  Test endpoint:   http://localhost:${config.server.port}/test`);
      console.log(`  Health check:    http://localhost:${config.server.port}/health`);
      console.log(`  API Base:        http://localhost:${config.server.port}/api`);
      console.log(`  Register:        http://localhost:${config.server.port}/api/auth/register`);
      console.log(`  Login:           http://localhost:${config.server.port}/api/auth/login`);
      console.log(`  Products:        http://localhost:${config.server.port}/api/products`);
      console.log('\n✓ Ready to accept connections\n');
    });
    
  } catch (error) {
    console.error('\n✗ Failed to start server:\n');
    console.error(error);
    console.error('\nPlease fix the errors above and try again.\n');
    process.exit(1); // Exit with error code
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
