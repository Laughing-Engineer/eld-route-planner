# System Architecture

## 1. Overview
The **ELD Route Planner & Hours of Service Log Generator** is an enterprise-grade web application built to simulate commercial motor vehicle (CMV) trip planning, calculate live highway routes, enforce FMCSA 49 CFR Part 395 regulations, and render official Form MCS-59 24-hour driver daily logs.

```
+-------------------------------------------------------------+
|                      React 18 Frontend                      |
| (Vite + Tailwind CSS + React-Leaflet + SVG ELD Grid + Print)|
+------------------------------+------------------------------+
                               | REST API (Axios JSON)
                               v
+-------------------------------------------------------------+
|                     Django 5 + DRF Backend                  |
|  - serializers.py: Input validation & parameter checking    |
|  - views.py: PlanTripView, TripListView, HealthCheckView    |
+------------------------------+------------------------------+
                               |
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
+---------------+      +---------------+      +----------------+
|  Geocoding    |      | Routing Engine|      |  HOS & Log     |
|  Service      |      | Service       |      |  Services      |
| (Nominatim +  |      | (OSRM +       |      | (hos_engine.py |
|  Hub Cache)   |      |  Haversine)   |      |  sched_service |
+---------------+      +---------------+      |  log_generator)|
                                              +--------+-------+
                                                       |
                                                       v
                                              +----------------+
                                              | MongoDB Atlas  |
                                              | (MongoEngine   |
                                              |  Document      |
                                              |  Persistence)  |
                                              +----------------+
```

## 2. Key Architectural Components

### A. Frontend Layer (`frontend/src/`)
- **Technology**: React 18, Vite 5, Tailwind CSS 3, React Router 6, React-Leaflet 4, Lucide React.
- **Key Modules**:
  - `TripForm.jsx`: Dynamic trip inputs with instant validation and quick-fill presets.
  - `MapComponent.jsx`: Leaflet map with colored waypoint pins, polyline, and auto-zoom bounds.
  - `ELDGridSVG.jsx`: SVG-based 24-hour 4-status duty graph grid with accurate step transitions.
  - `ELDLogSheet.jsx`: Form MCS-59 paper log sheet with header, SVG grid, status totals, and remarks.
  - `TimelineView.jsx`: Chronological shift timeline with duty status badges.
  - `RouteSummaryCards.jsx`: Metric cards for miles, driving hours, duration, and cycle reserve.

### B. Backend Services Layer (`backend/services/`)
- **Separation of Concerns**: Business logic is strictly decoupled from Django views.
  - `geocoding_service.py`: Queries OSM Nominatim with proper `User-Agent` headers, caching, and fallback coordinates for 50+ US freight hubs.
  - `route_service.py`: Calls public OSRM routing endpoint for exact highway geometry and turn-by-turn maneuvers, with high-accuracy haversine circuity fallback (1.18x road factor).
  - `hos_engine.py`: Encapsulates FMCSA rules (11-hr drive limit, 14-hr duty window, 30-min break, 70-hr cycle).
  - `schedule_service.py`: Constructs chronological event intervals, inserts required 30-min breaks, 10-hr sleeper berth resets, fuel stops every &le;1,000 miles, and freight loading/unloading.
  - `log_generator.py`: Mathematically splits continuous trip timeline into discrete 24-hour midnight-to-midnight (00:00 to 24:00) calendar days, guaranteeing status totals sum to exactly 24.0 hours, and generates SVG path coordinates.

### C. Persistence Layer (`backend/trips/models.py`)
- **MongoEngine Integration**: Direct connection to **MongoDB Atlas** using `Trip`, `DriverDetails`, `Stop`, `TimelineEvent`, `DailyLog`, and `ComplianceSummary` documents.
- **Resilient Fallback**: If MongoDB credentials are not provided or Atlas is unreachable, seamlessly switches to an in-memory repository store without throwing 500 errors.
