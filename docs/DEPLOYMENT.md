# Comprehensive Production Deployment Guide

This guide provides step-by-step instructions for deploying the **ELD Route Planner & Hours of Service Log Generator** across **MongoDB Atlas** (Database), **Render** (Django REST API Backend), and **Vercel** (React Vite Frontend).

---

## 1. How to Create the MongoDB Atlas Database

1. **Sign Up / Log In**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. **Create an Organization and Project**:
   - Organization Name: `ELD-Logistics`
   - Project Name: `ELD-Route-Planner`
3. **Deploy a Free Cluster**:
   - Click **Create Deployment** &rarr; Select **M0 Free Tier** (Shared).
   - Cloud Provider: **AWS** or **GCP** &rarr; Select a region close to your Render deployment (e.g. `us-east-1`).
   - Cluster Name: `Cluster0`.
   - Click **Create**.
4. **Create Database User Credentials**:
   - In the Quickstart modal (or under **Security &rarr; Database Access**):
     - Authentication Method: **Password**.
     - Username: `eld_admin`
     - Password: Click **Autogenerate Secure Password** (save this safely).
     - User Privileges: `Read and write to any database`.
     - Click **Create User**.
5. **Configure Network Access Whitelist**:
   - Go to **Security &rarr; Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`). This allows cloud platforms like Render and Vercel to connect dynamically.
   - Click **Confirm**.
6. **Obtain the Connection String**:
   - In **Database &rarr; Clusters**, click **Connect**.
   - Choose **Drivers** &rarr; Driver: **Python**, Version: **3.11 or later**.
   - Copy the connection URI:
     ```
     mongodb+srv://eld_admin:<password>@cluster0.mongodb.net/eld_planner?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password, and append `/eld_planner` as the database name.

---

## 2. How to Deploy the Backend on Render

1. **Push Code to GitHub**:
   - Push your project repository containing `backend/` and `frontend/` to GitHub.
2. **Create New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New + &rarr; Web Service**.
   - Connect your GitHub repository.
3. **Configure Service Settings**:
   - **Name**: `eld-route-planner-api`
   - **Region**: Select the region matching your MongoDB cluster (e.g., `Oregon (US West)` or `Ohio (US East)`).
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --no-input
     ```
   - **Start Command**:
     ```bash
     gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
     ```
   - **Instance Type**: Free
4. **Add Backend Environment Variables**:
   In the **Environment Variables** tab, add:
   - `SECRET_KEY`: `<generate-a-secure-random-string-or-use-django-secret>`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app` (update once frontend URL is assigned)
   - `MONGODB_URI`: `mongodb+srv://eld_admin:<password>@cluster0.mongodb.net/eld_planner?retryWrites=true&w=majority`
   - `NOMINATIM_USER_AGENT`: `ELDRoutePlanner/1.0 (admin@yourdomain.com)`
   - `OSRM_BASE_URL`: `http://router.project-osrm.org`
5. **Click Deploy Web Service**:
   - Render will build the environment, collect static assets, and start Gunicorn.
   - Once complete, copy your public backend URL (e.g. `https://eld-route-planner-api.onrender.com`).

---

## 3. How to Deploy the Frontend on Vercel

1. **Log in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. **Import Git Repository**:
   - Click **Add New &rarr; Project**.
   - Select your repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Add Frontend Environment Variables**:
   - In **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://eld-route-planner-api-fga1.onrender.com/api`
5. **Single Page Application Routing (`vercel.json`)**:
   - The repository already includes `frontend/vercel.json`:
     ```json
     {
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ]
     }
     ```
     This ensures direct URL navigation and page refreshes on `/planner`, `/dashboard/:id`, `/logs/:id`, and `/history` work without 404 errors.
6. **Click Deploy**:
   - Vercel builds the production bundle and deploys to a global CDN.
   - Note your public frontend URL (e.g. `https://eld-route-planner.vercel.app`).

---

## 4. Environment Variables Reference Table

### Backend (Render):
| Variable | Value / Example | Purpose |
|:---|:---|:---|
| `SECRET_KEY` | `django-insecure-prod-key-xyz987` | Django cryptographic signing |
| `DEBUG` | `False` | Disables debug mode for production security |
| `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Allowed HTTP Host headers |
| `CORS_ALLOWED_ORIGINS` | `https://eld-route-planner-pi.vercel.app` | Cross-Origin Request allowance for Vercel; origin only, no `/api` path |
| `MONGODB_URI` | `mongodb+srv://eld_admin:<pwd>@cluster0.mongodb.net/eld_planner?...` | MongoDB Atlas database connection string |
| `NOMINATIM_USER_AGENT`| `ELDRoutePlanner/1.0 (admin@yourdomain.com)` | OpenStreetMap Nominatim compliance |
| `OSRM_BASE_URL` | `http://router.project-osrm.org` | Open Source Routing Machine endpoint |

### Frontend (Vercel):
| Variable | Value / Example | Purpose |
|:---|:---|:---|
| `VITE_API_BASE_URL` | `https://eld-route-planner-api-fga1.onrender.com/api` | Base URL pointing Axios client to Render backend |

---

## 5. How to Connect Frontend to Deployed Backend

1. Once the backend is deployed on Render, verify it is accessible by visiting:
   ```
   https://your-backend.onrender.com/api/health/
   ```
   It should return:
   ```json
   {
     "status": "healthy",
     "service": "ELD Route Planner & HOS Log Generator API",
     "version": "1.0.0",
     "mongodb_connected": true
   }
   ```
2. In Vercel Project Settings &rarr; **Environment Variables**:
   - Set `VITE_API_BASE_URL` to `https://your-backend.onrender.com/api`.
   - Redeploy the latest commit or trigger a new deployment.
3. In Render Environment Variables:
   - Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL:
     ```
     https://your-frontend.vercel.app
     ```
   - Save changes to restart the Render service.

---

## 6. How to Test the Live Application

1. **Verify Health & Database Connectivity**:
   - Open `https://your-frontend.vercel.app`.
   - Look at the top-right status pill on the navigation bar: it should display **"API + Atlas Online"** with a green pulse dot.
2. **Execute a Test Trip Plan**:
   - Click **Plan Trip** &rarr; Click the **2. Long Haul Multi-Day (Chicago &rarr; Los Angeles)** quick-fill preset button.
   - Click **Generate Route & ELD Logs**.
   - Verify that:
     - The interactive Leaflet route map renders with polyline and waypoint markers.
     - Summary cards show distance, drive time, fuel stops, and rest stops.
     - The Chronological Timeline tab shows the shift intervals.
3. **Verify the ELD Daily Log Sheets**:
   - Switch to the **Daily ELD Logs** tab or click **View & Print ELD Logs**.
   - Verify that all 4 calendar days are generated.
   - Verify that the 24-hour SVG step grid charts the 4 duty status rows.
   - Check that each day's status totals sum to exactly **24.0 hours**.
4. **Test Browser Print / PDF Export**:
   - Click **Print All Days (Binder PDF)**.
   - In the print preview, verify:
     - Web header and buttons are hidden.
     - Each Form MCS-59 log sheet is formatted cleanly on a single page.
5. **Verify MongoDB Persistence**:
   - Navigate to **Saved Trips** (`/history`).
   - Confirm your planned trip appears in the list.
   - Refresh the page to ensure the record persisted from MongoDB Atlas.
