-- Local Vendor Platform Database Schema
-- PostgreSQL 15+
-- Created: January 25, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'customer', 'admin')),
    business_name VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'vegetables', 'fruits', 'dairy', 'meat', 'bakery',
        'grains', 'beverages', 'snacks', 'other'
    )),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('kg', 'liter', 'piece', 'dozen', 'gram')),
    expiry_date DATE,
    image_url TEXT,
    low_stock_threshold DECIMAL(10, 2) DEFAULT 10,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_expiry ON products(expiry_date);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_created_at ON products(created_at);

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'other')),
    sale_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sales_vendor ON sales(vendor_id);
CREATE INDEX idx_sales_product ON sales(product_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- ============================================
-- INVENTORY_LOGS TABLE
-- ============================================
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('add', 'remove', 'update', 'adjust')),
    quantity_before DECIMAL(10, 2) NOT NULL,
    quantity_after DECIMAL(10, 2) NOT NULL,
    quantity_change DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(100),
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_action ON inventory_logs(action);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);

-- ============================================
-- PREDICTIONS TABLE
-- ============================================
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_quantity DECIMAL(10, 2) NOT NULL CHECK (predicted_quantity >= 0),
    confidence_level DECIMAL(5, 2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
    lower_bound DECIMAL(10, 2),
    upper_bound DECIMAL(10, 2),
    model_used VARCHAR(50) NOT NULL,
    model_version VARCHAR(20),
    features_used JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_predictions_product ON predictions(product_id);
CREATE INDEX idx_predictions_forecast_date ON predictions(forecast_date);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE UNIQUE INDEX idx_predictions_product_date ON predictions(product_id, forecast_date, created_at);

-- ============================================
-- WASTE_LOGS TABLE
-- ============================================
CREATE TABLE waste_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity_wasted DECIMAL(10, 2) NOT NULL CHECK (quantity_wasted > 0),
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('expired', 'damaged', 'spoiled', 'unsold', 'other')),
    value_lost DECIMAL(10, 2) NOT NULL CHECK (value_lost >= 0),
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_waste_logs_product ON waste_logs(product_id);
CREATE INDEX idx_waste_logs_vendor ON waste_logs(vendor_id);
CREATE INDEX idx_waste_logs_reason ON waste_logs(reason);
CREATE INDEX idx_waste_logs_logged_at ON waste_logs(logged_at);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'ready', 'delivered', 'cancelled'
    )),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'low_stock', 'expiring_soon', 'high_demand', 'waste_alert', 'info'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- ============================================
-- MODEL_PERFORMANCE TABLE
-- ============================================
CREATE TABLE model_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    accuracy DECIMAL(5, 4),
    rmse DECIMAL(10, 2),
    mae DECIMAL(10, 2),
    mape DECIMAL(5, 2),
    training_date TIMESTAMP WITH TIME ZONE NOT NULL,
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_model_performance_model ON model_performance(model_name);
CREATE INDEX idx_model_performance_active ON model_performance(is_active);
CREATE INDEX idx_model_performance_created_at ON model_performance(created_at);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.*,
    u.business_name as vendor_name,
    u.email as vendor_email
FROM products p
INNER JOIN users u ON p.vendor_id = u.id
WHERE p.stock_quantity <= p.low_stock_threshold
  AND p.is_active = true;

-- Expiring products view
CREATE OR REPLACE VIEW expiring_products AS
SELECT 
    p.*,
    u.business_name as vendor_name,
    (p.expiry_date - CURRENT_DATE) as days_until_expiry
FROM products p
INNER JOIN users u ON p.vendor_id = u.id
WHERE p.expiry_date IS NOT NULL
  AND p.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
  AND p.is_active = true
ORDER BY p.expiry_date ASC;

-- Daily sales summary view
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(sale_date) as sale_date,
    vendor_id,
    COUNT(*) as total_sales,
    SUM(quantity) as total_quantity,
    SUM(total_amount) as total_revenue
FROM sales
GROUP BY DATE(sale_date), vendor_id;

-- Product performance view
CREATE OR REPLACE VIEW product_performance AS
SELECT 
    p.id as product_id,
    p.name,
    p.category,
    p.vendor_id,
    COUNT(s.id) as total_sales,
    SUM(s.quantity) as total_quantity_sold,
    SUM(s.total_amount) as total_revenue,
    AVG(s.quantity) as avg_quantity_per_sale,
    MAX(s.sale_date) as last_sale_date
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category, p.vendor_id;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores all user accounts (vendors, customers, admins)';
COMMENT ON TABLE products IS 'Product catalog for vendors';
COMMENT ON TABLE sales IS 'Transaction records';
COMMENT ON TABLE inventory_logs IS 'Audit trail for inventory changes';
COMMENT ON TABLE predictions IS 'ML-generated demand forecasts';
COMMENT ON TABLE waste_logs IS 'Track wasted products for reduction';
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON TABLE alerts IS 'System notifications for users';

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Create admin user
INSERT INTO users (email, password_hash, role, business_name) 
VALUES ('admin@vendorplatform.com', '$2a$12$placeholder', 'admin', 'Platform Admin');

-- Schema Version
CREATE TABLE schema_version (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial schema creation');
