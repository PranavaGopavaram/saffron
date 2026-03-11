import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/database';
import { config } from '../config/env';
import { RegistrationData, LoginData, AuthResponse } from '../models/user.model';

export class AuthService {

  async register(
    data: RegistrationData,
    files?: Express.Multer.File[]
  ): Promise<AuthResponse> {
    const connection = await pool.getConnection();
    
    try {
    
      await connection.beginTransaction();
      
      // 1. Check if email already exists
      const [existingUsers] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [data.email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('Email already registered');
      }
      
      // 2. Hash password
      const passwordHash = await bcrypt.hash(data.password, config.bcrypt.rounds);
      
      // 3. Insert into users table
      const [userResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO users (email, password_hash, role, full_name, phone, status, email_verified)
         VALUES (?, ?, ?, ?, ?, 'active', false)`,
        [data.email, passwordHash, data.role, data.fullName, data.phone]
      );
      
      const userId = userResult.insertId;
      
      // 4. Insert role-specific data
      if (data.role === 'buyer') {
        // Insert into buyers table
        await connection.query(
          'INSERT INTO buyers (user_id, company_name) VALUES (?, ?)',
          [userId, data.companyName || null]
        );
        
        // Insert shipping address
        if (data.shippingAddress) {
          await connection.query(
            `INSERT INTO addresses (user_id, type, street, city, state, zip_code, country, is_default)
             VALUES (?, 'shipping', ?, ?, ?, ?, ?, true)`,
            [
              userId,
              data.shippingAddress.street,
              data.shippingAddress.city,
              data.shippingAddress.state,
              data.shippingAddress.zip_code,
              data.shippingAddress.country
            ]
          );
        }
      } else if (data.role === 'seller') {
        // Insert into sellers table
        const [sellerResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO sellers (user_id, business_name, tax_id, saffron_source, verification_status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [userId, data.businessName, data.taxId, data.saffronSource]
        );
        
        const sellerId = sellerResult.insertId;
        
        // Insert business address
        if (data.businessAddress) {
          await connection.query(
            `INSERT INTO addresses (user_id, type, street, city, state, zip_code, country, is_default)
             VALUES (?, 'business', ?, ?, ?, ?, ?, true)`,
            [
              userId,
              data.businessAddress.street,
              data.businessAddress.city,
              data.businessAddress.state,
              data.businessAddress.zip_code,
              data.businessAddress.country
            ]
          );
        }
        
        // Handle certification file uploads
        if (files && files.length > 0) {
          for (const file of files) {
            await connection.query(
              `INSERT INTO seller_certifications (seller_id, file_name, file_path, file_size, mime_type)
               VALUES (?, ?, ?, ?, ?)`,
              [sellerId, file.originalname, file.path, file.size, file.mimetype]
            );
          }
        }
      }
      
      // Commit transaction
      await connection.commit();
      
      // 5. Generate JWT token
      const token = this.generateToken(userId, data.email, data.role);
      
      // 6. Return response
      return {
        token,
        user: {
          id: userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          createdAt: new Date()
        }
      };
      
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection back to pool
      connection.release();
    }
  }
  
  /**
   * Login existing user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const connection = await pool.getConnection();
    
    try {
      // 1. Find user by email
      const [users] = await connection.query<RowDataPacket[]>(
        `SELECT id, email, password_hash, role, full_name, status
         FROM users
         WHERE email = ?`,
        [data.email]
      );
      
      if (users.length === 0) {
        throw new Error('Invalid email or password');
      }
      
      const user = users[0];
      
      // 2. Check user status
      if (user.status === 'suspended') {
        throw new Error('Account suspended. Please contact support.');
      }
      
      // 3. Compare password
      const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
      
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }
      
      // 4. Update last_login timestamp
      await connection.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );
      
      // 5. Generate JWT token
      const token = this.generateToken(user.id, user.email, user.role);
      
      // 6. Return response
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: new Date()
        }
      };
      
    } finally {
      connection.release();
    }
  }
  
  /**
   * Generate JWT token
   */
  private generateToken(userId: number, email: string, role: string): string {
    const payload = { 
      id: userId, 
      email, 
      role 
    };
    
    return jwt.sign(payload, config.jwt.secret, { 
      expiresIn: config.jwt.expiresIn as any
    });
  }
}
