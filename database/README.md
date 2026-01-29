# Database Schema Documentation

## Overview

PostgreSQL database schema for the Local Vendor Demand Forecast & Waste Reduction Platform.

## Database: `vendor_platform`

### Core Tables

#### 1. **users**
Stores all user accounts (vendors, customers, admins)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| role | VARCHAR(20) | User role: vendor/customer/admin |
| business_name | VARCHAR(255) | Business/store name (for vendors) |
| location | VARCHAR(255) | Physical location |
| phone | VARCHAR(20) | Contact number |
| is_active | BOOLEAN | Account status |
| email_verified | BOOLEAN | Email verification status |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_users_email` - Fast email lookups
- `idx_users_role` - Filter by role
- `idx_users_created_at` - Sort by registration date

---

#### 2. **products**
Product catalog managed by vendors

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | FK to users |
| name | VARCHAR(255) | Product name |
| category | VARCHAR(50) | Product category (vegetables, fruits, etc.) |
| price | DECIMAL(10,2) | Unit price |
| stock_quantity | DECIMAL(10,2) | Current stock |
| unit | VARCHAR(20) | Measurement unit (kg, liter, piece, etc.) |
| expiry_date | DATE | Product expiration date |
| image_url | TEXT | Product image URL |
| low_stock_threshold | DECIMAL(10,2) | Alert threshold |
| description | TEXT | Product description |
| is_active | BOOLEAN | Product active status |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

**Categories:**
- vegetables
- fruits
- dairy
- meat
- bakery
- grains
- beverages
- snacks
- other

**Units:**
- kg (kilogram)
- liter
- piece
- dozen
- gram

---

#### 3. **sales**
Transaction records

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vendor_id | UUID | FK to users (vendor) |
| product_id | UUID | FK to products |
| quantity | DECIMAL(10,2) | Quantity sold |
| unit_price | DECIMAL(10,2) | Price per unit at sale time |
| total_amount | DECIMAL(10,2) | Total transaction amount |
| payment_method | VARCHAR(20) | cash/card/upi/other |
| sale_date | TIMESTAMP | When sale occurred |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation |

---

#### 4. **inventory_logs**
Audit trail for all inventory changes

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| action | VARCHAR(20) | add/remove/update/adjust |
| quantity_before | DECIMAL(10,2) | Stock before change |
| quantity_after | DECIMAL(10,2) | Stock after change |
| quantity_change | DECIMAL(10,2) | Net change |
| reason | VARCHAR(100) | Reason for change |
| notes | TEXT | Additional details |
| performed_by | UUID | FK to users (who made change) |
| created_at | TIMESTAMP | When change occurred |

---

#### 5. **predictions**
ML-generated demand forecasts

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| forecast_date | DATE | Date being predicted |
| predicted_quantity | DECIMAL(10,2) | Predicted demand |
| confidence_level | DECIMAL(5,2) | Prediction confidence (0-1) |
| lower_bound | DECIMAL(10,2) | Lower confidence interval |
| upper_bound | DECIMAL(10,2) | Upper confidence interval |
| model_used | VARCHAR(50) | ML model name |
| model_version | VARCHAR(20) | Model version |
| features_used | JSONB | Features used for prediction |
| created_at | TIMESTAMP | Prediction generation time |

---

#### 6. **waste_logs**
Track wasted products for reduction analysis

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | FK to products |
| vendor_id | UUID | FK to users (vendor) |
| quantity_wasted | DECIMAL(10,2) | Amount wasted |
| reason | VARCHAR(50) | expired/damaged/spoiled/unsold/other |
| value_lost | DECIMAL(10,2) | Monetary value lost |
| notes | TEXT | Additional details |
| logged_at | TIMESTAMP | When waste occurred |

---

#### 7. **orders**
Customer orders (Phase 2-3 feature)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| customer_id | UUID | FK to users (customer) |
| vendor_id | UUID | FK to users (vendor) |
| total_amount | DECIMAL(10,2) | Order total |
| status | VARCHAR(20) | pending/confirmed/ready/delivered/cancelled |
| order_date | TIMESTAMP | When order placed |
| delivery_date | TIMESTAMP | Expected/actual delivery |
| notes | TEXT | Order notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

---

#### 8. **order_items**
Individual items in an order

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to orders |
| product_id | UUID | FK to products |
| quantity | DECIMAL(10,2) | Quantity ordered |
| unit_price | DECIMAL(10,2) | Price per unit |
| subtotal | DECIMAL(10,2) | Line item total |
| created_at | TIMESTAMP | Record creation |

---

#### 9. **alerts**
System notifications for users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| type | VARCHAR(50) | low_stock/expiring_soon/high_demand/waste_alert/info |
| title | VARCHAR(255) | Alert title |
| message | TEXT | Alert message |
| product_id | UUID | Related product (optional) |
| priority | VARCHAR(20) | low/medium/high |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Alert creation |
| read_at | TIMESTAMP | When user read alert |

---

#### 10. **model_performance**
Track ML model accuracy and metrics

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| model_name | VARCHAR(50) | Model identifier |
| model_version | VARCHAR(20) | Version number |
| accuracy | DECIMAL(5,4) | Overall accuracy |
| rmse | DECIMAL(10,2) | Root Mean Square Error |
| mae | DECIMAL(10,2) | Mean Absolute Error |
| mape | DECIMAL(5,2) | Mean Absolute Percentage Error |
| training_date | TIMESTAMP | When model was trained |
| evaluation_date | TIMESTAMP | When metrics calculated |
| is_active | BOOLEAN | Currently in use |
| metrics | JSONB | Additional metrics |
| created_at | TIMESTAMP | Record creation |

---

## Views

### 1. **low_stock_products**
Products below their threshold

```sql
SELECT * FROM low_stock_products;
```

### 2. **expiring_products**
Products expiring within 7 days

```sql
SELECT * FROM expiring_products;
```

### 3. **daily_sales_summary**
Aggregated sales by day and vendor

```sql
SELECT * FROM daily_sales_summary WHERE sale_date = CURRENT_DATE;
```

### 4. **product_performance**
Sales statistics per product

```sql
SELECT * FROM product_performance ORDER BY total_revenue DESC LIMIT 10;
```

---

## Common Queries

### Get vendor's inventory with stock status
```sql
SELECT 
    p.*,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity <= p.low_stock_threshold THEN 'Low Stock'
        ELSE 'In Stock'
    END as stock_status,
    CASE 
        WHEN p.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Expiring Soon'
        ELSE 'Fresh'
    END as freshness_status
FROM products p
WHERE p.vendor_id = 'vendor-uuid'
  AND p.is_active = true;
```

### Get sales report for a date range
```sql
SELECT 
    DATE(s.sale_date) as date,
    COUNT(*) as transactions,
    SUM(s.quantity) as units_sold,
    SUM(s.total_amount) as revenue
FROM sales s
WHERE s.vendor_id = 'vendor-uuid'
  AND s.sale_date >= '2026-01-01'
  AND s.sale_date < '2026-02-01'
GROUP BY DATE(s.sale_date)
ORDER BY date;
```

### Get waste reduction metrics
```sql
SELECT 
    DATE_TRUNC('month', w.logged_at) as month,
    COUNT(*) as waste_incidents,
    SUM(w.quantity_wasted) as total_wasted,
    SUM(w.value_lost) as money_lost,
    w.reason
FROM waste_logs w
WHERE w.vendor_id = 'vendor-uuid'
GROUP BY month, w.reason
ORDER BY month DESC, money_lost DESC;
```

### Get demand forecast for next week
```sql
SELECT 
    p.forecast_date,
    p.predicted_quantity,
    p.confidence_level,
    p.model_used,
    pr.name as product_name
FROM predictions p
INNER JOIN products pr ON p.product_id = pr.id
WHERE p.product_id = 'product-uuid'
  AND p.forecast_date >= CURRENT_DATE
  AND p.forecast_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.forecast_date;
```

---

## Migrations

To apply the schema:

```bash
psql -U vendor_admin -d vendor_platform -f database/schema.sql
```

To backup:

```bash
pg_dump -U vendor_admin vendor_platform > backup.sql
```

To restore:

```bash
psql -U vendor_admin -d vendor_platform < backup.sql
```

---

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Partitioning**: Consider partitioning `sales` and `predictions` tables by date for large datasets
3. **Archiving**: Archive old predictions and sales data after 2 years
4. **Vacuuming**: Run VACUUM ANALYZE regularly
5. **Connection Pooling**: Use pgBouncer in production

---

**Schema Version**: 1.0.0  
**Last Updated**: January 25, 2026  
**Database**: PostgreSQL 15+
