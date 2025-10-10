# Invoicely Backend API

Backend API for Invoicely - Invoice Management System

## 🚀 Features

- **Authentication**: User signup and login with JWT
- **Invoice Management**: Full CRUD operations for invoices
- **Invoice Items**: Support for multiple items per invoice
- **File Upload**: Logo upload for invoices
- **Database**: PostgreSQL with Drizzle ORM

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials and JWT secret

4. Run database migrations:
```bash
npm run db:push
```

## 🏃‍♂️ Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/google/success` - Google OAuth success (protected)

### Invoices
All invoice endpoints require authentication (Bearer token)

- `GET /api/invoices` - Get all user's invoices
- `POST /api/invoices` - Create a new invoice
- `GET /api/invoices/:id` - Get invoice by ID
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Assets
All asset endpoints require authentication (Bearer token)

- `POST /api/assets/upload` - Upload logo (multipart/form-data, field: "logo")
- `DELETE /api/assets/:filename` - Delete uploaded file

## 📦 Database Schema

### Users Table
- id (serial, primary key)
- login (varchar)
- gmail (varchar, unique)
- password (varchar, nullable for Google OAuth users)
- googleId (varchar, unique, nullable)
- profilePicture (text, nullable)
- createdAt (timestamp)

### Invoices Table
- id (serial, primary key)
- userId (integer, foreign key)
- Company details (logo, name, address)
- Client details (name, address)
- Invoice details (currency, theme, serial number, etc.)
- createdAt (timestamp)

### Invoice Items Table
- id (serial, primary key)
- invoiceId (integer, foreign key)
- itemName (varchar)
- description (text)
- quantity (integer)
- price (integer)

## 🔧 Database Commands

Generate migrations:
```bash
npm run db:generate
```

Push schema to database:
```bash
npm run db:push
```

Open Drizzle Studio:
```bash
npm run db:studio
```

## 🔐 Authentication

### JWT Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Google OAuth 2.0
The API supports Google OAuth for seamless user authentication:

1. **Setup Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

2. **Environment Variables:**
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret
   - `GOOGLE_CALLBACK_URL` - OAuth callback URL
   - `FRONTEND_URL` - Your frontend URL for redirects

3. **OAuth Flow:**
   - User clicks "Sign in with Google" (redirects to `/api/auth/google`)
   - User authenticates with Google
   - Google redirects to `/api/auth/google/callback`
   - Backend creates/updates user and generates JWT
   - User is redirected to frontend with token: `${FRONTEND_URL}/auth/callback?token=<jwt-token>`

## 📝 Request/Response Examples

### Create Invoice
```json
POST /api/invoices
{
  "companyName": "ACME Corp",
  "companyAddress": "123 Business St",
  "clientName": "John Doe",
  "clientAddress": "456 Client Ave",
  "currency": "USD",
  "theme": "light",
  "serialNumber": "INV-001",
  "items": [
    {
      "itemName": "Web Development",
      "description": "Frontend development",
      "quantity": 10,
      "price": 5000
    }
  ]
}
```

## 📄 License

ISC

