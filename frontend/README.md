# Frontend - Vendor Platform

Next.js 14 frontend application for the Local Vendor Platform.

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
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── reports/
│   │   └── waste/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   ├── auth.ts          # Auth helpers
│   └── utils.ts         # General utilities
├── store/               # Zustand state management
│   ├── authStore.ts
│   ├── inventoryStore.ts
│   └── salesStore.ts
├── types/               # TypeScript types
└── public/              # Static assets
```

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Yup
- **State**: Zustand
- **Charts**: Chart.js + react-chartjs-2
- **HTTP Client**: Axios
- **UI Components**: Radix UI

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

## 🎨 UI/UX Guidelines

- Mobile-first responsive design
- Accessible (WCAG 2.1 AA)
- Dark mode support
- Loading states for all async operations
- Error boundaries
- Toast notifications for feedback

## 📦 Key Features

### Phase 1 (Current)
- ✅ Authentication (Login/Signup)
- ✅ Dashboard with metrics
- ✅ Inventory management
- ✅ Sales recording
- ✅ Basic reports

### Phase 2 (Next)
- 🔄 Demand forecasting visualization
- 🔄 Waste tracking
- 🔄 Smart alerts
- 🔄 Advanced analytics

## 🔗 API Integration

All API calls go through `lib/api.ts`:

```typescript
import api from '@/lib/api';

// GET request
const products = await api.get('/products');

// POST request
const newProduct = await api.post('/products', data);
```

---

**Last Updated**: January 25, 2026
