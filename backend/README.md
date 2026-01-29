# Backend - Vendor Platform API

Express.js backend API server for the Local Vendor Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models (Sequelize)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.ts        # Express app entry point
├── tests/               # Test files
├── .env                 # Environment variables
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Technologies

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15 with Sequelize ORM
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors
- **Logging**: morgan

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### POST `/auth/signup`
Register new user (vendor/customer)

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "securePassword123",
  "businessName": "My Store",
  "location": "Mumbai, India",
  "phone": "+91 9876543210",
  "role": "vendor"
}
```

#### POST `/auth/login`
Login with credentials

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "vendor@example.com",
    "role": "vendor",
    "businessName": "My Store"
  },
  "token": "jwt-token-here"
}
```

#### GET `/auth/me`
Get current user info (requires authentication)

### Product Endpoints

#### GET `/products`
Get all products for authenticated vendor

Query params: `?category=fruits&search=apple&inStock=true`

#### POST `/products`
Create new product (vendor only)

#### GET `/products/:id`
Get single product

#### PUT `/products/:id`
Update product (vendor only)

#### DELETE `/products/:id`
Delete product (vendor only)

#### PATCH `/products/:id/stock`
Update stock quantity

### Sales Endpoints

#### GET `/sales`
Get sales history

#### POST `/sales`
Record new sale

#### GET `/sales/stats`
Get sales statistics

### Prediction Endpoints

#### GET `/predictions/:productId`
Get demand forecast for product

#### POST `/predictions/generate`
Generate new predictions

### Waste Endpoints

#### GET `/waste`
Get waste logs

#### POST `/waste`
Log wasted product

#### GET `/waste/stats`
Get waste statistics

## 🔐 Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Database Schema

### Users Table
- id (UUID, PK)
- email (unique)
- password_hash
- role (vendor/customer/admin)
- business_name
- location
- phone
- created_at
- updated_at

### Products Table
- id (UUID, PK)
- vendor_id (FK → users.id)
- name
- category
- price
- stock_quantity
- unit
- expiry_date
- image_url
- low_stock_threshold
- created_at
- updated_at

### Sales Table
- id (UUID, PK)
- vendor_id (FK)
- product_id (FK)
- quantity
- total_amount
- payment_method
- sale_date
- created_at

### Predictions Table
- id (UUID, PK)
- product_id (FK)
- forecast_date
- predicted_quantity
- confidence_level
- model_used
- created_at

### Waste_Logs Table
- id (UUID, PK)
- product_id (FK)
- vendor_id (FK)
- quantity_wasted
- reason
- value_lost
- notes
- logged_at

## 🚀 Deployment

### Environment Variables

Set these in production:

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=your-secure-secret-key
CORS_ORIGINS=https://yourdomain.com
```

### Running in Production

```bash
npm run build
npm start
```

---

**Last Updated**: January 25, 2026
