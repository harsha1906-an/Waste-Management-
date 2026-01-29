# Testing Authentication System

This guide will help you test the complete authentication flow.

## Prerequisites

1. **PostgreSQL**: Make sure PostgreSQL is running
2. **Node.js**: Version 18+ installed
3. **Dependencies**: All packages installed

## Step 1: Setup Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Run these SQL commands:
CREATE DATABASE vendor_platform;
CREATE USER vendor_admin WITH PASSWORD 'vendor_pass_2026';
GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;
\q

# Load the schema
psql -U vendor_admin -d vendor_platform -f database/schema.sql
```

## Step 2: Start Backend Server

```powershell
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Database connected successfully
✓ All models synced
```

## Step 3: Test Backend API (Optional)

Open a new terminal and run:

```powershell
cd backend
node test-auth.js
```

This will test all 8 authentication endpoints:
1. ✅ Signup
2. ✅ Get Current User
3. ✅ Login
4. ✅ Update Profile
5. ✅ Change Password
6. ✅ Login with New Password
7. ✅ Invalid Login (should fail)
8. ✅ Unauthorized Access (should fail)

## Step 4: Start Frontend

Open a new terminal:

```powershell
cd frontend
npm run dev
```

Expected output:
```
Ready on http://localhost:3000
```

## Step 5: Test Frontend Authentication

1. **Open Browser**: Navigate to http://localhost:3000

2. **Landing Page**: You should see the home page with:
   - "Reduce Waste. Increase Profits" heading
   - "Get Started Free" and "Sign In" buttons
   - Feature cards showing demand forecasting, analytics, and waste reduction

3. **Test Signup Flow**:
   - Click "Get Started Free" or navigate to http://localhost:3000/signup
   - Fill in the form:
     - Email: `your@email.com`
     - Password: `Test@1234` (must have uppercase, lowercase, and number)
     - Confirm Password: `Test@1234`
     - Role: Select "Vendor (Seller)"
     - Business Name: `My Test Store`
     - Location: `Mumbai`
     - Phone: `+919876543210`
   - Check "I agree to Terms and Conditions"
   - Click "Create Account"
   - Should redirect to `/dashboard`

4. **Verify Dashboard**:
   - Should see welcome message with your email
   - Should see placeholder stats (Today's Sales, Total Products, Low Stock Items)
   - Should see Quick Actions grid
   - Should see "Logout" button in header

5. **Test Logout**:
   - Click "Logout" button
   - Should redirect to `/login`
   - Try navigating to `/dashboard` - should redirect back to `/login`

6. **Test Login Flow**:
   - On login page, enter:
     - Email: `your@email.com`
     - Password: `Test@1234`
   - Click "Sign In"
   - Should redirect to `/dashboard`
   - Should see your account information

7. **Test Remember Me** (Optional):
   - Logout
   - Login again with "Remember me" checked
   - Close browser
   - Reopen and navigate to http://localhost:3000
   - Should automatically redirect to dashboard

## Step 6: Test Error Handling

1. **Invalid Login**:
   - Try logging in with wrong password
   - Should see error message: "Invalid email or password"

2. **Duplicate Email**:
   - Try signing up with an email that already exists
   - Should see error message: "User already exists with this email"

3. **Weak Password**:
   - Try signing up with password "test123"
   - Should see validation error

4. **Unauthorized Access**:
   - Logout
   - Try navigating directly to `/dashboard`
   - Should redirect to `/login`

## Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running:
```powershell
# Start PostgreSQL service
net start postgresql-x64-15
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill the process using port 5000:
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### JWT Token Error
```
Error: JWT_SECRET is not defined
```
**Solution**: Make sure `.env` file exists in backend folder with JWT_SECRET set.

### Axios CORS Error (Frontend)
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**: 
1. Make sure backend server is running
2. Check CORS_ORIGINS in `.env` includes `http://localhost:3000`
3. Restart backend server

## API Endpoints Reference

### Public Endpoints (No Auth Required)
- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Login with credentials

### Protected Endpoints (JWT Token Required)
- `GET /api/v1/auth/me` - Get current user info
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password

### Request Examples

**Signup:**
```json
POST /api/v1/auth/signup
{
  "email": "vendor@example.com",
  "password": "Secure@123",
  "role": "vendor",
  "businessName": "My Store",
  "location": "Mumbai",
  "phone": "+919876543210"
}
```

**Login:**
```json
POST /api/v1/auth/login
{
  "email": "vendor@example.com",
  "password": "Secure@123"
}
```

**Get Current User:**
```
GET /api/v1/auth/me
Headers:
  Authorization: Bearer <your-jwt-token>
```

## Next Steps

After authentication is working:

1. ✅ **Phase 1 Complete**: Authentication system
2. ⏭️ **Phase 2**: Product Management (Add/Edit/Delete products)
3. ⏭️ **Phase 3**: Sales Recording (Record daily sales)
4. ⏭️ **Phase 4**: ML Predictions (Demand forecasting)
5. ⏭️ **Phase 5**: Waste Tracking & Analytics

## Success Criteria

✅ Users can sign up with email and password  
✅ Users can login and receive JWT token  
✅ JWT token is stored in localStorage  
✅ Protected routes require authentication  
✅ Users can update their profile  
✅ Users can change their password  
✅ Logout clears authentication state  
✅ Invalid credentials show proper error messages  
✅ Strong password validation works  
✅ Database properly stores user data  

---

**Need Help?** Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) file or review backend logs for detailed error messages.
