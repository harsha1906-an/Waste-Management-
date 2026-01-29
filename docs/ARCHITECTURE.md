# Architecture Overview - Local Vendor Platform

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser         │         Mobile App (Future)              │
│  (Next.js/React)     │         (React Native)                   │
└──────────────┬───────┴───────────────┬───────────────────────────┘
               │                       │
               │    HTTPS/REST API     │
               │                       │
┌──────────────▼───────────────────────▼───────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                 │
└──────────────┬───────────────────────┬───────────────────────────┘
               │                       │
       ┌───────▼──────┐       ┌───────▼──────────┐
       │   Backend    │       │   ML Service     │
       │   (Node.js)  │◄──────┤   (Python)       │
       │   Express    │       │   FastAPI        │
       └───────┬──────┘       └───────┬──────────┘
               │                      │
               │    ┌─────────────────┘
               │    │
       ┌───────▼────▼──────┐
       │   PostgreSQL DB    │
       │   (Primary Store)  │
       └────────────────────┘
               │
       ┌───────▼───────┐
       │  Redis Cache   │
       │  (Sessions)    │
       └────────────────┘
```

## 🧩 Component Architecture

### 1. Frontend Layer (Next.js/React)

**Purpose**: User interface for vendors and customers

**Key Components**:
- **Pages**: Login, Dashboard, Inventory, Sales, Reports, Waste Management
- **Components**: Reusable UI elements (charts, forms, tables)
- **State Management**: Redux Toolkit / Zustand
- **API Client**: Axios with interceptors

**Technology**:
- Next.js 14 (App Router)
- TypeScript
- Material-UI / Tailwind CSS
- Chart.js for visualizations
- React Hook Form for forms

**Responsibilities**:
- Render UI
- Handle user interactions
- Call backend APIs
- Display real-time updates
- Client-side validation

### 2. Backend Layer (Node.js/Express)

**Purpose**: Business logic, authentication, data management

**Key Modules**:

#### Authentication Service
- User registration
- Login/logout
- JWT token management
- Password reset
- Role-based access control (RBAC)

#### Inventory Service
- Product CRUD operations
- Stock level tracking
- Low stock alerts
- Expiry date management
- Category management

#### Sales Service
- Transaction recording
- Order management
- Receipt generation
- Payment tracking

#### Waste Management Service
- Log waste entries
- Track waste reasons
- Calculate waste metrics
- Discount suggestions

#### Analytics Service
- Generate reports
- Dashboard metrics
- Performance analytics
- Export functionality (PDF, Excel)

#### Notification Service
- Email notifications (SendGrid)
- SMS alerts (Twilio)
- Push notifications
- In-app notifications

**Technology**:
- Node.js 20+
- Express.js
- Prisma ORM
- JWT authentication
- Winston (logging)
- Joi/Yup (validation)

### 3. ML Service Layer (Python/FastAPI)

**Purpose**: AI-powered demand forecasting

**Key Components**:

#### Forecasting Engine
- Historical data analysis
- Pattern recognition
- Seasonal adjustments
- Weather integration
- Holiday/festival detection

#### ML Models
- **ARIMA**: Time series forecasting
- **Prophet**: Seasonal patterns
- **LSTM**: Deep learning predictions
- **Linear Regression**: Baseline model
- **Ensemble**: Combination of models

#### Preprocessing Pipeline
- Data cleaning
- Feature engineering
- Normalization
- Outlier detection

#### Model Training
- Automated retraining
- Model versioning
- A/B testing
- Performance monitoring

**Technology**:
- Python 3.11+
- FastAPI
- TensorFlow/PyTorch
- scikit-learn
- Prophet
- Pandas/NumPy
- MLflow (experiment tracking)

### 4. Database Layer (PostgreSQL)

**Purpose**: Persistent data storage

**Key Tables**:

#### Users
```sql
- id (UUID)
- email
- password_hash
- role (vendor/customer/admin)
- business_name
- location
- created_at
```

#### Products
```sql
- id (UUID)
- vendor_id (FK)
- name
- category
- price
- stock_quantity
- unit
- expiry_date
- image_url
- created_at
```

#### Sales
```sql
- id (UUID)
- vendor_id (FK)
- product_id (FK)
- quantity
- total_amount
- payment_method
- sale_date
- created_at
```

#### Inventory_Logs
```sql
- id (UUID)
- product_id (FK)
- action (add/remove/update)
- quantity_change
- reason
- timestamp
```

#### Predictions
```sql
- id (UUID)
- product_id (FK)
- forecast_date
- predicted_quantity
- confidence_level
- model_used
- created_at
```

#### Waste_Logs
```sql
- id (UUID)
- product_id (FK)
- vendor_id (FK)
- quantity_wasted
- reason (expired/damaged/unsold)
- value_lost
- logged_at
```

### 5. Caching Layer (Redis)

**Purpose**: Performance optimization

**Use Cases**:
- Session management
- Frequently accessed data
- Rate limiting
- Real-time leaderboards
- Temporary data storage

## 🔄 Data Flow

### Example: Recording a Sale

```
1. User clicks "Record Sale" in Frontend
   ↓
2. Frontend validates input
   ↓
3. POST /api/sales to Backend
   ↓
4. Backend authenticates JWT token
   ↓
5. Backend validates sale data
   ↓
6. Backend creates sale record in DB
   ↓
7. Backend updates inventory (stock - quantity)
   ↓
8. Backend logs inventory change
   ↓
9. Backend triggers ML service to update predictions
   ↓
10. ML service recalculates forecasts
   ↓
11. Backend sends success response
   ↓
12. Frontend updates UI
   ↓
13. Frontend shows success notification
```

### Example: Getting Demand Forecast

```
1. Frontend requests forecast for product
   ↓
2. Backend checks Redis cache
   ↓
3. If cached: return immediately
   ↓
4. If not cached:
   a. Backend calls ML Service API
   b. ML Service fetches historical data
   c. ML Service runs prediction model
   d. ML Service returns forecast
   e. Backend caches result in Redis (TTL: 1 hour)
   ↓
5. Backend returns forecast to Frontend
   ↓
6. Frontend displays chart
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User enters credentials
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token
   ↓
4. Token contains: {user_id, role, exp}
   ↓
5. Frontend stores token (httpOnly cookie/localStorage)
   ↓
6. All API requests include token in Authorization header
   ↓
7. Backend verifies token on each request
```

### Security Measures

1. **Password Security**
   - Bcrypt hashing (salt rounds: 12)
   - Password strength requirements
   - Rate limiting on login attempts

2. **API Security**
   - JWT authentication
   - HTTPS only
   - CORS configuration
   - Input validation
   - SQL injection prevention (Prisma ORM)
   - XSS protection

3. **Data Security**
   - Encrypted sensitive fields
   - Role-based access control
   - Audit logs
   - Regular backups

## 📊 Scalability Strategy

### Horizontal Scaling

**Backend**: Multiple instances behind load balancer
**ML Service**: Separate instances for training vs prediction
**Database**: Read replicas for analytics queries
**Cache**: Redis cluster

### Vertical Scaling

- Optimize database queries
- Add indexes
- Increase server resources
- Use CDN for static assets

### Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Service workers (PWA)

2. **Backend**
   - Connection pooling
   - Query optimization
   - Caching strategies
   - Async processing

3. **ML Service**
   - Model optimization
   - Batch predictions
   - Pre-computed forecasts
   - GPU acceleration

## 🔄 Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend: localhost:3000
├── Backend: localhost:5000
├── ML Service: localhost:8000
└── PostgreSQL: localhost:5432
```

### Production Environment (AWS Example)
```
CloudFlare CDN
    ↓
AWS Application Load Balancer
    ↓
┌─────────────┬─────────────┬─────────────┐
│   EC2/ECS   │   EC2/ECS   │   EC2/ECS   │
│  (Frontend) │  (Backend)  │ (ML Service)│
└─────────────┴─────────────┴─────────────┘
         ↓            ↓            ↓
    ┌────────────────────────────────┐
    │      RDS PostgreSQL            │
    │      (Multi-AZ)                │
    └────────────────────────────────┘
              ↓
    ┌────────────────────────────────┐
    │   ElastiCache (Redis)          │
    └────────────────────────────────┘
```

## 🧪 Testing Strategy

### Frontend Testing
- Unit tests: Jest + React Testing Library
- Integration tests: Testing user flows
- E2E tests: Playwright/Cypress

### Backend Testing
- Unit tests: Jest
- Integration tests: Supertest
- API tests: Postman/Newman

### ML Service Testing
- Unit tests: pytest
- Model tests: Accuracy metrics
- Load tests: locust

## 📈 Monitoring & Observability

**Logging**: Winston (Backend), Python logging (ML)
**Monitoring**: Prometheus + Grafana
**Error Tracking**: Sentry
**APM**: New Relic / DataDog
**Uptime**: UptimeRobot

---

**Document Version**: 1.0  
**Last Updated**: January 25, 2026
