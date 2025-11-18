# Travel CRM Frontend

A modern, responsive frontend for the Travel CRM system built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Deploy in minutes!** This frontend is pre-configured for Vercel deployment with automatic builds.

👉 **[See Full Deployment Guide](./DEPLOYMENT.md)** for step-by-step instructions.

### Quick Start

```bash
cd frontend
vercel
vercel env add VITE_API_BASE_URL production
# Enter your backend URL: https://your-backend.vercel.app/api/v1
vercel --prod
```

Your app will be live at `https://your-project.vercel.app`

## 🎨 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Role-Based Access**: Different views for Admin, Manager, Agent, and Customer roles
- **Real-Time Updates**: Dynamic dashboard with live data
- **Form Validation**: Comprehensive input validation with Zod
- **Chart Visualizations**: Interactive charts with Recharts
- **Type Safety**: Full TypeScript implementation

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Backend API running (locally or deployed)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` file from template:

```bash
cp env.template .env
```

Edit `.env` with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production backend:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### 4. Login with Demo Accounts

Use these credentials to test different roles:

- **Admin:** `admin@example.com` / `password`
- **Manager:** `manager1@example.com` / `password`
- **Agent:** `agent1@example.com` / `password`
- **Customer:** `customer1@example.com` / `password`

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components
│   │   ├── ui/          # Base UI components
│   │   └── ...          # Feature-specific components
│   ├── contexts/        # React contexts (Auth, Theme)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   │   └── api.ts       # Axios instance & interceptors
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # App entry point
├── .env                 # Environment variables (local)
├── env.template         # Environment template
├── vercel.json          # Vercel configuration
├── vite.config.ts       # Vite configuration
└── package.json
```

## 🧩 Key Components

### Authentication

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Role-based permissions

### Dashboard

- Overview statistics
- Revenue charts
- Activity feed
- Quick actions

### Modules

- **Leads**: Lead management and conversion
- **Customers**: Customer relationship management
- **Reservations**: Booking management
- **Sales Cases**: Sales pipeline tracking
- **Operations**: Trip and task management
- **Finance**: Invoices and payments
- **Support**: Ticket management
- **HR**: Attendance and leave requests

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses:

- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Custom Components**: Reusable UI components

## 📡 API Integration

The frontend communicates with the backend API through:

- **Axios**: HTTP client with interceptors
- **Auto Retry**: Automatic token refresh on 401
- **Error Handling**: User-friendly error messages
- **Type Safety**: TypeScript interfaces for all API calls

### API Service

Located in `src/services/api.ts`:

- Configures base URL from environment
- Adds JWT token to requests
- Handles token refresh
- Provides error handling

## 🔐 Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token + refresh token
3. Tokens stored in localStorage
4. Token added to all API requests
5. Auto-refresh on token expiration
6. Redirect to login on refresh failure

## 🚀 Building for Production

### Build

```bash
npm run build
```

Output in `dist/` directory.

### Preview Build

```bash
npm run preview
```

## 🔄 Deployment

### Deploy to Vercel (Recommended)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete instructions.

Quick deploy:

```bash
vercel --prod
```

### Environment Variables for Production

Set in Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `https://your-backend.vercel.app/api/v1` |

⚠️ **Important:** Always include the `/api/v1` path in the URL.

### Other Platforms

The build output in `dist/` can be deployed to:

- **Netlify**: Drag & drop `dist/` folder
- **Cloudflare Pages**: Connect Git repository
- **AWS S3 + CloudFront**: Upload `dist/` to S3
- **Any static host**: Serve `dist/` folder

Ensure SPA routing is configured (see `vercel.json` for reference).

## 🐛 Troubleshooting

### API Connection Issues

**Symptom:** "Connection failed" errors

**Solutions:**
1. Verify `VITE_API_BASE_URL` is set correctly
2. Check backend is running and accessible
3. Open browser console for detailed errors
4. Test backend directly: `curl https://your-backend.vercel.app/api/v1/health`

### Environment Variables Not Working

**Symptom:** Still using localhost after setting production URL

**Solutions:**
1. Ensure variable starts with `VITE_`
2. Restart dev server after changing `.env`
3. Clear browser cache
4. For Vercel: Redeploy after changing env vars

### Build Errors

**Symptom:** Build fails with TypeScript errors

**Solutions:**
1. Run `npm install` to ensure all dependencies
2. Check TypeScript version compatibility
3. Review error messages for specific issues

### Login Not Working

**Symptom:** Cannot login or token issues

**Solutions:**
1. Verify backend is accessible
2. Check credentials are correct
3. Clear localStorage: `localStorage.clear()`
4. Check browser console for API errors

## 🎯 Development Tips

### Hot Module Replacement

Vite provides fast HMR - changes appear instantly without full reload.

### TypeScript

All components and services are fully typed. Use TypeScript for better DX and fewer bugs.

### Code Organization

- Keep components small and focused
- Use custom hooks for reusable logic
- Place API calls in service layer
- Define types in `types/` directory

## 📦 Dependencies

### Core

- **React 18**: UI library
- **React Router**: Client-side routing
- **TypeScript**: Type safety
- **Vite**: Build tool

### UI

- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Recharts**: Charts and graphs

### Forms

- **React Hook Form**: Form management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration

### HTTP

- **Axios**: HTTP client
- **date-fns**: Date formatting

## 🔗 Integration with Backend

This frontend is designed to work with the Travel CRM Backend API:

1. Deploy backend first (see `backend/DEPLOYMENT.md`)
2. Copy backend URL
3. Set `VITE_API_BASE_URL` to backend URL + `/api/v1`
4. Deploy frontend
5. Test end-to-end integration

## 📝 License

MIT

## 🤝 Support

For issues:
1. Check browser console for errors
2. Verify environment variables
3. Test backend API directly
4. Check deployment logs in Vercel

