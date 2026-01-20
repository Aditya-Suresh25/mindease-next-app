# MindEase Deployment Guide

This guide will help you deploy MindEase to production with:
- **Frontend** → Vercel (free tier)
- **Backend** → Render (free tier)
- **Database** → MongoDB Atlas (free tier)
- **Background Jobs** → Inngest Cloud (free tier)

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas Account** - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
5. **Inngest Account** - Sign up at [inngest.com](https://inngest.com)
6. **Google AI Studio** - Get API key at [aistudio.google.com](https://aistudio.google.com)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new **FREE** cluster (M0 Sandbox)
3. Choose a cloud provider and region close to you
4. Create a database user:
   - Click **Database Access** → **Add New Database User**
   - Choose **Password authentication**
   - Create username and a strong password (save these!)
   - Set privileges to **Read and write to any database**
5. Allow network access:
   - Click **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (for production, you'd restrict this)
6. Get your connection string:
   - Click **Database** → **Connect** → **Drivers**
   - Copy the connection string, it looks like:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://...mongodb.net/mindease?retryWrites=...`

---

## Step 2: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy and save the API key

---

## Step 3: Deploy Backend to Render

### 3.1 Push Backend to GitHub

First, create a separate repository for the backend:

```bash
# From the mindease-next-app folder
cd backend

# Initialize git (if not already)
git init

# Create .gitignore
echo "node_modules/
dist/
.env
*.log" > .gitignore

# Add and commit
git add .
git commit -m "Initial backend commit"

# Create a new repo on GitHub called "mindease-backend"
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/mindease-backend.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com) and sign in with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub account if not already connected
4. Select your `mindease-backend` repository
5. Configure the service:
   - **Name**: `mindease-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3.3 Add Environment Variables on Render

In your Render service, go to **Environment** tab and add these variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A random string (use: `openssl rand -base64 32`) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `PORT` | `3001` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `NODE_ENV` | `production` |

### 3.4 Get Your Backend URL

After deployment, Render gives you a URL like:
```
https://mindease-backend.onrender.com
```
**Save this URL!** You'll need it for the frontend.

> ⚠️ **Note**: Render free tier services spin down after 15 minutes of inactivity. The first request after spin-down may take 30-60 seconds. Consider upgrading to a paid plan for production use.

---

## Step 4: Set Up Inngest Cloud

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new app called `mindease`
3. Go to **Manage** → **Signing Key** and copy it
4. Go to **Manage** → **Event Keys** → **Create Key** and copy it

### 4.1 Add Inngest Variables to Render

Go back to Render and add these environment variables:

| Variable | Value |
|----------|-------|
| `INNGEST_EVENT_KEY` | Your Inngest event key |
| `INNGEST_SIGNING_KEY` | Your Inngest signing key |

### 4.2 Sync Inngest with Your Backend

In Inngest Dashboard:
1. Go to your app → **Manage** → **Syncs**
2. Add your backend URL: `https://your-backend.railway.app/api/inngest`
3. Click **Sync**

---

## Step 5: Deploy Frontend to Vercel

### 5.1 Push Frontend to GitHub

The main repo should be your Next.js frontend:

```bash
# From mindease-next-app folder (root)
# Make sure .gitignore excludes backend folder or push together

git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 5.2 Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `mindease-next-app` repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)

### 5.3 Add Environment Variables on Vercel

In project settings → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.railway.app` |

### 5.4 Deploy

Click **Deploy**. Vercel will build and deploy your frontend.

Your frontend URL will be something like:
```
https://mindease-next-app.vercel.app
```

---

## Step 6: Update CORS Settings

Now that you have your Vercel URL, update Render:

1. Go to Render Dashboard → your backend service → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://mindease-next-app.vercel.app
   ```
3. Click **Save Changes** - Render will automatically redeploy

---

## Step 7: Verify Deployment

### Test the Backend
```bash
curl https://your-backend.onrender.com/health
# Should return: {"status":"ok","message":"Server is running"}
```

### Test the Frontend
1. Open your Vercel URL
2. Try to sign up / log in
3. Check if data loads correctly

### Test Inngest
1. Go to Inngest Dashboard → **Events**
2. Send a test chat message on your app
3. You should see events appearing in the dashboard

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Render matches your exact Vercel URL
- Check browser console for specific errors

### Database Connection Errors
- Verify MongoDB Atlas network access allows `0.0.0.0/0`
- Double-check the connection string format

### API Not Working
- Check Render logs for errors (Dashboard → Service → Logs)
- Verify all environment variables are set correctly

### Backend Slow on First Request
- This is normal for Render free tier - services spin down after inactivity
- First request after spin-down takes 30-60 seconds to cold start

### Inngest Not Receiving Events
- Verify the sync URL is correct
- Check that signing key is properly set

---

## Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions

### Render Custom Domain
1. Go to Render service → **Settings** → **Custom Domains**
2. Add custom domain and configure DNS

Remember to update `FRONTEND_URL` and `NEXT_PUBLIC_BACKEND_URL` if you use custom domains!

---

## Cost Summary (Free Tiers)

| Service | Free Tier |
|---------|-----------|
| Vercel | 100GB bandwidth, unlimited sites |
| Render | 750 hours/month, auto-sleep after 15min inactivity |
| MongoDB Atlas | 512MB storage |
| Inngest | 25,000 function runs/month |
| Google Gemini | Free tier with rate limits |

For a small app, you can run entirely free! 🎉

---

## Keeping Backend Awake (Optional)

To prevent Render free tier from sleeping, you can use a free cron service:

1. Go to [cron-job.org](https://cron-job.org) (free)
2. Create an account
3. Add a new cron job:
   - **URL**: `https://your-backend.onrender.com/health`
   - **Schedule**: Every 14 minutes
4. This will keep your backend awake during active hours

---

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas)
- [Inngest Docs](https://www.inngest.com/docs)
