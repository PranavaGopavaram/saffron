import { pool } from '../config/database';
export async function queryView(
  viewName: string,
  filters?: Record<string, any>
): Promise<any[]> {
  try {
    let query = `SELECT * FROM ${viewName}`;
    const params: any[] = [];

    if (filters) {
      const conditions = Object.keys(filters)
        .map((key, index) => {
          params.push(filters[key]);
          return `${key} = ?`;
        })
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();

    return rows as any[];
  } catch (error) {
    console.error(`Error querying view ${viewName}:`, error);
    throw error;
  }
}

export async function getBuyerProfile(userId: number): Promise<any> {
  const results = await queryView('buyer_profiles', { user_id: userId });
  return results[0] || null;
}

export async function getSellerProfile(sellerId: number): Promise<any> {
  const results = await queryView('seller_profiles', { seller_id: sellerId });
  return results[0] || null;
}

export async function getOrderSummary(orderId: number): Promise<any> {
  const results = await queryView('order_summary', { order_id: orderId });
  return results[0] || null;
}

export async function getProductAvailability(
  productId: number
): Promise<any> {
  const results = await queryView('product_availability', {
    product_id: productId,
  });
  return results[0] || null;
}

export async function verifySeller(sellerUserId: number): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.query('CALL verify_seller(?)', [sellerUserId]);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error verifying seller:', error);
    throw error;
  }
}

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

export async function getPlatformStats(): Promise<any> {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('CALL get_user_stats()', []);
    connection.release();

    return (results as any[])[0] || null;
  } catch (error) {
    console.error('Error getting platform stats:', error);
    throw error;
  }
}

export async function completeOrder(orderId: number): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.query('CALL complete_order(?)', [orderId]);
    connection.release();
    return true;
  } catch (error) {
    console.error('Error completing order:', error);
    throw error;
  }
}

export async function getTransactionConnection(): Promise<any> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

export async function commitTransaction(connection: any): Promise<void> {
  try {
    await connection.commit();
    connection.release();
  } catch (error) {
    console.error('Error committing transaction:', error);
    throw error;
  }
}

export async function rollbackTransaction(connection: any): Promise<void> {
  try {
    await connection.rollback();
    connection.release();
  } catch (error) {
    console.error('Error rolling back transaction:', error);
    throw error;
  }
}

export async function executeInTransaction(
  connection: any,
  query: string,
  params: any[] = []
): Promise<any> {
  const [result] = await connection.query(query, params);
  return result;
}
