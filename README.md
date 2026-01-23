# Saffron Marketplace

A full-stack marketplace application for buying and selling premium saffron. Built with Angular (frontend) and Node.js + Express + TypeScript (backend).

## Project Structure

```
saffron/
├── frontend/          # Angular application
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # TypeScript interfaces
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   └── server.ts     # Entry point
│   ├── uploads/          # File uploads directory
│   └── package.json
│
└── README.md          # This file
```

## Features

### Authentication System ✅
- **Dual-role registration:** Buyers and Sellers
- **Buyer registration:** Company info, shipping address
- **Seller registration:** Business info, tax ID, saffron source, certifications (PDF uploads)
- **JWT-based authentication:** 24-hour token expiration
- **Security:** Password hashing (bcrypt), helmet security headers, CORS protection

### Implemented Endpoints
- `POST /api/auth/register` - Register new user (buyer/seller)
- `POST /api/auth/login` - Login existing user
- `GET /api/health` - API health check
- `GET /health` - Database health check
- `GET /test` - Server test endpoint

## Tech Stack

### Frontend
- **Framework:** Angular 19
- **Language:** TypeScript
- **UI:** Feature-based architecture with lazy loading
- **Routing:** Angular Router

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **ORM:** mysql2 (raw SQL with connection pooling)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Uploads:** multer
- **Validation:** express-validator
- **Security:** helmet, cors

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your settings:**
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=saffron_marketplace
   JWT_SECRET=your_64_character_secret
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:4200
   ```

5. **Create MySQL database:**
   ```sql
   CREATE DATABASE saffron_marketplace;
   ```

6. **Run database migrations:**
   ```bash
   # Execute the SQL schema from backend/database/schema.sql
   mysql -u root -p saffron_marketplace < database/schema.sql
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:3000`

8. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   ng serve
   ```

   Application will open at `http://localhost:4200`

4. **Build for production:**
   ```bash
   ng build --configuration production
   ```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json (for buyers)
Content-Type: multipart/form-data (for sellers with files)
```

**Buyer Registration Body:**
```json
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

**Seller Registration (form-data):**
- fullName, email, password, confirmPassword, phone, role
- businessName, taxId, saffronSource
- businessAddress[street], businessAddress[city], etc.
- certifications (file, PDF only, max 5 files)

**Response (201):**
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
      "createdAt": "2026-01-23T..."
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
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
      "createdAt": "2026-01-23T..."
    }
  }
}
```

## Database Schema

### Tables
- **users** - Core user authentication (email, password_hash, role, status)
- **buyers** - Buyer-specific data (company_name)
- **sellers** - Seller-specific data (business_name, tax_id, saffron_source, verification_status)
- **addresses** - Multi-purpose addresses (shipping, business)
- **seller_certifications** - Uploaded certification files

See `backend/database/schema.sql` for complete schema.

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 24-hour expiration
- Helmet.js security headers
- CORS protection with whitelist
- Input validation with express-validator
- File upload restrictions (PDF only, 5MB max)
- SQL injection protection (parameterized queries)
- Database transactions for data consistency

## Development Status

### Completed ✅
- Database schema design
- Backend project setup
- Authentication service (register, login)
- JWT token generation and verification
- File upload handling (seller certifications)
- Input validation and error handling
- Security middleware (helmet, cors)
- Frontend project structure

### In Progress 🔄
- Frontend authentication UI
- Protected routes
- User profile management

### Planned 📋
- Product listing and management
- Shopping cart functionality
- Order processing
- Payment integration
- Seller verification system
- Admin dashboard
- Email notifications
- Search and filtering

## Testing

### Backend Testing with Postman
Import the Postman collection from `backend/postman/` directory.

**Available test suites:**
- Health checks (3 tests)
- Buyer registration (4 tests)
- Seller registration (6 tests)
- Login functionality (6 tests)
- JWT token verification (1 test)

**Total: 20 automated tests**

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
ng test
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is private and proprietary.

## Authors

- **Pranava Gopavaram** - Initial work

## Acknowledgments

- Angular team for the excellent framework
- Express.js community
- MySQL team
