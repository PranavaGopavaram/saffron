-- Saffron Marketplace Database Schema
-- MySQL 8.0+
-- Updated: February 5, 2026
-- Complete schema with 14 tables for full e-commerce platform

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
  role ENUM('buyer', 'seller') NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status ENUM('active', 'pending', 'suspended') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
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
  tax_id VARCHAR(100) NOT NULL,
  saffron_source TEXT NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
  type ENUM('shipping', 'business') NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Seller Certifications Table (File uploads with enhanced metadata)
-- =====================================================
CREATE TABLE seller_certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL COMMENT 'File size in bytes',
  mime_type VARCHAR(50) DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certification_type VARCHAR(100),
  issuing_body VARCHAR(255),
  issue_date DATE,
  certificate_document_url VARCHAR(500),
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_by_admin INT,
  verification_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Products Table (Generic products - deprecated in favor of saffron_products)
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
  image_url_1 VARCHAR(500) COMMENT 'Primary product image',
  image_url_2 VARCHAR(500) COMMENT 'Second product image',
  image_url_3 VARCHAR(500) COMMENT 'Third product image',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_price (price_per_gram),
  INDEX idx_grade (grade),
  INDEX idx_origin (origin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Saffron Products Table (Specialized table for saffron with quality metrics)
-- =====================================================
CREATE TABLE saffron_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  origin VARCHAR(100),
  grade CHAR(1),
  color_rating INT CHECK (color_rating BETWEEN 1 AND 10),
  aroma_score INT CHECK (aroma_score BETWEEN 1 AND 10),
  iso_certification BOOLEAN DEFAULT FALSE,
  moisture_level DECIMAL(5, 2),
  images JSON,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_status (status),
  INDEX idx_origin (origin),
  INDEX idx_grade (grade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Product Variants Table (Different weights/packages for same product)
-- =====================================================
CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  weight_grams INT NOT NULL,
  package_type VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  sku VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES saffron_products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_sku (sku),
  INDEX idx_stock (stock_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Shopping Carts Table (Buyer's shopping cart items)
-- =====================================================
CREATE TABLE shopping_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (buyer_id, variant_id),
  INDEX idx_buyer_id (buyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Orders Table (Customer orders with payment tracking)
-- =====================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL,
  order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  shipping_address_id INT,
  shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
  delivery_date_estimated DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_order_number (order_number),
  INDEX idx_order_status (order_status),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Order Items Table (Individual items in each order)
-- =====================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_id INT NOT NULL,
  seller_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  item_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_variant_id (variant_id),
  INDEX idx_seller_id (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Payment Transactions Table (Payment history and gateway tracking)
-- =====================================================
CREATE TABLE payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  buyer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_gateway VARCHAR(50),
  transaction_reference VARCHAR(255),
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_transaction_ref (transaction_reference),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Reviews Table (Product reviews by buyers)
-- =====================================================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  authenticity_verified BOOLEAN DEFAULT FALSE,
  would_recommend BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES saffron_products(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_seller_id (seller_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Seller Reviews Table (Seller ratings by buyers)
-- =====================================================
CREATE TABLE seller_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  buyer_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
  INDEX idx_seller_id (seller_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_sellers_verification ON sellers(verification_status, created_at);
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default);
CREATE INDEX idx_orders_buyer_status ON orders(buyer_id, order_status);
CREATE INDEX idx_order_items_order_seller ON order_items(order_id, seller_id);
CREATE INDEX idx_shopping_carts_buyer ON shopping_carts(buyer_id);
CREATE INDEX idx_product_variants_stock ON product_variants(product_id, stock_quantity);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);
CREATE INDEX idx_seller_reviews_seller ON seller_reviews(seller_id);

-- =====================================================
-- Database Views
-- =====================================================

-- View for complete buyer profile
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
  a.street AS business_street,
  a.city AS business_city,
  a.state AS business_state,
  a.zip_code AS business_zip,
  a.country AS business_country,
  COUNT(DISTINCT sc.id) AS certification_count,
  COUNT(DISTINCT sp.id) AS product_count,
  ROUND(AVG(sr.rating), 1) AS average_rating
FROM users u
JOIN sellers s ON u.id = s.user_id
LEFT JOIN addresses a ON u.id = a.user_id AND a.type = 'business' AND a.is_default = TRUE
LEFT JOIN seller_certifications sc ON s.id = sc.seller_id
LEFT JOIN saffron_products sp ON s.id = sp.seller_id
LEFT JOIN seller_reviews sr ON s.id = sr.seller_id
WHERE u.role = 'seller'
GROUP BY u.id, s.id, a.id;

-- View for order summary with seller and product info
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.id AS order_id,
  o.order_number,
  o.buyer_id,
  u.full_name AS buyer_name,
  o.total_amount,
  o.order_status,
  o.payment_status,
  o.created_at,
  o.updated_at,
  COUNT(DISTINCT oi.seller_id) AS seller_count,
  COUNT(oi.id) AS item_count
FROM orders o
JOIN buyers b ON o.buyer_id = b.id
JOIN users u ON b.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View for product availability and ratings
CREATE OR REPLACE VIEW product_availability AS
SELECT 
  sp.id,
  sp.product_name,
  sp.seller_id,
  u.full_name AS seller_name,
  sp.origin,
  sp.grade,
  sp.status,
  pv.sku,
  pv.weight_grams,
  pv.price,
  pv.stock_quantity,
  ROUND(AVG(r.rating), 1) AS average_rating,
  COUNT(r.id) AS review_count
FROM saffron_products sp
JOIN sellers s ON sp.seller_id = s.id
JOIN users u ON s.user_id = u.id
LEFT JOIN product_variants pv ON sp.id = pv.product_id
LEFT JOIN reviews r ON sp.id = r.product_id
GROUP BY sp.id, pv.id;

-- =====================================================
-- Stored Procedures
-- =====================================================

DELIMITER //

-- Procedure to verify a seller
CREATE PROCEDURE verify_seller(IN seller_user_id INT)
BEGIN
  UPDATE sellers 
  SET 
    verification_status = 'verified'
  WHERE user_id = seller_user_id;
END //

-- Procedure to get seller statistics
CREATE PROCEDURE get_seller_stats(IN seller_id INT)
BEGIN
  SELECT 
    COUNT(DISTINCT sp.id) AS total_products,
    COUNT(DISTINCT oi.id) AS total_orders,
    COUNT(DISTINCT sr.id) AS total_reviews,
    ROUND(AVG(sr.rating), 1) AS average_rating,
    SUM(oi.subtotal) AS total_revenue
  FROM sellers s
  LEFT JOIN saffron_products sp ON s.id = sp.seller_id
  LEFT JOIN order_items oi ON s.id = oi.seller_id
  LEFT JOIN seller_reviews sr ON s.id = sr.seller_id
  WHERE s.id = seller_id;
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

-- Procedure to process order completion
CREATE PROCEDURE complete_order(IN order_id INT)
BEGIN
  UPDATE orders 
  SET 
    order_status = 'delivered',
    payment_status = 'completed',
    completed_at = NOW()
  WHERE id = order_id;
END //

DELIMITER ;

-- =====================================================
-- Triggers
-- =====================================================

DELIMITER //

-- Trigger to update product stock when item is added to cart
CREATE TRIGGER after_cart_add
AFTER INSERT ON shopping_carts
FOR EACH ROW
BEGIN
  -- Reservation logic could be added here if needed
  UPDATE product_variants
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.variant_id AND stock_quantity >= NEW.quantity;
END //

-- Trigger to restore stock when item is removed from cart
CREATE TRIGGER before_cart_remove
BEFORE DELETE ON shopping_carts
FOR EACH ROW
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE id = OLD.variant_id;
END //

-- Trigger to update order status when all items are delivered
CREATE TRIGGER after_order_item_update
AFTER UPDATE ON order_items
FOR EACH ROW
BEGIN
  DECLARE total_items INT;
  DECLARE delivered_items INT;
  
  SELECT COUNT(*) INTO total_items
  FROM order_items
  WHERE order_id = NEW.order_id;
  
  SELECT COUNT(*) INTO delivered_items
  FROM order_items
  WHERE order_id = NEW.order_id AND item_status = 'delivered';
  
  IF total_items = delivered_items THEN
    UPDATE orders
    SET order_status = 'delivered'
    WHERE id = NEW.order_id;
  END IF;
END //

DELIMITER ;

-- =====================================================
-- Sample Data (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample admin/test data
/*
-- Sample test buyer
INSERT INTO users (email, password_hash, role, full_name, phone, status, email_verified)
VALUES (
  'buyer@test.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.l1hZ8u',
  'buyer',
  'Test Buyer',
  '555-0001',
  'active',
  TRUE
);

-- Sample test seller
INSERT INTO users (email, password_hash, role, full_name, phone, status, email_verified)
VALUES (
  'seller@test.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr.l1hZ8u',
  'seller',
  'Test Seller',
  '555-0002',
  'active',
  TRUE
);
*/

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

-- Check all tables
-- SHOW TABLES;

-- Check table structures
-- DESCRIBE users;
-- DESCRIBE saffron_products;
-- DESCRIBE product_variants;
-- DESCRIBE orders;
-- DESCRIBE reviews;

-- Check views
-- SHOW FULL TABLES WHERE table_type = 'VIEW';

-- Check stored procedures
-- SHOW PROCEDURE STATUS WHERE db = 'saffron_marketplace';

-- Check triggers
-- SHOW TRIGGERS;

-- =====================================================
-- End of Schema
-- =====================================================
