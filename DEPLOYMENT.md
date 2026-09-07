# AI-Powered Community Resource Finder - Deployment Guide

This guide walks you through deploying the **Backend API to Render (or Railway)** and the **Frontend React App to Vercel**.

---

## 📋 Prerequisites Checklist

1. [GitHub Account](https://github.com) with the repository pushed to your account.
2. [OpenAI API Key](https://platform.openai.com/api-keys) (e.g. `sk-proj-...`).
3. [MongoDB Atlas Connection String](https://www.mongodb.com/cloud/atlas) (optional, app falls back to local data/resources.json and in-memory session history if omitted).
4. [Vercel Account](https://vercel.com) (free).
5. [Render Account](https://render.com) (free).

---

## 🚀 Step 1: Deploy the Backend API (Render)

### Option A: Via Render Web Dashboard (Recommended)

1. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service settings:
   - **Name**: `community-resource-finder-api` (or any custom name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:

| Key | Example / Value | Description |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | `sk-proj-xxxx...` | Your OpenAI API Key |
| `OPENAI_MODEL` | `gpt-4o-mini` | AI Model to use |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/app` | MongoDB Atlas URL |
| `CLIENT_ORIGIN` | `https://your-app.vercel.app` | Frontend domain for CORS |
| `PORT` | `8080` | Server Port (Render auto-injects if omitted) |

5. Click **Create Web Service**.
6. Once deployed, note down your Render Backend URL (e.g., `https://community-resource-finder-api.onrender.com`).
7. Test the health endpoint:
   ```bash
   curl https://community-resource-finder-api.onrender.com/health
   ```
   *Expected Response:* `{"ok":true,"service":"community-resource-finder-api"}`

---

## 🎨 Step 2: Deploy the Frontend (Vercel)

### Option A: Via Vercel Web Dashboard (Recommended)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository `Community-Resource-Finder`.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://community-resource-finder-api.onrender.com` *(Replace with your live Render backend URL)* |

5. Click **Deploy**.
6. Vercel will build and assign a domain (e.g., `https://community-resource-finder.vercel.app`).

### Step 3: Update Backend CORS with Final Frontend URL

1. Go back to your [Render Dashboard](https://dashboard.render.com/).
2. Select your `community-resource-finder-api` service -> **Environment**.
3. Update `CLIENT_ORIGIN` to match your exact Vercel URL:
   `https://community-resource-finder.vercel.app`
4. Save changes (Render will automatically redeploy).

---

## 🗄️ Step 4: MongoDB Atlas Setup (Optional but Recommended)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, click **Add IP Address** -> **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
5. Click **Connect** -> **Drivers** -> Copy the connection string.
6. Paste the connection string into Render's `MONGODB_URI` environment variable.

---

## ⚡ Verification Checklist

- [ ] Backend health check responds: `GET https://your-backend.onrender.com/health`
- [ ] Frontend loads smoothly without CORS errors in Browser DevTools Console.
- [ ] Sending a search message (e.g., "Find emergency medical help in Jalandhar") triggers the AI response with matching resources.
- [ ] Direct page refresh on deep frontend paths works without 404 error (handled by `client/vercel.json`).

---

## 🛠️ Quick Troubleshooting

- **CORS Error in Browser**: Ensure `CLIENT_ORIGIN` in Render matches your Vercel URL exactly (no trailing slash).
- **Vite API 404 Error**: Ensure `VITE_API_URL` in Vercel environment variables contains `https://` prefix and your active Render service domain.
- **OpenAI 401 Unauthorized**: Ensure `OPENAI_API_KEY` is set correctly on Render with no extra quotes or spaces.
