#!/bin/bash

# Local Vendor Platform - Development Setup Script
# This script sets up the entire development environment

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Local Vendor Platform - Development Setup          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on Windows (Git Bash/WSL)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "${YELLOW}Detected Windows environment${NC}"
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo "${RED}✗${NC} Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check Python
if command_exists python || command_exists python3; then
    PYTHON_CMD=$(command_exists python3 && echo "python3" || echo "python")
    PYTHON_VERSION=$($PYTHON_CMD --version)
    echo "${GREEN}✓${NC} Python: $PYTHON_VERSION"
else
    echo "${RED}✗${NC} Python not found. Please install Python 3.11+"
    exit 1
fi

# Check PostgreSQL
if command_exists psql; then
    PSQL_VERSION=$(psql --version)
    echo "${GREEN}✓${NC} PostgreSQL: $PSQL_VERSION"
else
    echo "${YELLOW}!${NC} PostgreSQL client not found. Make sure PostgreSQL is installed."
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install Frontend dependencies
echo "📦 Installing Frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo "${RED}✗${NC} Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Install Backend dependencies
echo ""
echo "📦 Installing Backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✓${NC} Backend dependencies installed"
else
    echo "${RED}✗${NC} Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install ML Service dependencies
echo ""
echo "📦 Installing ML Service dependencies..."
cd ml-service
$PYTHON_CMD -m venv venv
if [ $IS_WINDOWS == true ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "${GREEN}✓${NC} ML Service dependencies installed"
else
    echo "${RED}✗${NC} Failed to install ML service dependencies"
    exit 1
fi
deactivate
cd ..

echo ""
echo "Setting up database..."
echo ""

# Check if database exists
DB_EXISTS=$(psql -U postgres -lqt | cut -d \| -f 1 | grep -w vendor_platform)
if [ -z "$DB_EXISTS" ]; then
    echo "Creating database..."
    psql -U postgres -c "CREATE DATABASE vendor_platform;"
    psql -U postgres -c "CREATE USER vendor_admin WITH PASSWORD 'vendor_pass_2026';"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;"
    echo "${GREEN}✓${NC} Database created"
else
    echo "${YELLOW}!${NC} Database already exists"
fi

# Run migrations
echo "Running database migrations..."
psql -U vendor_admin -d vendor_platform -f database/schema.sql
if [ $? -eq 0 ]; then
    echo "${GREEN}✓${NC} Database schema applied"
else
    echo "${RED}✗${NC} Failed to apply database schema"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   ✅ Setup Complete!                                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Terminal 3 - ML Service:"
echo "  cd ml-service && source venv/bin/activate && python app.py"
echo ""
echo "Or use Docker:"
echo "  docker-compose up"
echo ""
