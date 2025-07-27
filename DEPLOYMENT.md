# 🚀 Deployment Guide

## Prerequisites for Deployment

### Required Services
1. **MongoDB Atlas** (Database)
2. **OpenRouter Account** (AI API)
3. **Vercel/Netlify** (Frontend hosting)
4. **Render/Railway/Heroku** (Backend hosting)

### Optional Services
- **Redis Cloud/Upstash** (Caching)
- **Cloudinary** (Image storage)
- **Sentry** (Error tracking)

## Step-by-Step Deployment

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**:
   - Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Choose your preferred region

2. **Configure Database**:
   ```bash
   # Create database user
   Username: component-generator-user
   Password: [generate-secure-password]
   
   # Configure IP whitelist
   Add: 0.0.0.0/0 (allow from anywhere)
   # Or specific IPs for better security
   ```

3. **Get Connection String**:
   ```
   mongodb+srv://component-generator-user:[password]@cluster0.abcdef.mongodb.net/component-generator?retryWrites=true&w=majority
   ```

### 2. AI Service Setup (OpenRouter)

1. **Create OpenRouter Account**:
   - Visit [OpenRouter](https://openrouter.ai)
   - Sign up and verify email

2. **Generate API Key**:
   - Go to API Keys section
   - Create new key with appropriate limits
   - Note down the API key: `sk-or-v1-...`

3. **Test API Access**:
   ```bash
   curl -H "Authorization: Bearer sk-or-v1-..." \
        -H "Content-Type: application/json" \
        -d '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}' \
        https://openrouter.ai/api/v1/chat/completions
   ```

### 3. Backend Deployment (Render)

1. **Prepare Backend for Deployment**:
   ```bash
   cd backend
   
   # Add start script to package.json
   "scripts": {
     "start": "node src/server.js",
     "build": "echo 'No build needed for Node.js'"
   }
   ```

2. **Deploy to Render**:
   - Connect GitHub repository to Render
   - Create new Web Service
   - Configure build settings:
     ```
     Environment: Node
     Build Command: cd backend && npm install
     Start Command: cd backend && npm start
     ```

3. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/component-generator
   JWT_SECRET=your-production-jwt-secret-256-bits-long
   JWT_EXPIRES_IN=7d
   OPENROUTER_API_KEY=sk-or-v1-your-production-key
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Custom Start Script** (render.yaml):
   ```yaml
   services:
     - type: web
       name: component-generator-api
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         # Add other env vars...
   ```

### 4. Frontend Deployment (Vercel)

1. **Prepare Frontend**:
   ```bash
   cd frontend
   
   # Update .env for production
   echo "VITE_API_BASE_URL=https://your-backend-url.onrender.com/api" > .env.production
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   cd frontend
   vercel --prod
   ```

3. **Configure Vercel Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables in Vercel**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

### 5. Alternative Deployment Options

#### Backend on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add
railway up
```

#### Backend on Heroku
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create component-generator-api

# Configure buildpack and deploy
heroku buildpacks:set heroku/nodejs
git subtree push --prefix backend heroku main
```

#### Frontend on Netlify
```bash
# Manual deployment
npm run build
# Drag & drop dist folder to Netlify

# Or connect via Git
# Configure: Build command: npm run build, Publish directory: dist
```

## Environment Configuration

### Production Environment Variables

#### Backend (.env.production)
```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/component-generator?retryWrites=true&w=majority

# Authentication
JWT_SECRET=super-secure-random-string-256-bits-for-production-use
JWT_EXPIRES_IN=7d

# External APIs
OPENROUTER_API_KEY=sk-or-v1-your-production-openrouter-api-key

# Security
CORS_ORIGIN=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Redis (if using)
REDIS_URL=redis://username:password@host:port
```

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-api.onrender.com/api
```

## Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**: From providers like Namecheap, GoDaddy, etc.

2. **Configure DNS**:
   ```
   # Frontend (Vercel)
   CNAME www your-app.vercel.app
   A @ 76.76.19.61
   
   # Backend (Render)
   CNAME api your-app.onrender.com
   ```

3. **SSL Certificates**: Automatically provided by Vercel/Render

### Final URLs
- Frontend: `https://www.yourdomain.com`
- Backend API: `https://api.yourdomain.com`

## Performance Optimization

### Frontend Optimizations
```javascript
// vite.config.js - Production optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          utils: ['axios', 'zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### Backend Optimizations
```javascript
// Production middleware
if (process.env.NODE_ENV === 'production') {
  app.use(compression()); // Gzip compression
  app.use(helmet()); // Security headers
  app.disable('x-powered-by'); // Hide Express
}
```

## Monitoring & Analytics

### Error Tracking with Sentry
```bash
# Install Sentry
npm install @sentry/react @sentry/node

# Configure frontend
# src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});

# Configure backend
# src/server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Analytics with Vercel Analytics
```bash
npm install @vercel/analytics

# Add to main.jsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

## Security Checklist

### Pre-deployment Security
- [ ] Strong JWT secret (256-bit minimum)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in error messages
- [ ] Environment variables secured
- [ ] Database access restricted

### Post-deployment Security
- [ ] SSL certificates valid
- [ ] Security headers present
- [ ] No exposed development endpoints
- [ ] API rate limits working
- [ ] Error tracking configured
- [ ] Regular security updates scheduled

## Backup & Recovery

### Database Backup
```bash
# MongoDB Atlas automatic backups
# Configure in Atlas dashboard:
# - Continuous backups
# - Point-in-time recovery
# - Download backup archives
```

### Environment Recovery
```bash
# Keep secure backup of environment variables
# Store in encrypted password manager or secure vault

# Document all third-party service configurations
# Maintain deployment runbook
```

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   ```javascript
   // Backend: Update CORS_ORIGIN
   CORS_ORIGIN=https://your-actual-domain.com
   ```

2. **Database Connection Issues**:
   ```javascript
   // Check MongoDB Atlas IP whitelist
   // Verify connection string format
   // Test with MongoDB Compass
   ```

3. **Build Failures**:
   ```bash
   # Clear node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Environment Variable Issues**:
   ```bash
   # Verify all required variables are set
   # Check for typos in variable names
   # Ensure proper .env file loading
   ```

### Health Checks

```bash
# Backend health check
curl https://your-api.onrender.com/health

# Frontend deployment check
curl -I https://your-app.vercel.app

# Database connection test
# Use MongoDB Compass or CLI tools
```

## Maintenance

### Regular Tasks
- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Backup verification
- [ ] API rate limit monitoring

### Scaling Considerations
- **Database**: Upgrade MongoDB Atlas tier
- **Backend**: Increase Render/Railway resources
- **Frontend**: Vercel automatically scales
- **CDN**: Configure for global distribution

---

Your Component Generator Platform is now ready for production! 🚀

## Quick Deployment Checklist

1. ✅ MongoDB Atlas cluster created
2. ✅ OpenRouter API key obtained
3. ✅ Backend deployed to Render
4. ✅ Frontend deployed to Vercel
5. ✅ Environment variables configured
6. ✅ Domain/DNS configured (optional)
7. ✅ SSL certificates active
8. ✅ Error tracking setup
9. ✅ Health checks passing
10. ✅ First user registration tested

**Live Demo URL**: `https://your-app.vercel.app`