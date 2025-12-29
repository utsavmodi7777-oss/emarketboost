# 🚀 Deployment Guide - eMarket Boost

## Quick Deploy to Vercel (Recommended - FREE)

### Prerequisites
- GitHub account
- Supabase project set up

---

## Method 1: Vercel Dashboard (Easiest - 5 minutes)

### Step 1: Push to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - eMarket Boost platform"

# Create main branch
git branch -M main

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/emarketboost.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"** and login with GitHub
3. Click **"Add New Project"**
4. Click **"Import"** next to your repository
5. Vercel will auto-detect settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **"Deploy"**

### Step 3: Add Environment Variables

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
```

4. Click **"Redeploy"** from Deployments tab

### Step 4: Setup Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS instructions

---

## Method 2: Vercel CLI (Fastest - 2 minutes)

### Install Vercel CLI

```powershell
npm install -g vercel
```

### Deploy

```powershell
# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Your account
# - Link to existing project? N
# - Project name? emarketboost
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

Your site will be live at: `https://emarketboost.vercel.app`

---

## Alternative Hosting Options

### Option A: Netlify (Also Free)

1. **Install Netlify CLI:**
```powershell
npm install -g netlify-cli
```

2. **Deploy:**
```powershell
netlify login
netlify init
netlify deploy --prod
```

3. **Add Environment Variables:**
   - Go to Netlify dashboard
   - Site Settings → Environment Variables
   - Add Supabase credentials

### Option B: GitHub Pages (Free but limited)

1. **Install gh-pages:**
```powershell
npm install --save-dev gh-pages
```

2. **Add to package.json:**
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/emarketboost",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy:**
```powershell
npm run deploy
```

**Note:** GitHub Pages doesn't support environment variables well. Use Vercel or Netlify instead.

---

## After Deployment Checklist

### ✅ Update Supabase Settings

1. **Add Production URL to Supabase:**
   - Go to Supabase Dashboard
   - Authentication → URL Configuration
   - Add your Vercel URL to **Site URL**
   - Add to **Redirect URLs:**
     - `https://your-site.vercel.app/auth`
     - `https://your-site.vercel.app/dashboard`

2. **Update Google OAuth (if using):**
   - Google Cloud Console
   - Add authorized redirect URI:
     - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### ✅ Test Your Deployment

1. Visit your site
2. Test signup/login
3. Test service cards authentication
4. Test admin login at `/admin/login`
5. Test service login at `/service/login`

---

## Environment Variables Reference

Create a `.env.local` file locally (DO NOT commit):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Add the same variables in Vercel/Netlify dashboard.

---

## Troubleshooting

### Build Fails

**Error: Module not found**
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

1. Check variable names start with `VITE_`
2. Redeploy after adding variables
3. Check Vercel logs for errors

### Routes Return 404

**Vercel:** Already configured for SPA
**Netlify:** Create `public/_redirects`:
```
/*  /index.html  200
```

### Supabase Connection Issues

1. Verify environment variables
2. Check Supabase project is not paused
3. Verify API keys are correct

---

## Performance Optimization

### 1. Add Vercel Analytics

In Vercel dashboard:
- Analytics → Enable
- Add `@vercel/analytics` to project

### 2. Enable Caching

Already configured in `vite.config.ts`

### 3. Optimize Images

Use modern formats (WebP, AVIF) for better performance

---

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Instant rollbacks available

---

## Cost Estimate

### Free Tier Limits:

**Vercel:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited projects
- ✅ SSL certificates
- ✅ Global CDN

**Supabase:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 2GB bandwidth
- ✅ 50,000 monthly active users

**Both are FREE for most small-to-medium projects!**

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs

---

🎉 **Your eMarket Boost platform is now live!**
