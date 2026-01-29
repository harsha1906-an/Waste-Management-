# PostgreSQL Not Installed - Alternative Solutions

## Option 1: Use SQLite for Development (Fastest)

SQLite requires no installation and is perfect for development and testing.

### Steps:

1. **Install SQLite package**:
```powershell
cd "c:\Users\Harsha\Documents\Jeevan project\backend"
npm install sqlite3
```

2. **Update .env file** - Change `DATABASE_URL` to:
```
DATABASE_URL=sqlite:./dev_database.sqlite
```

3. **Restart backend server** - It will auto-create the database file.

---

## Option 2: Install PostgreSQL (Recommended for Production)

### Download and Install:
1. Visit: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15 or 16 installer
3. Run installer with these settings:
   - Password: `postgres` (or remember your password)
   - Port: `5432` (default)
   - Install as Windows Service: ✅ Yes

### After Installation:
```powershell
# Create database
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE vendor_platform;"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE USER vendor_admin WITH PASSWORD 'vendor_pass_2026';"
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;"
```

---

## Option 3: Use Docker PostgreSQL (Developer Friendly)

If you have Docker installed:

```powershell
# Run PostgreSQL in Docker
docker run --name vendor-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=vendor_platform -p 5432:5432 -d postgres:15

# Connect and create user
docker exec -it vendor-postgres psql -U postgres -c "CREATE USER vendor_admin WITH PASSWORD 'vendor_pass_2026';"
docker exec -it vendor-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE vendor_platform TO vendor_admin;"
```

---

## Recommendation

**For quick testing**: Use **Option 1 (SQLite)** - takes 2 minutes  
**For full development**: Use **Option 2 (PostgreSQL)** - takes 15 minutes  
**If you have Docker**: Use **Option 3 (Docker)** - takes 5 minutes

Which option would you prefer?
