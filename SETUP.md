# Setup Guide - Local Vendor Platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v20 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

### Optional (but recommended)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Postman** - [Download](https://www.postman.com/)

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/local-vendor-platform.git
cd local-vendor-platform
```

### 2. Database Setup

#### Option A: Local PostgreSQL

1. **Install PostgreSQL** (if not already installed)

2. **Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE vendor_platform;

# Create user (optional)
CREATE USER vendor_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;

# Exit psql
\q
```

#### Option B: Using Docker

```bash
cd database
docker-compose up -d
```

### 3. Backend Setup (Node.js/Express)

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# nano .env or use any text editor

# Run database migrations
npm run migrate

# Seed database with sample data (optional)
npm run seed

# Start development server
npm run dev
```

**Backend should now be running on**: `http://localhost:5000`

### 4. Frontend Setup (Next.js)

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local file
# nano .env.local

# Start development server
npm run dev
```

**Frontend should now be running on**: `http://localhost:3000`

### 5. ML Service Setup (Python/FastAPI)

Open another terminal window:

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start ML service
python app.py
```

**ML Service should now be running on**: `http://localhost:8000`

### 6. Verify Installation

Open your browser and check:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- ML Service: http://localhost:8000/docs (FastAPI docs)

## 🐳 Docker Setup (Alternative)

If you prefer using Docker for everything:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 🔧 Configuration Files

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://vendor_admin:your_password@localhost:5432/vendor_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# External APIs
WEATHER_API_KEY=your-openweathermap-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@vendorplatform.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### ML Service `.env`
```env
PORT=8000
MODEL_PATH=./models
DATABASE_URL=postgresql://vendor_admin:your_password@localhost:5432/vendor_platform
WEATHER_API_KEY=your-openweathermap-api-key
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

### ML Service Tests
```bash
cd ml-service
pytest
pytest --cov
```

## 🔍 Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error

1. Check if PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database exists: `psql -U postgres -l`

### Python Virtual Environment Issues

**Windows:**
```bash
python -m venv venv --clear
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Node Modules Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- Python
- Prisma
- Docker
- GitLens
- Thunder Client (API testing)

### Browser Extensions
- React Developer Tools
- Redux DevTools

## 📚 Next Steps

After successful setup:

1. Read the [API Documentation](docs/api/README.md)
2. Check [Architecture Overview](docs/architecture/README.md)
3. Review [Contributing Guidelines](CONTRIBUTING.md)
4. Start with Phase 1 features

## 🆘 Getting Help

- Check [FAQ](docs/FAQ.md)
- Open an issue on GitHub
- Contact: support@vendorplatform.com

---

**Setup Last Updated**: January 25, 2026
