USE saffron_marketplace;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reviews;
TRUNCATE TABLE seller_reviews;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE shopping_carts;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE saffron_products;
TRUNCATE TABLE products;
TRUNCATE TABLE seller_certifications;
TRUNCATE TABLE addresses;
TRUNCATE TABLE sellers;
TRUNCATE TABLE buyers;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, email, password_hash, role, full_name, phone, status, email_verified, created_at) VALUES
(1, 'john.buyer@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'buyer', 'John Smith', '555-0101', 'active', TRUE, '2025-06-01 10:00:00'),
(2, 'jane.buyer@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'buyer', 'Jane Doe', '555-0102', 'active', TRUE, '2025-07-15 14:30:00'),
(3, 'mike.buyer@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'buyer', 'Mike Johnson', '555-0103', 'active', TRUE, '2025-08-20 09:15:00'),
(4, 'sarah.buyer@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'buyer', 'Sarah Williams', '555-0104', 'active', TRUE, '2025-09-10 16:45:00');

INSERT INTO users (id, email, password_hash, role, full_name, phone, status, email_verified, created_at) VALUES
(5, 'persian.saffron@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'seller', 'Ali Hashemi', '555-0201', 'active', TRUE, '2025-01-15 08:00:00'),
(6, 'kashmir.gold@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'seller', 'Rajesh Kumar', '555-0202', 'active', TRUE, '2025-02-20 11:30:00'),
(7, 'spanish.azafran@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'seller', 'Carlos Martinez', '555-0203', 'active', TRUE, '2025-03-10 13:00:00'),
(8, 'greek.krokos@example.com', '$2b$10$YmqbM9/eiN2LaxovfpFUXu14hxX37oehXxcqyiTI5v1FZfA55Jir.', 'seller', 'Nikolaos Papadopoulos', '555-0204', 'active', TRUE, '2025-04-05 10:00:00');

INSERT INTO buyers (id, user_id, company_name, created_at) VALUES
(1, 1, 'Smith Culinary Supplies', '2025-06-01 10:00:00'),
(2, 2, NULL, '2025-07-15 14:30:00'),
(3, 3, 'Johnson Restaurant Group', '2025-08-20 09:15:00'),
(4, 4, 'Williams Spice Trading', '2025-09-10 16:45:00');

INSERT INTO sellers (id, user_id, business_name, tax_id, saffron_source, verification_status, created_at) VALUES
(1, 5, 'Persian Saffron Exports', 'IR-12345678', 'Direct sourcing from farms in Khorasan Province, Iran. Family-owned farms with 50+ years of experience.', 'verified', '2025-01-15 08:00:00'),
(2, 6, 'Kashmir Gold Saffron', 'IN-98765432', 'Premium saffron from the valleys of Kashmir, India. Handpicked at dawn for maximum potency.', 'verified', '2025-02-20 11:30:00'),
(3, 7, 'Azafran de La Mancha', 'ES-11223344', 'Traditional Spanish saffron from La Mancha region. PDO certified with centuries of heritage.', 'verified', '2025-03-10 13:00:00'),
(4, 8, 'Krokos Kozani Cooperative', 'GR-55667788', 'Greek saffron from Kozani region. PDO protected, organic farming methods.', 'verified', '2025-04-05 10:00:00');

INSERT INTO addresses (id, user_id, type, street, city, state, zip_code, country, is_default, created_at) VALUES
(1, 1, 'shipping', '123 Main Street', 'New York', 'NY', '10001', 'United States', TRUE, '2025-06-01 10:00:00'),
(2, 2, 'shipping', '456 Oak Avenue', 'Los Angeles', 'CA', '90001', 'United States', TRUE, '2025-07-15 14:30:00'),
(3, 3, 'shipping', '789 Pine Road', 'Chicago', 'IL', '60601', 'United States', TRUE, '2025-08-20 09:15:00'),
(4, 4, 'shipping', '321 Elm Street', 'Houston', 'TX', '77001', 'United States', TRUE, '2025-09-10 16:45:00'),
(5, 1, 'shipping', '100 Business Park', 'New York', 'NY', '10002', 'United States', FALSE, '2025-06-15 12:00:00');

INSERT INTO addresses (id, user_id, type, street, city, state, zip_code, country, is_default, created_at) VALUES
(6, 5, 'business', '15 Saffron Lane', 'Mashhad', 'Khorasan', '91735', 'Iran', TRUE, '2025-01-15 08:00:00'),
(7, 6, 'business', '22 Spice Market', 'Srinagar', 'Kashmir', '190001', 'India', TRUE, '2025-02-20 11:30:00'),
(8, 7, 'business', '45 Calle Azafran', 'Toledo', 'Castilla-La Mancha', '45001', 'Spain', TRUE, '2025-03-10 13:00:00'),
(9, 8, 'business', '8 Krokos Street', 'Kozani', 'West Macedonia', '50100', 'Greece', TRUE, '2025-04-05 10:00:00');

INSERT INTO saffron_products (id, seller_id, product_name, description, origin, grade, color_rating, aroma_score, iso_certification, moisture_level, images, status, created_at) VALUES

(1, 1, 'Super Negin Persian Saffron', 'The finest grade of Persian saffron with exceptionally long, deep red stigmas. Zero yellow or orange threads. Intense aroma and flavor perfect for paella, risotto, and traditional Persian dishes.', 'Iran - Khorasan', 'premium', 10, 10, TRUE, 5.50, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-01-20 09:00:00'),

(2, 1, 'Negin Persian Saffron', 'Premium grade Persian saffron with long stigmas and vibrant color. Excellent coloring strength and distinctive aroma. Ideal for everyday culinary use and special occasions.', 'Iran - Khorasan', 'premium', 9, 9, TRUE, 6.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-01-25 10:30:00'),

(3, 1, 'Sargol Persian Saffron', 'All-red saffron threads without any yellow style. Strong coloring power and aromatic profile. Best value for restaurants and commercial kitchens.', 'Iran - Khorasan', 'first', 8, 8, TRUE, 6.50, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-02-01 11:00:00'),

(4, 2, 'Mongra Kashmir Saffron', 'The crown jewel of Kashmiri saffron. Exceptionally thick stigmas with the highest crocin content. Known for its unique floral notes and medicinal properties.', 'India - Kashmir', 'premium', 10, 9, TRUE, 5.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-02-25 08:00:00'),

(5, 2, 'Lacha Kashmir Saffron', 'Traditional Kashmiri saffron with intact stigma and style. Beautiful presentation for gifting. Slightly milder flavor perfect for kahwa and desserts.', 'India - Kashmir', 'first', 8, 8, FALSE, 7.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-03-01 09:30:00'),

(6, 3, 'Coupe Grade Spanish Saffron', 'La Mancha PDO certified saffron. Pure red stigmas with exceptional coloring strength. The choice of professional chefs worldwide for authentic paella.', 'Spain - La Mancha', 'premium', 9, 9, TRUE, 5.50, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-03-15 10:00:00'),

(7, 3, 'Mancha Select Spanish Saffron', 'Hand-selected threads from the La Mancha harvest. Rich golden color and earthy aroma. Perfect for Mediterranean cuisine and baking.', 'Spain - La Mancha', 'first', 8, 8, TRUE, 6.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-03-20 11:30:00'),

(8, 4, 'Krokos Kozanis PDO Saffron', 'Protected Designation of Origin Greek saffron from Kozani. Unique terroir produces distinctive sweet and honey-like notes. Organically grown.', 'Greece - Kozani', 'premium', 9, 10, TRUE, 5.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop", "https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-04-10 09:00:00'),

(9, 4, 'Organic Greek Saffron', 'Certified organic saffron from small family farms. No pesticides or chemicals. Pure and natural with excellent potency.', 'Greece - Kozani', 'first', 8, 9, TRUE, 5.50, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-04-15 10:30:00'),

(10, 1, 'Pushal Persian Saffron', 'Traditional cut with small portion of yellow style attached. Excellent value with authentic Persian flavor. Popular for home cooking.', 'Iran - Khorasan', 'second', 7, 7, FALSE, 7.50, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-02-10 14:00:00'),

(11, 2, 'Gift Box Kashmir Saffron', 'Elegantly packaged Kashmiri saffron in a traditional wooden box. Perfect for gifting. Contains premium Mongra grade saffron.', 'India - Kashmir', 'premium', 10, 9, TRUE, 5.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-03-05 12:00:00'),

(12, 3, 'Bulk Spanish Saffron', 'Restaurant-grade Spanish saffron in bulk packaging. Consistent quality for commercial use. Excellent coloring and flavor.', 'Spain - La Mancha', 'first', 8, 8, TRUE, 6.00, '["https://images.unsplash.com/photo-1666849254544-3d03f24e821a?q=80&w=1649&auto=format&fit=crop"]', 'active', '2025-03-25 15:00:00');

INSERT INTO product_variants (id, product_id, weight_grams, package_type, price, stock_quantity, sku, created_at) VALUES

(1, 1, 1, 'Glass Vial', 2499, 100, 'PS-SN-1G-GV', '2025-01-20 09:00:00'),
(2, 1, 2, 'Glass Vial', 4799, 75, 'PS-SN-2G-GV', '2025-01-20 09:00:00'),
(3, 1, 5, 'Tin Container', 11499, 50, 'PS-SN-5G-TC', '2025-01-20 09:00:00'),
(4, 1, 10, 'Tin Container', 21999, 30, 'PS-SN-10G-TC', '2025-01-20 09:00:00'),
(5, 1, 25, 'Bulk Pack', 49999, 15, 'PS-SN-25G-BP', '2025-01-20 09:00:00'),

(6, 2, 1, 'Glass Vial', 1999, 120, 'PS-NG-1G-GV', '2025-01-25 10:30:00'),
(7, 2, 2, 'Glass Vial', 3799, 90, 'PS-NG-2G-GV', '2025-01-25 10:30:00'),
(8, 2, 5, 'Tin Container', 8999, 60, 'PS-NG-5G-TC', '2025-01-25 10:30:00'),
(9, 2, 10, 'Tin Container', 16999, 40, 'PS-NG-10G-TC', '2025-01-25 10:30:00'),

(10, 3, 1, 'Glass Vial', 1499, 150, 'PS-SG-1G-GV', '2025-02-01 11:00:00'),
(11, 3, 5, 'Tin Container', 6999, 80, 'PS-SG-5G-TC', '2025-02-01 11:00:00'),
(12, 3, 10, 'Tin Container', 12999, 50, 'PS-SG-10G-TC', '2025-02-01 11:00:00'),

(13, 4, 1, 'Glass Vial', 2899, 80, 'KS-MG-1G-GV', '2025-02-25 08:00:00'),
(14, 4, 2, 'Glass Vial', 5499, 60, 'KS-MG-2G-GV', '2025-02-25 08:00:00'),
(15, 4, 5, 'Tin Container', 12999, 40, 'KS-MG-5G-TC', '2025-02-25 08:00:00'),
(16, 4, 10, 'Tin Container', 24999, 25, 'KS-MG-10G-TC', '2025-02-25 08:00:00'),

(17, 5, 1, 'Glass Vial', 1799, 100, 'KS-LC-1G-GV', '2025-03-01 09:30:00'),
(18, 5, 2, 'Glass Vial', 3399, 70, 'KS-LC-2G-GV', '2025-03-01 09:30:00'),
(19, 5, 5, 'Tin Container', 7999, 45, 'KS-LC-5G-TC', '2025-03-01 09:30:00'),

(20, 6, 1, 'Glass Vial', 2199, 90, 'SS-CP-1G-GV', '2025-03-15 10:00:00'),
(21, 6, 2, 'Glass Vial', 4199, 65, 'SS-CP-2G-GV', '2025-03-15 10:00:00'),
(22, 6, 5, 'Tin Container', 9999, 45, 'SS-CP-5G-TC', '2025-03-15 10:00:00'),
(23, 6, 10, 'Tin Container', 18999, 30, 'SS-CP-10G-TC', '2025-03-15 10:00:00'),

(24, 7, 1, 'Glass Vial', 1599, 110, 'SS-MS-1G-GV', '2025-03-20 11:30:00'),
(25, 7, 5, 'Tin Container', 7499, 55, 'SS-MS-5G-TC', '2025-03-20 11:30:00'),

(26, 8, 1, 'Glass Vial', 2599, 70, 'GS-KK-1G-GV', '2025-04-10 09:00:00'),
(27, 8, 2, 'Glass Vial', 4999, 55, 'GS-KK-2G-GV', '2025-04-10 09:00:00'),
(28, 8, 5, 'Tin Container', 11999, 35, 'GS-KK-5G-TC', '2025-04-10 09:00:00'),

(29, 9, 1, 'Glass Vial', 2199, 85, 'GS-OG-1G-GV', '2025-04-15 10:30:00'),
(30, 9, 5, 'Tin Container', 9999, 40, 'GS-OG-5G-TC', '2025-04-15 10:30:00'),

(31, 10, 2, 'Glass Vial', 2299, 130, 'PS-PU-2G-GV', '2025-02-10 14:00:00'),
(32, 10, 5, 'Tin Container', 5499, 85, 'PS-PU-5G-TC', '2025-02-10 14:00:00'),
(33, 10, 10, 'Tin Container', 9999, 55, 'PS-PU-10G-TC', '2025-02-10 14:00:00'),

(34, 11, 2, 'Gift Box', 7999, 40, 'KS-GB-2G-GB', '2025-03-05 12:00:00'),
(35, 11, 5, 'Gift Box', 17999, 25, 'KS-GB-5G-GB', '2025-03-05 12:00:00'),

(36, 12, 25, 'Bulk Pack', 32999, 20, 'SS-BK-25G-BP', '2025-03-25 15:00:00'),
(37, 12, 50, 'Bulk Pack', 62999, 10, 'SS-BK-50G-BP', '2025-03-25 15:00:00'),
(38, 12, 100, 'Bulk Pack', 119999, 5, 'SS-BK-100G-BP', '2025-03-25 15:00:00');

INSERT INTO orders (id, buyer_id, order_number, total_amount, order_status, payment_status, shipping_address_id, shipping_cost, delivery_date_estimated, created_at, completed_at) VALUES
(1, 1, 'ORD-2025-0001', 45.98, 'delivered', 'completed', 1, 5.99, '2025-06-20', '2025-06-10 14:00:00', '2025-06-18 10:00:00'),
(2, 1, 'ORD-2025-0002', 159.98, 'delivered', 'completed', 1, 0.00, '2025-07-15', '2025-07-05 09:30:00', '2025-07-13 14:00:00'),
(3, 2, 'ORD-2025-0003', 84.98, 'delivered', 'completed', 2, 5.99, '2025-08-10', '2025-07-30 16:00:00', '2025-08-08 11:00:00'),
(4, 3, 'ORD-2025-0004', 299.99, 'delivered', 'completed', 3, 0.00, '2025-09-05', '2025-08-25 11:00:00', '2025-09-03 15:00:00'),
(5, 2, 'ORD-2025-0005', 69.99, 'delivered', 'completed', 2, 5.99, '2025-09-20', '2025-09-10 13:00:00', '2025-09-18 09:00:00'),
(6, 4, 'ORD-2025-0006', 199.99, 'delivered', 'completed', 4, 0.00, '2025-10-10', '2025-09-30 10:00:00', '2025-10-08 12:00:00'),
(7, 1, 'ORD-2025-0007', 109.99, 'delivered', 'completed', 1, 5.99, '2025-11-01', '2025-10-20 15:00:00', '2025-10-30 10:00:00'),
(8, 3, 'ORD-2025-0008', 74.99, 'shipped', 'completed', 3, 5.99, '2026-03-10', '2026-02-28 09:00:00', NULL),
(9, 4, 'ORD-2025-0009', 129.99, 'confirmed', 'completed', 4, 0.00, '2026-03-15', '2026-03-01 11:00:00', NULL),
(10, 2, 'ORD-2025-0010', 49.99, 'pending', 'pending', 2, 5.99, '2026-03-20', '2026-03-02 10:00:00', NULL),
(11, 1, 'ORD-2026-0011', 89.99, 'pending', 'completed', 1, 5.99, '2026-03-15', '2026-03-03 10:00:00', NULL),
(12, 1, 'ORD-2026-0012', 54.99, 'confirmed', 'completed', 1, 5.99, '2026-03-18', '2026-03-04 14:30:00', NULL),
(13, 1, 'ORD-2025-0013', 129.99, 'delivered', 'completed', 1, 0.00, '2025-12-20', '2025-12-10 09:00:00', '2025-12-18 14:00:00'),
(14, 1, 'ORD-2026-0014', 74.99, 'delivered', 'completed', 1, 5.99, '2026-01-15', '2026-01-05 11:00:00', '2026-01-13 10:00:00'),
(15, 1, 'ORD-2026-0015', 199.99, 'delivered', 'completed', 1, 0.00, '2026-02-10', '2026-02-01 16:00:00', '2026-02-08 12:00:00'),
(16, 1, 'ORD-2025-0016', 44.99, 'delivered', 'completed', 1, 5.99, '2025-11-20', '2025-11-10 08:00:00', '2025-11-18 09:00:00');

INSERT INTO order_items (id, order_id, variant_id, seller_id, quantity, unit_price, subtotal, item_status, created_at) VALUES
(1, 1, 1, 1, 2, 159, 3199, 'delivered', '2025-06-10 14:00:00'),
(2, 1, 6, 1, 1, 1299, 1299, 'delivered', '2025-06-10 14:00:00'),

(3, 2, 4, 1, 1, 1299, 1299, 'delivered', '2025-07-05 09:30:00'),
(4, 2, 7, 1, 1, 24.99, 24.99, 'delivered', '2025-07-05 09:30:00'),

(5, 3, 15, 2, 1, 84.99, 84.99, 'delivered', '2025-07-30 16:00:00'),

(6, 4, 5, 1, 1, 299.99, 299.99, 'delivered', '2025-08-25 11:00:00'),

(7, 5, 3, 1, 1, 69.99, 69.99, 'delivered', '2025-09-10 13:00:00'),

(8, 6, 36, 3, 1, 199.99, 199.99, 'delivered', '2025-09-30 10:00:00'),

(9, 7, 35, 2, 1, 109.99, 109.99, 'delivered', '2025-10-20 15:00:00'),

(10, 8, 28, 4, 1, 74.99, 74.99, 'shipped', '2026-02-28 09:00:00'),

(11, 9, 4, 1, 1, 129.99, 129.99, 'confirmed', '2026-03-01 11:00:00'),

(12, 10, 34, 2, 1, 49.99, 49.99, 'pending', '2026-03-02 10:00:00'),
(13, 11, 3, 1, 1, 69.99, 69.99, 'pending', '2026-03-03 10:00:00'),
(14, 11, 13, 2, 1, 18.99, 18.99, 'pending', '2026-03-03 10:00:00'),
(15, 12, 21, 3, 1, 27.99, 27.99, 'confirmed', '2026-03-04 14:30:00'),
(16, 12, 29, 4, 1, 13.99, 13.99, 'confirmed', '2026-03-04 14:30:00'),
(17, 13, 4, 1, 1, 129.99, 129.99, 'delivered', '2025-12-10 09:00:00'),
(18, 14, 28, 4, 1, 74.99, 74.99, 'delivered', '2026-01-05 11:00:00'),
(19, 15, 36, 3, 1, 199.99, 199.99, 'delivered', '2026-02-01 16:00:00'),
(20, 16, 11, 1, 1, 44.99, 44.99, 'delivered', '2025-11-10 08:00:00');

INSERT INTO reviews (id, order_id, product_id, buyer_id, seller_id, rating, title, comment, authenticity_verified, would_recommend, helpful_count, created_at) VALUES

(1, 1, 1, 1, 1, 5, 'Absolutely stunning quality!', 'This is the best saffron I have ever purchased. The color is incredibly vibrant, and the aroma fills the entire kitchen. Just a few threads transform my dishes. Worth every penny!', TRUE, TRUE, 24, '2025-06-20 10:00:00'),
(2, 2, 1, 1, 1, 5, 'Restaurant quality at home', 'I run a small catering business and this saffron has elevated my paella to a whole new level. Customers constantly ask what my secret is. Will definitely order again.', TRUE, TRUE, 18, '2025-07-15 14:00:00'),
(3, 4, 1, 3, 1, 5, 'Premium grade delivers', 'Bought the bulk pack for my restaurant. Consistent quality, amazing aroma, and the color release is phenomenal. Our saffron rice is now our signature dish.', TRUE, TRUE, 31, '2025-09-05 09:00:00'),
(4, 5, 1, 2, 1, 4, 'Great but expensive', 'Quality is undeniable - deep red threads with intense aroma. Only giving 4 stars because of the price point. For special occasions, absolutely. For everyday cooking, I go with a lower grade.', TRUE, TRUE, 12, '2025-09-20 11:00:00'),

(5, 1, 2, 1, 1, 5, 'Perfect everyday saffron', 'Not quite as intense as the Super Negin but still excellent quality. I use this for my weekly risotto and the results are always impressive. Great value.', TRUE, TRUE, 15, '2025-06-22 08:00:00'),
(6, 2, 2, 1, 1, 4, 'Very good quality', 'Slightly shorter threads than expected but the color and flavor are excellent. Good middle-ground between price and quality.', TRUE, TRUE, 8, '2025-07-17 10:00:00'),

(7, 3, 4, 2, 2, 5, 'Unique Kashmiri flavor', 'There is something special about Kashmiri saffron that Persian varieties dont have. More floral and honey-like. Made the most amazing kahwa with this. Highly recommend for tea lovers.', TRUE, TRUE, 22, '2025-08-12 14:00:00'),
(8, 7, 4, 1, 2, 5, 'Gift box presentation is beautiful', 'Bought this as a gift and kept one for myself. The wooden box is gorgeous and the saffron inside is top quality. Made biryani that tasted like heaven.', TRUE, TRUE, 19, '2025-11-02 09:00:00'),

(9, 6, 6, 4, 3, 5, 'Perfect for paella', 'Being Spanish myself, I am very particular about my saffron. This La Mancha PDO saffron is authentic and produces the perfect paella every time. Earthy notes are spot on.', TRUE, TRUE, 27, '2025-10-12 15:00:00'),

(10, 8, 8, 3, 4, 5, 'Discovered Greek saffron', 'I always bought Persian but decided to try Greek. What a pleasant surprise! The sweetness is unique and works beautifully in desserts. Now I rotate between origins.', TRUE, TRUE, 14, '2026-03-01 10:00:00');

INSERT INTO seller_reviews (id, seller_id, buyer_id, rating, comment, created_at) VALUES
(1, 1, 1, 5, 'Excellent seller! Fast shipping, beautiful packaging, and the quality matches the description perfectly. Will order again.', '2025-06-22 09:00:00'),
(2, 1, 3, 5, 'Professional and reliable. My bulk order arrived well-packaged with a certificate of authenticity. Great communication.', '2025-09-07 10:00:00'),
(3, 1, 2, 4, 'Good products but shipping took a bit longer than expected. Quality was excellent though.', '2025-09-22 14:00:00'),
(4, 2, 2, 5, 'Amazing Kashmiri saffron! The seller included detailed brewing instructions and origin information. Very thoughtful.', '2025-08-14 11:00:00'),
(5, 2, 1, 5, 'The gift packaging was stunning. Perfect for special occasions. Quality saffron from a quality seller.', '2025-11-03 08:00:00'),
(6, 3, 4, 5, 'Authentic Spanish saffron. The PDO certification gives confidence in the quality. Seller was very responsive to questions.', '2025-10-14 16:00:00'),
(7, 4, 3, 5, 'First time trying Greek saffron. The seller provided excellent information about the Kozani region and organic farming practices.', '2026-03-02 09:00:00');

INSERT INTO shopping_carts (buyer_id, variant_id, quantity, added_at) VALUES
(1, 13, 2, '2026-03-02 08:00:00'),
(1, 26, 1, '2026-03-02 08:15:00'),
(2, 3, 1, '2026-03-01 14:00:00'),
(3, 20, 3, '2026-03-02 09:00:00'),
(4, 35, 1, '2026-03-01 16:00:00');

INSERT INTO payment_transactions (id, order_id, buyer_id, amount, payment_method, payment_gateway, transaction_reference, status, created_at) VALUES
(1, 1, 1, 51.97, 'credit_card', 'stripe', 'txn_1234567890', 'success', '2025-06-10 14:05:00'),
(2, 2, 1, 159.98, 'credit_card', 'stripe', 'txn_2345678901', 'success', '2025-07-05 09:35:00'),
(3, 3, 2, 90.97, 'credit_card', 'stripe', 'txn_3456789012', 'success', '2025-07-30 16:05:00'),
(4, 4, 3, 299.99, 'credit_card', 'stripe', 'txn_4567890123', 'success', '2025-08-25 11:05:00'),
(5, 5, 2, 75.98, 'credit_card', 'stripe', 'txn_5678901234', 'success', '2025-09-10 13:05:00'),
(6, 6, 4, 199.99, 'credit_card', 'stripe', 'txn_6789012345', 'success', '2025-09-30 10:05:00'),
(7, 7, 1, 115.98, 'credit_card', 'stripe', 'txn_7890123456', 'success', '2025-10-20 15:05:00'),
(8, 8, 3, 80.98, 'credit_card', 'stripe', 'txn_8901234567', 'success', '2026-02-28 09:05:00'),
(9, 9, 4, 129.99, 'credit_card', 'stripe', 'txn_9012345678', 'success', '2026-03-01 11:05:00'),
(10, 11, 1, 95.98, 'credit_card', 'stripe', 'txn_1112131415', 'success', '2026-03-03 10:05:00'),
(11, 12, 1, 60.98, 'credit_card', 'stripe', 'txn_1213141516', 'success', '2026-03-04 14:35:00'),
(12, 13, 1, 129.99, 'credit_card', 'stripe', 'txn_1314151617', 'success', '2025-12-10 09:05:00'),
(13, 14, 1, 80.98, 'credit_card', 'stripe', 'txn_1415161718', 'success', '2026-01-05 11:05:00'),
(14, 15, 1, 199.99, 'credit_card', 'stripe', 'txn_1516171819', 'success', '2026-02-01 16:05:00'),
(15, 16, 1, 50.98, 'credit_card', 'stripe', 'txn_1617181920', 'success', '2025-11-10 08:05:00');

INSERT INTO seller_certifications (id, seller_id, file_name, file_path, file_size, mime_type, certification_type, issuing_body, issue_date, verification_status, created_at) VALUES
(1, 1, 'iso_3632_certificate.pdf', '/uploads/certifications/seller_1/iso_3632.pdf', 245000, 'application/pdf', 'ISO 3632-1:2011', 'International Organization for Standardization', '2024-06-15', 'verified', '2025-01-15 08:30:00'),
(2, 1, 'organic_certificate.pdf', '/uploads/certifications/seller_1/organic.pdf', 180000, 'application/pdf', 'Organic Certification', 'USDA Organic', '2024-08-20', 'verified', '2025-01-15 08:35:00'),
(3, 2, 'gi_kashmir_certificate.pdf', '/uploads/certifications/seller_2/gi_kashmir.pdf', 320000, 'application/pdf', 'Geographical Indication', 'Government of India', '2024-05-10', 'verified', '2025-02-20 11:45:00'),
(4, 3, 'pdo_mancha_certificate.pdf', '/uploads/certifications/seller_3/pdo_mancha.pdf', 290000, 'application/pdf', 'Protected Designation of Origin', 'European Union', '2024-03-22', 'verified', '2025-03-10 13:15:00'),
(5, 3, 'iso_3632_certificate.pdf', '/uploads/certifications/seller_3/iso_3632.pdf', 250000, 'application/pdf', 'ISO 3632-1:2011', 'International Organization for Standardization', '2024-07-08', 'verified', '2025-03-10 13:20:00'),
(6, 4, 'pdo_kozani_certificate.pdf', '/uploads/certifications/seller_4/pdo_kozani.pdf', 275000, 'application/pdf', 'Protected Designation of Origin', 'European Union', '2024-04-18', 'verified', '2025-04-05 10:15:00'),
(7, 4, 'organic_eu_certificate.pdf', '/uploads/certifications/seller_4/organic_eu.pdf', 195000, 'application/pdf', 'EU Organic Certification', 'European Commission', '2024-09-30', 'verified', '2025-04-05 10:20:00');

SELECT 'Seed data loaded successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM saffron_products;
SELECT COUNT(*) AS total_variants FROM product_variants;
SELECT COUNT(*) AS total_orders FROM orders;
SELECT COUNT(*) AS total_reviews FROM reviews;
