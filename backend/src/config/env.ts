import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config();

/**
 * Helper function to get environment variable with validation
 * @param key - Environment variable name
 * @param defaultValue - Optional default value
 * @param required - Whether the variable is required
 */
const getEnvVar = (
  key: string, 
  defaultValue?: string, 
  required: boolean = true
): string => {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env file and ensure ${key} is set.`
    );
  }
  
  return value || '';
};

/**
 * Application configuration object
 * All environment variables are loaded and validated here
 */
export const config = {
  // Server configuration
  server: {
    port: parseInt(getEnvVar('PORT', '3000', false), 10),
    nodeEnv: getEnvVar('NODE_ENV', 'development', false),
    isDevelopment: getEnvVar('NODE_ENV', 'development', false) === 'development',
    isProduction: getEnvVar('NODE_ENV', 'development', false) === 'production',
  },

  // Database configuration
  database: {
    host: getEnvVar('DB_HOST', 'localhost', false),
    port: parseInt(getEnvVar('DB_PORT', '3306', false), 10),
    user: getEnvVar('DB_USER'), // REQUIRED
    password: getEnvVar('DB_PASSWORD'), // REQUIRED
    name: getEnvVar('DB_NAME'), // REQUIRED
    connectionLimit: parseInt(getEnvVar('DB_CONNECTION_LIMIT', '10', false), 10),
  },

  // JWT authentication configuration
  jwt: {
    secret: getEnvVar('JWT_SECRET'), // REQUIRED - will throw if not set
    expiresIn: getEnvVar('JWT_EXPIRES_IN', '24h', false),
    refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d', false),
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(getEnvVar('MAX_FILE_SIZE', '5242880', false), 10), // 5MB
    maxFiles: parseInt(getEnvVar('MAX_FILES', '5', false), 10),
    uploadDir: getEnvVar('UPLOAD_DIR', './uploads/certifications', false),
    // Split comma-separated string into array
    allowedTypes: getEnvVar('ALLOWED_FILE_TYPES', 'application/pdf', false)
      .split(',')
      .map(type => type.trim()),
  },

  // CORS configuration
  cors: {
    frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:4200', false),
    // Split comma-separated origins into array
    allowedOrigins: getEnvVar(
      'ALLOWED_ORIGINS', 
      'http://localhost:4200,http://localhost:3000', 
      false
    )
      .split(',')
      .map(origin => origin.trim()),
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000', false), 10), // 15 min
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100', false), 10),
    loginMaxRequests: parseInt(getEnvVar('LOGIN_RATE_LIMIT_MAX', '5', false), 10),
  },

  // Security configuration
  bcrypt: {
    rounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12', false), 10),
  },
} as const;

// Type export for use in other modules
export type Config = typeof config;

// Validate critical config on module load
const validateConfig = () => {
  // Check JWT secret length
  if (config.jwt.secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.\n' +
      'Generate a secure secret using: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  // Check bcrypt rounds are reasonable
  if (config.bcrypt.rounds < 10 || config.bcrypt.rounds > 14) {
    console.warn(
      'Warning: BCRYPT_ROUNDS should be between 10-14 for optimal security/performance balance. ' +
      `Current value: ${config.bcrypt.rounds}`
    );
  }

  // Check database connection limit
  if (config.database.connectionLimit < 5) {
    console.warn(
      'Warning: DB_CONNECTION_LIMIT is very low. Recommended minimum: 10. ' +
      `Current value: ${config.database.connectionLimit}`
    );
  }

  console.log('✓ Environment configuration validated successfully');
};

// Run validation when module is imported
validateConfig();
