# Frontend Deployment Guide - Vercel

This guide will help you deploy the ERP-CRM frontend to Vercel.

## Prerequisites

- Node.js 18+ installed locally
- Vercel account (free tier works)
- Vercel CLI installed: `npm install -g vercel`
- **Backend already deployed** (see backend/DEPLOYMENT.md)

## Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set environment variable first:**
   
   Create a `.env.production` file:
   ```bash
   echo "VITE_API_BASE_URL=https://your-backend-url.vercel.app/api/v1" > .env.production
   ```
   
   Replace `your-backend-url.vercel.app` with your actual backend URL.

4. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Setup and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No**
   - Project name? **erp-crm-frontend** (or your choice)
   - Directory? **./frontend** (or leave as . if already in frontend folder)
   - Override settings? **No**

5. **Add environment variable in Vercel:**
   ```bash
   vercel env add VITE_API_BASE_URL production
   ```
   Enter your backend URL: `https://your-backend-url.vercel.app/api/v1`

6. **Deploy to production:**
   ```bash
   vercel --prod
   ```

7. **Your app is live!** 🎉
   - You'll get a URL like: `https://erp-crm-frontend-xxx.vercel.app`
   - Visit it in your browser and login with demo credentials

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set the root directory to `frontend`
4. Add environment variables:
   - `VITE_API_BASE_URL`: `https://your-backend-url.vercel.app/api/v1`
5. Click "Deploy"

## Environment Variables

Required variable to set in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint URL | `https://your-backend.vercel.app/api/v1` |

⚠️ **Important:** The `VITE_` prefix is required for Vite to expose the variable to your app.

## Demo Credentials

Once deployed, login with these demo accounts:

- **Admin:** `admin@example.com` / `password`
- **Manager:** `manager1@example.com` / `password`  
- **Agent:** `agent1@example.com` / `password`
- **Customer:** `customer1@example.com` / `password`

Each role has different permissions and views.

## Verifying Deployment

1. **Visit your frontend URL**
2. **Open browser console** (F12) to check for errors
3. **Look for log message:** `🔗 API Base URL: https://...`
4. **Try logging in** with admin credentials
5. **Check dashboard** loads with data

## Troubleshooting

### "Connection failed" Error
- **Cause:** Backend URL not configured or incorrect
- **Fix:** Check `VITE_API_BASE_URL` in Vercel environment variables
- **Verify:** Backend URL is correct and accessible

### Environment Variable Not Working
- **Cause:** Vite requires rebuild when env vars change
- **Fix:** After changing env vars in Vercel, trigger a new deployment:
  ```bash
  vercel --prod --force
  ```

### No Data Loading
- **Cause:** Backend not responding or CORS issue
- **Fix:** 
  1. Check backend is deployed and running
  2. Test backend directly: `curl https://your-backend-url.vercel.app/api/v1/health`
  3. Check browser console for CORS errors

### 404 on Page Refresh
- **Cause:** SPA routing not configured
- **Fix:** This should be handled by `vercel.json` - verify the file exists in frontend directory

### Assets Not Loading
- **Cause:** Build failed or assets not uploaded
- **Fix:** Check Vercel build logs for errors
  ```bash
  vercel logs your-frontend-url.vercel.app
  ```

## Custom Domain (Optional)

To use your own domain:

1. Go to Vercel project dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records as instructed
5. Vercel handles SSL automatically

## Local Development

To test locally before deploying:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp env.template .env
   ```

3. Update `.env` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
   (or use your deployed backend URL)

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Production Build Locally

Test production build before deploying:

```bash
# Build
npm run build

# Preview
npm run preview
```

## Integration Testing

After both frontend and backend are deployed:

1. **Test Login Flow:**
   - Visit frontend URL
   - Login with `admin@example.com` / `password`
   - Verify dashboard loads

2. **Test API Integration:**
   - Navigate through different sections
   - Create a test customer or lead
   - Verify data persists (during session)

3. **Test All Roles:**
   - Logout and login with different roles
   - Verify role-based permissions work

## Performance Optimization

The frontend is already optimized for Vercel:
- Code splitting by vendor chunks
- Asset caching headers configured
- Source maps disabled in production
- Lazy loading for routes

## Monitoring

View deployment and runtime logs:
```bash
# Deployment logs
vercel logs your-frontend-url.vercel.app

# Real-time logs
vercel logs your-frontend-url.vercel.app --follow
```

## Updating Deployment

To update after code changes:

```bash
# From frontend directory
git add .
git commit -m "Update frontend"
git push origin main

# Or direct deploy
vercel --prod
```

Vercel auto-deploys from Git if connected to a repository.

## Support

For issues:
1. Check browser console for errors
2. Verify backend is running
3. Check Vercel deployment logs
4. Ensure environment variables are set correctly

