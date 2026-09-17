# REST API Documentation

Base URL: `/api`

---

## 1. Health Check
- **Endpoint**: `GET /api/health/`
- **Description**: Verifies service status and MongoDB connection.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "ELD Route Planner & HOS Log Generator API",
  "version": "1.0.0",
  "mongodb_connected": true,
  "timestamp": "2026-09-18T01:30:00.000Z"
}
```

---

## 2. Plan Trip
- **Endpoint**: `POST /api/trips/plan/`
- **Description**: Validates input, geocodes locations, calculates route, evaluates HOS, generates daily ELD logs, and saves trip in MongoDB.
- **Request Body**:
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Chicago, IL",
  "dropoff_location": "Los Angeles, CA",
  "current_cycle_used": 15.0,
  "driver_name": "John Doe",
  "carrier_name": "Apex Logistics Inc.",
  "truck_number": "TRK-8802",
  "trailer_number": "TRL-4410",
  "shipping_doc_number": "BOL-98231",
  "average_truck_speed": 55.0,
  "fuel_tank_range_miles": 1000.0
}
```
- **Response `201 Created`**:
```json
{
  "trip_id": "TRIP-A8109F2B",
  "driver_details": { ... },
  "current_location": { "name": "Chicago, IL", "latitude": 41.8781, "longitude": -87.6298 },
  "pickup_location": { "name": "Chicago, IL", "latitude": 41.8781, "longitude": -87.6298 },
  "dropoff_location": { "name": "Los Angeles, CA", "latitude": 34.0522, "longitude": -118.2437 },
  "route_summary": {
    "total_distance_miles": 2015.4,
    "estimated_driving_time_hours": 36.64,
    "total_trip_duration_hours": 79.14,
    "fuel_stops_count": 2,
    "rest_stops_count": 3
  },
  "compliance": {
    "is_compliant": true,
    "status": "COMPLIANT",
    "cycle_hours_remaining_start": 55.0,
    "cycle_hours_used_trip": 39.64,
    "cycle_hours_remaining_end": 15.36,
    "violations": [],
    "warnings": []
  },
  "stops": [ ... ],
  "timeline": [ ... ],
  "daily_logs": [ ... ],
  "route_geometry": { "type": "LineString", "coordinates": [ ... ] }
}
```
- **Error Response `400 Bad Request`**:
```json
{
  "error": "Validation Error",
  "details": {
    "dropoff_location": ["This field is required."]
  }
}
```

---

## 3. List Saved Trips
- **Endpoint**: `GET /api/trips/?search=<query>`
- **Description**: Returns all saved trips with summary metadata.
- **Response `200 OK`**:
```json
{
  "count": 1,
  "trips": [
    {
      "trip_id": "TRIP-A8109F2B",
      "driver_name": "John Doe",
      "current_location": "Chicago, IL",
      "dropoff_location": "Los Angeles, CA",
      "total_distance_miles": 2015.4,
      "total_driving_hours": 36.64,
      "total_days": 4,
      "compliance_status": "COMPLIANT",
      "is_compliant": true,
      "created_at": "2026-09-18T01:30:00"
    }
  ]
}
```

---

## 4. Get Trip Details
- **Endpoint**: `GET /api/trips/<trip_id>/`
- **Response `200 OK`**: Full trip object.
- **Response `404 Not Found`**:
```json
{
  "error": "Trip Not Found",
  "trip_id": "TRIP-INVALID"
}
```

---

## 5. Delete Trip
- **Endpoint**: `DELETE /api/trips/<trip_id>/`
- **Response `200 OK`**:
```json
{
  "message": "Trip TRIP-A8109F2B deleted successfully."
}
```

---

## 6. Standalone Geocode
- **Endpoint**: `POST /api/geocode/`
- **Request Body**: `{"query": "Denver, CO"}`
- **Response `200 OK`**:
```json
{
  "name": "Denver, CO",
  "latitude": 39.7392,
  "longitude": -104.9903,
  "address": "Denver, Colorado, USA"
}
```

---

## 7. Standalone Route Calculation
- **Endpoint**: `POST /api/routes/calculate/`
- **Request Body**:
```json
{
  "start_lat": 41.8781,
  "start_lon": -87.6298,
  "end_lat": 43.0389,
  "end_lon": -87.9065,
  "avg_speed_mph": 55.0
}
```
- **Response `200 OK`**: Route distance, duration, coordinates, and maneuvers.
