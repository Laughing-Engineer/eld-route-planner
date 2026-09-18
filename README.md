# ELD Route Planner & Hours of Service Log Generator

An enterprise-grade, production-quality full-stack web application designed for commercial motor carriers, fleet dispatchers, and drivers. The platform calculates real-world highway routes, evaluates FMCSA 49 CFR Part 395 Hours of Service (HOS) regulations, schedules mandatory rest and fuel stops, and generates authentic 24-hour Form MCS-59 ELD Driver Daily Logs with precision SVG grid rendering.

---

## Key Features

1. **Interactive Route Map & Routing**:
   - Computes genuine driving distances and durations using OpenStreetMap and OSRM.
   - Interactive Leaflet map rendering with route polylines and color-coded waypoint pins for Origin, Pickup, Drop-off, Fuel stops, and Rest stops.

2. **Full FMCSA Hours of Service (HOS) Engine**:
   - **11-Hour Driving Limit**: Drivers cannot exceed 11 cumulative hours of driving in a shift.
   - **14-Hour Duty Window**: Prohibits driving beyond the 14th consecutive hour from shift start.
   - **30-Minute Rest Break**: Enforces consecutive 30-minute breaks after 8 cumulative driving hours.
   - **70-Hour / 8-Day Cycle**: Monitors cycle consumption and flags overages and low cycle reserves.
   - **Fuel Stops Every &le; 1,000 Miles**: Automatically injects 30-minute fueling stops along the corridor.
   - **10-Hour Sleeper Berth Resets**: Automatically schedules 10-hour rest when driving or window limits are reached.
   - **Pickup & Drop-off Operations**: Allocates 1.0 hour On Duty Not Driving for loading and unloading.

3. **Authentic Form MCS-59 ELD Daily Log Sheets**:
   - Multi-day trip support partitioning routes into discrete 24-hour calendar days (00:00 to 24:00).
   - High-fidelity 4-status SVG step grid (Off Duty, Sleeper Berth, Driving, On Duty Not Driving).
   - Exact 24.0-hour status total auditing.
   - Geographic Remarks table logging every duty status change with timestamps and locations.
   - One-click print and PDF export with dedicated `@media print` styling.

4. **Persistence & Resilience**:
   - Persists trips, routes, stops, and logs to **MongoDB Atlas** using MongoEngine.
   - Dual-mode architecture: Works seamlessly with an active MongoDB Atlas cluster or graceful in-memory fallback for local offline evaluation.

---

## Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS 3, React Router 6, React-Leaflet 4, Lucide React, Axios.
- **Backend**: Python 3.11+, Django 5, Django REST Framework, MongoEngine, Gunicorn, Requests, Python-Dotenv, Django-Cors-Headers.
- **Database**: MongoDB Atlas.
- **Mapping & GIS**: OpenStreetMap, Leaflet, Nominatim Geocoding API, OSRM Routing Engine.

---

## Project Structure

```
eld-route-planner/
├── backend/
│   ├── config/             # Django settings, URLs, WSGI, ASGI
│   ├── services/           # Business logic layer (HOS, routing, geocoding, logs)
│   │   ├── geocoding_service.py
│   │   ├── route_service.py
│   │   ├── hos_engine.py
│   │   ├── schedule_service.py
│   │   └── log_generator.py
│   ├── trips/              # MongoEngine models, serializers, views, tests
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/     # ELDLogSheet, ELDGridSVG, MapComponent, TripForm, etc.
│   │   ├── pages/          # Landing, Planner, Dashboard, Logs, History, Docs
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/                   # Comprehensive technical documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── HOS_CALCULATION_LOGIC.md
│   ├── ELD_LOG_DOCUMENTATION.md
│   ├── DEPLOYMENT.md
│   ├── USER_GUIDE.md
│   ├── TESTING.md
│   └── ASSUMPTIONS.md
│
├── README.md
└── .gitignore
```

---

## Local Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py runserver 8000
```
Backend API will be available at `http://localhost:8000/api/`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173/`.

Vite selects the API automatically by mode:
- `npm run dev` uses `http://localhost:8000/api`.
- `npm run build` uses `https://eld-route-planner-api-fga1.onrender.com/api`.

The production URL remains configured in `frontend/.env.production`; users never need to enter an API URL in the application.

### 3. Connecting MongoDB Atlas (Optional)
Create a `.env` file in `backend/` using `.env.example`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eld_planner?retryWrites=true&w=majority
```
*Note: If no connection string is provided, the application automatically runs using its resilient in-memory storage, ensuring all features are 100% testable out-of-the-box.*

---

## Running Automated Tests

Run the complete 13-test suite covering all FMCSA rules and API endpoints:
```bash
cd backend
python manage.py test trips
```

---

## Deployment Summary

- **Backend**: Configured for Render via `gunicorn config.wsgi:application`.
- **Frontend**: Configured for Vercel with production Vite build.
- Detailed step-by-step deployment instructions are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Disclaimer
This project is an assessment implementation demonstrating full-stack engineering and FMCSA algorithmic compliance. It does not replace official FMCSA-certified ELD hardware devices.
