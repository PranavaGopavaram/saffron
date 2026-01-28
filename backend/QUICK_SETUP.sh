#!/bin/bash

echo "=================================="
echo "🌸 SAFFRON MARKETPLACE SETUP 🌸"
echo "=================================="
echo ""

# Step 1: Setup MySQL Database
echo "📦 STEP 1: Setting up MySQL database..."
echo ""
echo "Please enter your MySQL root password:"
read -s MYSQL_PASSWORD

echo ""
echo "Creating database and importing schema..."

mysql -u root -p"$MYSQL_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS saffron_marketplace;
USE saffron_marketplace;
SOURCE /Users/pranavagopavaram/work/saffron/backend/database/schema.sql;
SHOW TABLES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
else
    echo "❌ Database creation failed. Please check your MySQL password."
    exit 1
fi

echo ""
echo "=================================="
echo "📝 STEP 2: Updating .env file..."
echo "=================================="

# Update .env with root credentials
cat > /Users/pranavagopavaram/work/saffron/backend/.env << ENVEOF
# ===================================
# SERVER CONFIGURATION
# ===================================
PORT=3000
NODE_ENV=development

# ===================================
# DATABASE CONFIGURATION
# ===================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=$MYSQL_PASSWORD
DB_NAME=saffron_marketplace
DB_CONNECTION_LIMIT=10

# ===================================
# JWT AUTHENTICATION
# ===================================
JWT_SECRET=saffron-marketplace-secret-key-dev-2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ===================================
# FILE UPLOAD CONFIGURATION
# ===================================
MAX_FILE_SIZE=5242880
MAX_FILES=5
ALLOWED_FILE_TYPES=application/pdf
UPLOAD_DIR=./uploads/certifications

# ===================================
# CORS CONFIGURATION
# ===================================
FRONTEND_URL=http://localhost:4200
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# ===================================
# RATE LIMITING
# ===================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# ===================================
# SECURITY
# ===================================
BCRYPT_ROUNDS=12
ENVEOF

echo "✅ .env file updated!"

echo ""
echo "=================================="
echo "🚀 STEP 3: Starting backend server..."
echo "=================================="
echo ""

cd /Users/pranavagopavaram/work/saffron/backend

echo "Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "Starting server..."
    npm run dev
else
    echo "❌ Build failed"
    exit 1
fi
