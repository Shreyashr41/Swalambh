# DermaCare Vercel Deployment Guide

## 🚨 Important: Full-Stack Deployment Note

DermaCare is a **full-stack application** with:
- **Frontend**: React (can be deployed to Vercel)
- **Backend**: Node.js + Express (needs separate hosting)

Vercel is optimized for frontend deployments. The backend must be deployed separately.

## 📦 Deployment Options

### Option 1: Frontend on Vercel + Backend Elsewhere (Recommended)

#### Step 1: Deploy Backend

Choose one of these platforms for the backend:

**A. Railway (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select your repository
4. Choose `server` folder as root
5. Add environment variables:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   OPENROUTER_API_KEY=your-openrouter-key
   PORT=5000
   ```
6. Deploy! You'll get a URL like: `https://dermacare-production.up.railway.app`

**B. Render**
1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install && npm run build`
6. Start Command: `npm start`
7. Add environment variables (same as Railway)

**C. Heroku**
1. Create new Heroku app
2. Set root directory to `server`
3. Add buildpack: `heroku/nodejs`
4. Add environment variables
5. Deploy

#### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**:
   ```
   Framework Preset: Create React App
   Root Directory: client
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

4. **Add Environment Variable**:
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.herokuapp.com/api`
   - (Replace with your actual backend URL from Step 1)

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Frontend Only on Vercel (Development/Demo)

If you just want to deploy the frontend and run backend locally:

1. Deploy frontend to Vercel (same as above)
2. Set `REACT_APP_API_URL=http://localhost:5000/api`
3. Run backend locally during demos
4. Note: This only works when accessing from the same machine

## 🔧 Vercel Configuration Files

### vercel.json (Already Created)
```json
{
  "version": 2,
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/build",
  "framework": "create-react-app",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### client/.env.production (Already Created)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 🐛 Common Vercel Deployment Errors & Fixes

### Error 1: "Build Failed - Command not found"
**Solution**: Update vercel.json build command to include `cd client`

### Error 2: "404 on Page Refresh"
**Solution**: The rewrites in vercel.json handle this (SPA routing)

### Error 3: "API Calls Failing - CORS Error"
**Solutions**:
1. Make sure backend CORS allows your Vercel domain
2. Update backend `server/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://dermavercel.vercel.app'
  ],
  credentials: true
}));
```

### Error 4: "Environment Variables Not Working"
**Solutions**:
1. Make sure variable starts with `REACT_APP_`
2. Redeploy after adding environment variables
3. Check the variable is set in Vercel dashboard

### Error 5: "MongoDB Connection Failed"
**Solution**: Use MongoDB Atlas (cloud) instead of local MongoDB:
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend environment variables

### Error 6: "Module not found or Cannot find module"
**Solutions**:
1. Clear Vercel cache: Settings → General → Clear Cache
2. Check package.json dependencies are correct
3. Make sure all imports use correct paths

## 🔐 Environment Variables Checklist

### Backend Environment Variables
```
✅ MONGODB_URI
✅ JWT_SECRET
✅ JWT_EXPIRES_IN
✅ OPENROUTER_API_KEY
✅ NODE_ENV=production
✅ PORT (usually auto-set by hosting platform)
```

### Frontend Environment Variables
```
✅ REACT_APP_API_URL
```

## 🧪 Testing Your Deployment

1. **Frontend Check**:
   - Visit your Vercel URL
   - Open browser DevTools (F12)
   - Check Console for errors
   - Try refreshing different pages (should not 404)

2. **Backend Connection Check**:
   - Try to register/login
   - Check Network tab in DevTools
   - Look for API calls to your backend URL
   - If CORS errors, update backend CORS settings

3. **Full Flow Test**:
   - Register new user
   - Login
   - Start a chat consultation
   - Upload an image (if backend has image analysis)
   - Check reminders
   - Generate a report

## 📱 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for propagation (can take 24-48 hours)

## 🚀 Quick Deploy Commands

```bash
# Update environment variables in Vercel
vercel env add REACT_APP_API_URL

# Redeploy current build
vercel --prod

# Deploy with fresh build
vercel --prod --force
```

## 📞 Support

If deployment fails:
1. Check Vercel build logs in dashboard
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure backend is running and accessible

---

**Current Deployment**: https://dermavercel.vercel.app

Remember: Frontend and backend must be deployed separately! 🎯
