# Saffron Marketplace Backend

Node.js + Express + TypeScript backend API for the Saffron Marketplace application.

## Features

- **Authentication System:** JWT-based authentication with dual-role support (buyers/sellers)
- **File Uploads:** Multer-based PDF upload handling for seller certifications
- **Security:** Helmet, CORS, bcrypt password hashing, input validation
- **Database:** MySQL with connection pooling
- **TypeScript:** Fully typed codebase with strict mode

## Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL 8.0+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt (12 rounds)
- **File Uploads:** multer (PDF only, 5MB max)
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   └── database.ts         # MySQL connection pool
│   ├── controllers/
│   │   └── auth.controller.ts  # Authentication request handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification
│   │   ├── validate.middleware.ts # Validation error handler
│   │   └── upload.middleware.ts   # File upload configuration
│   ├── models/
│   │   └── user.model.ts       # TypeScript interfaces
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication routes
│   │   └── index.ts            # Main router
│   ├── services/
│   │   └── auth.service.ts     # Authentication business logic
│   ├── utils/
│   │   └── validators.ts       # Validation rules
│   └── server.ts               # Application entry point
├── uploads/
│   └── certifications/         # Uploaded certification files
├── database/
│   └── schema.sql              # Database schema
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── nodemon.json                # Nodemon configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=saffron_marketplace
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=your_64_character_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
MAX_FILES=5
UPLOAD_DIR=./uploads/certifications
ALLOWED_FILE_TYPES=application/pdf

# CORS Configuration
FRONTEND_URL=http://localhost:4200
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# Security
BCRYPT_ROUNDS=12
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Database Setup

Create the MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE saffron_marketplace;
USE saffron_marketplace;
source database/schema.sql;
```

Or import directly:

```bash
mysql -u root -p saffron_marketplace < database/schema.sql
```

### 4. Create Upload Directory

```bash
mkdir -p uploads/certifications
```

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start at `http://localhost:3000` with the following endpoints:

- `http://localhost:3000/test` - Server test endpoint
- `http://localhost:3000/health` - Database health check
- `http://localhost:3000/api/health` - API health check
- `http://localhost:3000/api/auth/register` - User registration
- `http://localhost:3000/api/auth/login` - User login

### Production Mode

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Documentation

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /api/auth/register`

**For Buyers (JSON):**
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "555-0123",
  "role": "buyer",
  "companyName": "Acme Restaurant",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "California",
    "zip_code": "90001",
    "country": "USA"
  }
}
```

**For Sellers (multipart/form-data):**
```http
POST /api/auth/register
Content-Type: multipart/form-data

fullName=Jane Smith
email=jane@example.com
password=SecurePass456!
confirmPassword=SecurePass456!
phone=555-0456
role=seller
businessName=Premium Saffron Co
taxId=TAX-123456
saffronSource=Kashmir, India - Direct from organic farms
businessAddress[street]=456 Business Ave
businessAddress[city]=New York
businessAddress[state]=New York
businessAddress[zip_code]=10001
businessAddress[country]=USA
certifications=@/path/to/cert1.pdf
certifications=@/path/to/cert2.pdf
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "buyer",
      "createdAt": "2026-01-23T08:00:00.000Z"
    }
  }
}
```

**Error Response (409 Conflict - Duplicate Email):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Error Response (400 Bad Request - Validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

#### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "buyer",
      "createdAt": "2026-01-23T08:00:00.000Z"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 3. Health Check

**Endpoint:** `GET /api/health`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-01-23T08:00:00.000Z"
}
```

### Protected Routes (Future)

To access protected routes, include the JWT token in the Authorization header:

```http
GET /api/protected-endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

### Tables

- **users** - Core authentication (id, email, password_hash, role, full_name, phone, status, email_verified, last_login)
- **buyers** - Buyer-specific data (user_id, company_name)
- **sellers** - Seller-specific data (user_id, business_name, tax_id, saffron_source, verification_status)
- **addresses** - Multi-purpose addresses (user_id, type, street, city, state, zip_code, country, is_default)
- **seller_certifications** - Uploaded certification files (seller_id, file_name, file_path, file_size, mime_type)

See `database/schema.sql` for complete schema with indexes, views, and stored procedures.

## Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password validation (min 6 characters)
- Confirmation password matching

### JWT Authentication
- 24-hour token expiration
- Secure secret key (min 32 characters)
- Payload includes: id, email, role

### File Upload Security
- PDF files only
- 5MB max file size
- 5 files maximum per upload
- Unique file naming to prevent collisions
- Stored outside web root

### Input Validation
- Email format validation
- Required field validation
- Conditional validation based on user role
- SQL injection protection (parameterized queries)

### HTTP Security
- Helmet.js security headers
- CORS with whitelist
- Rate limiting (planned)
- Request size limits

### Database Security
- Connection pooling
- Transaction support for data consistency
- Foreign key constraints
- Prepared statements

## Testing

### Manual Testing with cURL

**Register Buyer:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Pass123!",
    "confirmPassword": "Pass123!",
    "phone": "555-0000",
    "role": "buyer",
    "shippingAddress": {
      "street": "123 Test St",
      "city": "TestCity",
      "state": "TestState",
      "zip_code": "12345",
      "country": "USA"
    }
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Pass123!"
  }'
```

### Testing with Postman

Import the Postman collection from `postman/` directory (if available).

**Test suites include:**
- Health checks (3 tests)
- Buyer registration (4 tests)
- Seller registration (6 tests)
- Login functionality (6 tests)
- JWT token verification (1 test)

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (registration success)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## Development Notes

### Code Style
- TypeScript strict mode enabled
- ES2020 target
- CommonJS modules
- 2-space indentation

### Database Transactions
Registration uses database transactions to ensure data consistency:
1. Insert user
2. Insert role-specific data (buyer/seller)
3. Insert addresses
4. Upload files (sellers only)
5. Commit or rollback on error

### File Upload Flow
1. Multer middleware validates file type and size
2. Files saved with unique names (timestamp + random)
3. File metadata stored in `seller_certifications` table
4. Transaction ensures cleanup on failure

## Troubleshooting

### Database Connection Issues

**Error:** `ER_ACCESS_DENIED_ERROR`
- Check MySQL credentials in `.env`
- Verify user has access to database

**Error:** `ECONNREFUSED`
- Ensure MySQL is running
- Check DB_HOST and DB_PORT in `.env`

### JWT Issues

**Error:** `JsonWebTokenError: invalid token`
- Token expired (24 hours)
- JWT_SECRET mismatch
- Token format incorrect

### File Upload Issues

**Error:** `Only PDF files are allowed`
- Upload non-PDF file
- Check MIME type

**Error:** `File too large`
- File exceeds 5MB
- Adjust MAX_FILE_SIZE in `.env`

## Contributing

1. Create feature branch
2. Write tests
3. Implement feature
4. Test thoroughly
5. Submit pull request

## Future Enhancements

- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Rate limiting implementation
- [ ] Unit and integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Logging system (Winston)
- [ ] Monitoring and metrics
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

Private and proprietary.

## Contact

**Pranava Gopavaram**
- GitHub: [@PranavaGopavaram](https://github.com/PranavaGopavaram)
