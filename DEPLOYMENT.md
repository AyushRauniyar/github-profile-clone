# Deployment Guide - GitHub + Vercel

This guide will walk you through deploying the GitHub Profile Clone to Vercel with GitHub integration.

## 📋 Prerequisites

1. **GitHub Account** - [Sign up here](https://github.com/signup)
2. **Vercel Account** - [Sign up here](https://vercel.com/signup)
3. **GitHub Personal Access Token** - Your existing token with these scopes:
   - `read:user`
   - `repo`
   - `read:org`

---

## 🚀 Deployment Strategy

We'll deploy **Frontend** and **Backend** separately using subdirectories:

```
┌─────────────────────────────────────────┐
│         DEPLOYMENT ARCHITECTURE         │
├─────────────────────────────────────────┤
│  GitHub Repository Structure:           │
│  ├── frontend/                          │
│  │   ├── src/                           │
│  │   ├── angular.json                   │
│  │   ├── package.json                   │
│  │   └── vercel.json (SPA routing)      │
│  ├── backend/                           │
│  │   ├── server.js                      │
│  │   ├── package.json                   │
│  │   └── vercel.json (serverless)       │
│  └── README.md                          │
│                                         │
│  Frontend (Angular) → Vercel Deploy #1  │
│  ├── Root Directory: frontend/          │
│  ├── Static Files (HTML, CSS, JS)       │
│  └── Environment: Production            │
│                                         │
│  Backend (Node.js/Express) → Deploy #2  │
│  ├── Root Directory: backend/           │
│  ├── Serverless Functions               │
│  ├── GitHub API Proxy                   │
│  └── Environment Variables (Token)      │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Deployment

### PHASE 1: Prepare Your Code

#### 1.1 Check Project Structure
Ensure your project has the following structure:
```
github-assignment/
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── vercel.json (SPA routing)
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (local only, not committed)
│   └── vercel.json (serverless config)
├── .gitignore
└── README.md
```

#### 1.2 Verify Environment Configuration

**Frontend - `frontend/src/environments/environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-name.vercel.app' // Will update after backend deployment
};
```

**Backend - `backend/.env` (local only):**
```
GITHUB_TOKEN=your_github_personal_access_token
```

---

### PHASE 2: Upload to GitHub

#### 2.1 Initialize Git Repository
```bash
cd "C:\Users\Ayush.Rauniyar\OneDrive - Verint Systems Ltd\Desktop\Projects_Work\github-assignment"
git init
git add .
git commit -m "Initial commit: GitHub Profile Clone"
```

#### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - **Name**: `github-profile-clone` (or any name)
   - **Description**: "Angular-based GitHub profile page with API integration"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README (we already have one)

#### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/github-profile-clone.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### PHASE 3: Deploy Backend to Vercel

#### 3.1 Create Backend Deployment
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Project Name**: `github-profile-backend` (or any name)
   - **Framework Preset**: Other
   - **Root Directory**: `backend` ⚠️ **IMPORTANT**
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

#### 3.2 Add Environment Variable
1. Before deploying, go to **Settings** → **Environment Variables**
2. Add the following:
   ```
   Key: GITHUB_TOKEN
   Value: your_github_personal_access_token_here
   Environment: Production, Preview, Development (select all)
   ```
3. Click **Save**

#### 3.3 Deploy
1. Go back to **Deployments** tab or project overview
2. Click **Deploy** (if not already deploying)
3. Wait for deployment to complete (2-3 minutes)
4. **Copy the deployment URL**: `https://your-backend-name.vercel.app`

#### 3.4 Test Backend
Test your backend endpoints:
```bash
# Replace with your actual Vercel backend URL
curl "https://your-backend-name.vercel.app/api/profile?login=AyushRauniyar"
```

You should see JSON response with user profile data.

---

### PHASE 4: Update Frontend Configuration

#### 4.1 Update Production Environment
Edit `frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-name.vercel.app' // ← Your backend URL from Phase 3
};
```

#### 4.2 Commit and Push Changes
```bash
git add frontend/src/environments/environment.prod.ts
git commit -m "Update: Configure backend URL for production"
git push origin main
```

---

### PHASE 5: Deploy Frontend to Vercel

#### 5.1 Create Frontend Deployment
1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the SAME GitHub repository again (yes, same repo!)
4. Configure the project:
   - **Project Name**: `github-profile-frontend` (or any name)
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `ng build --configuration production`
   - **Output Directory**: `dist/github-assignment`
   - **Install Command**: `npm install`

#### 5.2 Deploy
1. Click **Deploy**
2. Wait for deployment to complete (3-5 minutes)
3. **Your app is live!** 🎉

#### 5.3 Get Your Frontend URL
Your frontend will be deployed at: `https://your-frontend-name.vercel.app`

#### 5.4 Test Your Application
Navigate to: `https://your-frontend-name.vercel.app/AyushRauniyar`

Everything should work now!

---

### PHASE 6: Configure CORS (If Needed)

If you get CORS errors, update `backend/server.js`:

```javascript
const cors = require('cors');

// Add this after creating the app
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://your-frontend-name.vercel.app'  // Your frontend URL
  ],
  credentials: true
}));
```

Then commit and push:
```bash
git add backend/server.js
git commit -m "Add CORS configuration"
git push origin main
```

Vercel will auto-deploy the backend!

---

## 🔍 Verification Checklist

After deployment, verify everything works:

- [ ] Backend URL responds: `https://your-backend.vercel.app/api/profile?login=AyushRauniyar`
- [ ] Frontend loads: `https://your-frontend.vercel.app/AyushRauniyar`
- [ ] Profile picture displays (API working)
- [ ] Contribution heatmap loads (API working)
- [ ] No CORS errors in browser console
- [ ] All tabs work correctly
- [ ] Footer displays
- [ ] Responsive design works on mobile

---

## 🐛 Troubleshooting

### Issue 1: "Cannot find module 'node-fetch'"
**Solution:** Ensure `backend/package.json` has all dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.7.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  }
}
```

### Issue 2: Backend API Returns 500 Error
**Solution:** 
1. Check Vercel backend logs: Dashboard → Your Backend Project → Logs
2. Verify `GITHUB_TOKEN` is set correctly in Environment Variables
3. Test token locally: `curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user`

### Issue 3: Frontend Shows "localhost:3000" Errors
**Solution:** Verify `frontend/src/environments/environment.prod.ts` has the correct backend URL

### Issue 4: CORS Error in Browser
**Solution:** Add CORS configuration as described in Phase 6.

### Issue 5: Build Fails on Vercel
**Solution:** 
- Check the build logs
- Verify **Root Directory** is set correctly (`frontend` for frontend, `backend` for backend)
- Ensure all imports are correct
- Run `ng build --configuration production` locally first (in frontend directory)

### Issue 6: 404 on Frontend Routes
**Solution:** The `frontend/vercel.json` should have SPA rewrites. Verify it contains:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue 7: Backend Deployment Shows Frontend Build
**Solution:** Double-check **Root Directory** is set to `backend` in backend project settings

---

## 📱 Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Go to your Frontend project on Vercel
2. Settings → Domains
3. Add your custom domain (e.g., `github-clone.yourdomain.com`)
4. Follow Vercel's DNS configuration instructions

### Add Custom Domain to Backend
1. Go to your Backend project on Vercel
2. Settings → Domains
3. Add your API subdomain (e.g., `api.yourdomain.com`)
4. Update frontend's `environment.prod.ts` with new API URL

---

## 🔄 Continuous Deployment

Now that everything is connected:

1. **Any push to `main` branch** → Vercel auto-deploys both frontend and backend
2. **Pull Request** → Vercel creates preview deployments
3. **Environment Variables** → Can be updated in Vercel Dashboard without redeployment

---

## 📊 Monitoring

### Vercel Analytics (Free)
1. Enable in Vercel Dashboard → Analytics
2. Track page views, load times, etc.

### Backend Logs
- View in Vercel Dashboard → Your Backend Project → Logs
- Real-time monitoring of API calls

---

## 🎯 Summary

**What you'll have after deployment:**

```
GitHub Repository: https://github.com/YOUR_USERNAME/github-profile-clone
├── Frontend Deployment: https://your-frontend.vercel.app
│   (Root Directory: frontend/)
└── Backend Deployment: https://your-backend.vercel.app
    (Root Directory: backend/)

✅ Two separate Vercel deployments from one repository
✅ Auto-deploy on push to main branch
✅ Preview deployments for pull requests
✅ HTTPS enabled on both
✅ CDN distribution for frontend
✅ Serverless functions for backend
```

**Key Points:**
- ✅ Both deployments use the **same GitHub repository**
- ✅ Root Directory setting separates them (`frontend/` vs `backend/`)
- ✅ Each has its own `vercel.json` configuration
- ✅ Frontend uses Angular preset with SPA routing
- ✅ Backend uses serverless Node.js functions

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [GitHub API Documentation](https://docs.github.com/en/rest)

---

## ⚠️ Important Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Environment Variables** on Vercel for secrets
3. **Test locally** before deploying: `ng build --configuration production`
4. **Check build size** - Angular production builds should be < 2MB
5. **Monitor usage** - Vercel free tier has limits (100GB bandwidth/month)

---

## 🎉 Congratulations!

Your GitHub Profile Clone is now live on the internet! Share your deployment URLs in your assignment submission.

**Need Help?**
- Check Vercel logs for errors
- Review browser console for frontend issues
- Test API endpoints with Postman or curl
