import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { NotFoundError, ValidationError } from '../utils/api-response';

export interface UserProfile {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  company_name?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

class UserService {
  async getProfile(userId: number): Promise<UserProfile> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.id as user_id, u.email, u.full_name, u.phone, u.role,
              b.company_name
       FROM users u
       LEFT JOIN buyers b ON u.id = b.user_id
       WHERE u.id = ?`,
      [userId]
    );
    
    const user = rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      company_name: user.company_name || undefined
    };
  }

  async updateProfile(userId: number, data: UpdateProfileRequest): Promise<UserProfile> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(data.fullName);
    }
    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getProfile(userId);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    const user = rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  }
}

export const userService = new UserService();