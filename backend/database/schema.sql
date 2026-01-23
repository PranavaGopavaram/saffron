-- Saffron Marketplace Database Schema
-- MySQL 8.0+
-- Created: January 23, 2026

-- Drop existing database if you want to start fresh
-- DROP DATABASE IF EXISTS saffron_marketplace;

CREATE DATABASE IF NOT EXISTS saffron_marketplace
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE saffron_marketplace;

-- =====================================================
-- Users Table (Core Authentication)
-- =====================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'admin') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Buyers Table (Buyer-specific data)
-- =====================================================
CREATE TABLE buyers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sellers Table (Seller-specific data)
-- =====================================================
CREATE TABLE sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  business_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100),
  saffron_source TEXT,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Addresses Table (Shipping & Business addresses)
-- =====================================================
CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('shipping', 'billing', 'business') NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Seller Certifications Table (File uploads)
-- =====================================================
CREATE TABLE seller_certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Products Table (Future implementation)
-- =====================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  origin VARCHAR(255),
  grade VARCHAR(50),
  price_per_gram DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  min_order_quantity INT DEFAULT 1,
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_price (price_per_gram)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Orders Table (Future implementation)
-- =====================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_address_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Order Items Table (Future implementation)
-- =====================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_gram DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample admin user
-- Password: Admin123! (hashed with bcrypt)
/*
INSERT INTO users (email, password_hash, role, full_name, phone, status, email_verified)
VALUES (
  'admin@saffron.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.l1hZ8u',
  'admin',
  'System Administrator',
  '555-0000',
  'active',
  TRUE
);
*/

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_sellers_verification ON sellers(verification_status, created_at);
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default);

-- =====================================================
-- Database Views (Optional)
-- =====================================================

-- View for complete user profile (buyer)
CREATE OR REPLACE VIEW buyer_profiles AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.status,
  u.email_verified,
  u.last_login,
  u.created_at,
  b.company_name,
  a.street AS shipping_street,
  a.city AS shipping_city,
  a.state AS shipping_state,
  a.zip_code AS shipping_zip,
  a.country AS shipping_country
FROM users u
JOIN buyers b ON u.id = b.user_id
LEFT JOIN addresses a ON u.id = a.user_id AND a.type = 'shipping' AND a.is_default = TRUE
WHERE u.role = 'buyer';

-- View for complete seller profile
CREATE OR REPLACE VIEW seller_profiles AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.status,
  u.email_verified,
  u.last_login,
  u.created_at,
  s.business_name,
  s.tax_id,
  s.saffron_source,
  s.verification_status,
  s.verified_at,
  a.street AS business_street,
  a.city AS business_city,
  a.state AS business_state,
  a.zip_code AS business_zip,
  a.country AS business_country,
  COUNT(sc.id) AS certification_count
FROM users u
JOIN sellers s ON u.id = s.user_id
LEFT JOIN addresses a ON u.id = a.user_id AND a.type = 'business' AND a.is_default = TRUE
LEFT JOIN seller_certifications sc ON s.id = sc.seller_id
WHERE u.role = 'seller'
GROUP BY u.id, s.id, a.id;

-- =====================================================
-- Stored Procedures (Optional)
-- =====================================================

DELIMITER //

-- Procedure to verify a seller
CREATE PROCEDURE verify_seller(IN seller_user_id INT)
BEGIN
  UPDATE sellers 
  SET 
    verification_status = 'verified',
    verified_at = NOW()
  WHERE user_id = seller_user_id;
END //

-- Procedure to get user statistics
CREATE PROCEDURE get_user_stats()
BEGIN
  SELECT 
    COUNT(*) AS total_users,
    SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS total_buyers,
    SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) AS total_sellers,
    SUM(CASE WHEN email_verified = TRUE THEN 1 ELSE 0 END) AS verified_users,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_users
  FROM users;
END //

DELIMITER ;

-- =====================================================
-- Triggers (Optional)
-- =====================================================

-- Trigger to update seller verification count
DELIMITER //

CREATE TRIGGER after_certification_insert
AFTER INSERT ON seller_certifications
FOR EACH ROW
BEGIN
  -- You can add logic here if needed
  -- For example, auto-verify sellers with 3+ certifications
  DECLARE cert_count INT;
  
  SELECT COUNT(*) INTO cert_count
  FROM seller_certifications
  WHERE seller_id = NEW.seller_id;
  
  IF cert_count >= 3 THEN
    UPDATE sellers
    SET verification_status = 'pending'
    WHERE id = NEW.seller_id AND verification_status = 'pending';
  END IF;
END //

DELIMITER ;

-- =====================================================
-- Database Permissions (Run as root)
-- =====================================================

/*
-- Create dedicated application user (recommended for production)
CREATE USER IF NOT EXISTS 'saffron_app'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON saffron_marketplace.* TO 'saffron_app'@'localhost';

-- Grant execute privilege for stored procedures
GRANT EXECUTE ON saffron_marketplace.* TO 'saffron_app'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
*/

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check tables
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE buyers;
DESCRIBE sellers;
DESCRIBE addresses;
DESCRIBE seller_certifications;

-- Check views
SHOW FULL TABLES WHERE table_type = 'VIEW';

-- Check stored procedures
SHOW PROCEDURE STATUS WHERE db = 'saffron_marketplace';

-- Check triggers
SHOW TRIGGERS;

-- =====================================================
-- End of Schema
-- =====================================================
