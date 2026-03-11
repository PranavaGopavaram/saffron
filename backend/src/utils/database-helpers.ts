import { pool } from '../config/database';

/**
 * Get seller statistics using stored procedure
 * @param sellerId - Seller ID
 * @returns Seller stats object
 */
export async function getSellerStats(sellerId: number): Promise<any> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('CALL get_seller_stats(?)', [
      sellerId,
    ]);
    connection.release();

    return (results as any[])[0] || null;
  } catch (error) {
    console.error('Error getting seller stats:', error);
    throw error;
  }
}

/**
 * Get a database connection with transaction started
 * @returns Database connection with active transaction
 */
export async function getTransactionConnection(): Promise<any> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction and release the connection
 * @param connection - Database connection
 */
export async function commitTransaction(connection: any): Promise<void> {
  try {
    await connection.commit();
    connection.release();
  } catch (error) {
    console.error('Error committing transaction:', error);
    throw error;
  }
}

/**
 * Rollback a transaction and release the connection
 * @param connection - Database connection
 */
export async function rollbackTransaction(connection: any): Promise<void> {
  try {
    await connection.rollback();
    connection.release();
  } catch (error) {
    console.error('Error rolling back transaction:', error);
    throw error;
  }
}
