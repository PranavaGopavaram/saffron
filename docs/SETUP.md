# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Git installed
- [ ] Text editor (VS Code recommended)

## Setup Steps (5 minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

**Edit `.env` file - REQUIRED CHANGES:**

```env
# Change this to your MySQL password
DB_PASSWORD=your_mysql_password

# Generate a secure secret (run the command below)
JWT_SECRET=paste_generated_secret_here
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE saffron_marketplace;
USE saffron_marketplace;

# Import schema
source database/schema.sql;

# Exit MySQL
exit;
```

Or one-line command:
```bash
mysql -u root -p saffron_marketplace < database/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
=== Starting Saffron Marketplace Backend ===

Testing database connection...
✓ Database connected successfully!

✓ Environment configuration validated successfully

Starting HTTP server...
✓ Server started successfully!

  Environment:     development
  Port:            3000
  Database:        saffron_marketplace
  API Base:        http://localhost:3000/api
  Register:        http://localhost:3000/api/auth/register
  Login:           http://localhost:3000/api/auth/login

✓ Ready to accept connections
```

### 5. Test the API

Open browser or use curl:

```bash
# Test server
curl http://localhost:3000/test

# Test database connection
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/health
```

## Quick Test: Register a User

**Buyer Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "confirmPassword": "Test123!",
    "phone": "555-0000",
    "role": "buyer",
    "companyName": "Test Company",
    "shippingAddress": {
      "street": "123 Test St",
      "city": "TestCity",
      "state": "TestState",
      "zip_code": "12345",
      "country": "USA"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "fullName": "Test User",
      "role": "buyer",
      "createdAt": "2026-01-23T..."
    }
  }
}
```

## Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'saffron_marketplace';"
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID)
kill -9 PID

# Or change port in .env
PORT=3001
```

### Module Not Found Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors
```bash
# Build and check errors
npm run build
```

## Next Steps

1. **Test with Postman** - Import collection from `postman/` (when available)
2. **Read Documentation** - See `README.md` for full API documentation
3. **Connect Frontend** - Update Angular app to use backend API
4. **Add Features** - Products, orders, payments, etc.

## Available Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests (when implemented)
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # TypeScript interfaces
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.ts        # Entry point
├── database/
│   └── schema.sql       # Database schema
├── uploads/             # File uploads directory
├── .env                 # Environment variables (create from .env.example)
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## Common Tasks

### Add New Route
1. Create controller in `src/controllers/`
2. Add route in `src/routes/`
3. Add validation in `src/utils/validators.ts`
4. Test with Postman/curl

### Add Database Table
1. Update `database/schema.sql`
2. Run migration: `mysql -u root -p saffron_marketplace < database/schema.sql`
3. Create TypeScript interface in `src/models/`

### Add Middleware
1. Create file in `src/middleware/`
2. Export middleware function
3. Add to route or app-level in `server.ts`

## Getting Help

- **Documentation:** See `README.md` for detailed docs
- **API Reference:** See API Documentation section in README
- **Database Schema:** See `database/schema.sql`
- **Issues:** Check existing issues or create new one

## Ready to Code!

You're all set! The backend is running at `http://localhost:3000`

Start building features:
- User profiles
- Product management
- Shopping cart
- Orders
- Payments
- Admin panel

Happy coding! 🚀
