import mysql from 'mysql2/promise';
import { config } from './env';


export const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: config.database.connectionLimit,
  waitForConnections: true, // Wait for available connection if pool is full
  queueLimit: 0, // Unlimited queue size
  enableKeepAlive: true, // Keep connections alive
  keepAliveInitialDelay: 0, // Immediately send keep-alive
});

export const testConnection = async (): Promise<void> => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    console.log('✓ Database connection pool created successfully');
    console.log(`✓ Connected to MySQL database: ${config.database.name}`);
    console.log(`✓ Connection pool size: ${config.database.connectionLimit}`);
    
    // Test query to verify database is working
    await connection.query('SELECT 1');
    
    // Release connection back to pool
    connection.release();
    
    console.log('✓ Database connection test successful');
  } catch (error) {
    console.error('✗ Database connection failed:');
    
    if (error instanceof Error) {
      // Provide helpful error messages based on error type
      if (error.message.includes('ECONNREFUSED')) {
        console.error('  → MySQL server is not running or not accessible');
        console.error(`  → Check if MySQL is running on ${config.database.host}:${config.database.port}`);
      } else if (error.message.includes('Access denied')) {
        console.error('  → Invalid database credentials');
        console.error(`  → Check DB_USER and DB_PASSWORD in .env file`);
      } else if (error.message.includes('Unknown database')) {
        console.error(`  → Database '${config.database.name}' does not exist`);
        console.error('  → Run the database setup SQL from Step 1');
      } else {
        console.error(`  → ${error.message}`);
      }
    }
    
    throw error; // Re-throw to stop server startup
  }
};

/**
 * Execute a query with automatic connection handling
 * Helper function for simple queries
 */
export const query = async (sql: string, params?: any[]): Promise<any> => {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('✓ Database connection pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});
