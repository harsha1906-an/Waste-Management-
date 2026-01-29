# Quick Start Guide

## Step 1: Start PostgreSQL

### Option A: Using Windows Services
```powershell
# Start PostgreSQL service
net start postgresql-x64-15

# Or if you have a different version:
Get-Service -Name "postgresql*"
net start <service-name>
```

### Option B: Using pgAdmin
1. Open pgAdmin 4
2. Right-click on "PostgreSQL 15" server
3. Click "Connect Server"

### Option C: Check if PostgreSQL is running
```powershell
Get-Service -Name "postgresql*"
```

## Step 2: Create Database and User

```powershell
# Connect to PostgreSQL
psql -U postgres

# Run these commands in psql:
CREATE DATABASE vendor_platform;
CREATE USER vendor_admin WITH PASSWORD 'vendor_pass_2026';
GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;
\q
```

## Step 3: Load Database Schema

```powershell
cd "c:\Users\Harsha\Documents\Jeevan project"
psql -U vendor_admin -d vendor_platform -f database\schema.sql
```

## Step 4: Start Backend Server

```powershell
cd "c:\Users\Harsha\Documents\Jeevan project\backend"
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
✅ Database connected successfully
✅ All models synced
```

## Step 5: Test Authentication API (Optional)

Open a new terminal:
```powershell
cd "c:\Users\Harsha\Documents\Jeevan project\backend"
node test-auth.js
```

Should see:
```
🧪 Testing Authentication API
1️⃣ Testing Signup...
✅ Signup successful!
2️⃣ Testing Get Current User...
✅ Get current user successful!
... (8 tests total)
🎉 All tests passed!
```

## Step 6: Start Frontend

Open a new terminal:
```powershell
cd "c:\Users\Harsha\Documents\Jeevan project\frontend"
npm run dev
```

Expected output:
```
▲ Next.js 15.1.7
- Local: http://localhost:3000
✓ Starting...
✓ Ready in 2.5s
```

## Step 7: Test in Browser

1. Open http://localhost:3000
2. Click "Get Started Free"
3. Fill signup form and create account
4. You should be redirected to dashboard

## Troubleshooting

### PostgreSQL Not Starting
```powershell
# Find PostgreSQL services
Get-Service -Name "postgresql*"

# If service doesn't exist, PostgreSQL may need to be installed
# Download from: https://www.postgresql.org/download/windows/
```

### Database Connection Error
```
Error: password authentication failed for user "vendor_admin"
```
Solution: Reset the password or update `.env` file with correct credentials

### Port 5000 Already in Use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change PORT in backend/.env
```

### Port 3000 Already in Use
```powershell
# Frontend will automatically use port 3001 if 3000 is busy
# Or manually set port:
$env:PORT=3001
npm run dev
```

## Current Status

✅ Project structure created  
✅ All dependencies installed  
✅ TypeScript configuration fixed  
✅ Backend authentication system complete  
✅ Frontend login/signup pages created  
⏳ **Waiting for PostgreSQL to start**  
⏳ Database needs to be created  
⏳ Servers need to be started  

## Next Steps

Once servers are running:
1. Test authentication flow (signup → login → dashboard)
2. Implement product management features
3. Add sales recording functionality
4. Integrate ML predictions
5. Build analytics dashboard

---

**Need help?** Check [TESTING.md](./TESTING.md) for detailed testing instructions.
