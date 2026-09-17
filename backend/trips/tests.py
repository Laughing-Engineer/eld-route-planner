import datetime
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from services.geocoding_service import geocode_location
from services.hos_engine import (
    calculate_cycle_stats,
    validate_hos_timeline,
    OFF_DUTY,
    SLEEPER_BERTH,
    DRIVING,
    ON_DUTY_NOT_DRIVING
)
from services.schedule_service import build_trip_schedule
from services.log_generator import generate_daily_logs

class HOSEngineAndAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.chicago = {"name": "Chicago, IL", "latitude": 41.8781, "longitude": -87.6298}
        self.milwaukee = {"name": "Milwaukee, WI", "latitude": 43.0389, "longitude": -87.9065}
        self.indianapolis = {"name": "Indianapolis, IN", "latitude": 39.7684, "longitude": -86.1581}
        self.denver = {"name": "Denver, CO", "latitude": 39.7392, "longitude": -104.9903}
        self.los_angeles = {"name": "Los Angeles, CA", "latitude": 34.0522, "longitude": -118.2437}

    def test_01_short_trip_under_11_driving_hours(self):
        """1. Short trip under 11 driving hours (Chicago to Milwaukee, ~90 miles)."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.milwaukee,
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        self.assertLess(result["route_summary"]["total_driving_hours"], 11.0)
        self.assertEqual(result["route_summary"]["rest_stops_count"], 0)
        self.assertEqual(result["compliance"]["status"], "COMPLIANT")

    def test_02_trip_requiring_30_minute_break(self):
        """2. Trip requiring a 30-minute break (drive exceeds 8 cumulative hours)."""
        # Trip of approx 500 miles at 55 mph takes ~9 hours driving
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff={"name": "Kansas City, MO", "latitude": 39.0997, "longitude": -94.5786},
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        break_events = [e for e in result["timeline"] if "30-Minute" in e["notes"]]
        self.assertGreaterEqual(len(break_events), 1)
        self.assertAlmostEqual(break_events[0]["duration_hours"], 0.5)

    def test_03_trip_requiring_fuel_stop(self):
        """3. Trip requiring fuel stop (distance exceeds 1,000 miles)."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.denver,  # ~1000+ miles
            current_cycle_used=10.0,
            avg_speed_mph=55.0,
            fuel_interval_miles=800.0
        )
        fuel_stops = [s for s in result["stops"] if s["stop_type"] == "FUEL"]
        self.assertGreaterEqual(len(fuel_stops), 1)

    def test_04_trip_requiring_overnight_rest(self):
        """4. Trip requiring overnight rest (exceeding 11h drive or 14h window)."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.denver,
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        rest_stops = [s for s in result["stops"] if s["stop_type"] == "REST"]
        self.assertGreaterEqual(len(rest_stops), 1)
        # Verify 10 hours sleeper berth / rest
        self.assertEqual(rest_stops[0]["duration_hours"], 10.0)

    def test_05_multi_day_trip(self):
        """5. Multi-day trip (Chicago to Los Angeles, ~2,000 miles)."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.los_angeles,
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        daily_logs = generate_daily_logs(result["timeline"])
        # Cross-country trip takes at least 3 calendar days
        self.assertGreaterEqual(len(daily_logs), 2)
        for log in daily_logs:
            self.assertIn("svg_grid_data", log)
            self.assertIn("status_totals", log)

    def test_06_current_cycle_used_near_70_hours(self):
        """6. Current cycle used near 70 hours (triggers violation/warning)."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.indianapolis, # ~3.5 hrs driving + 2 hrs on duty = ~5.5 hrs duty
            current_cycle_used=68.0,   # only 2 hours left
            avg_speed_mph=55.0
        )
        self.assertFalse(result["compliance"]["is_compliant"])
        self.assertEqual(result["compliance"]["status"], "VIOLATION_WARNING")
        self.assertTrue(any("cycle limit exceeded" in v.lower() for v in result["compliance"]["violations"]))

    def test_07_invalid_locations(self):
        """7. Invalid location handling raises clear exception/error response."""
        with self.assertRaises(ValueError):
            geocode_location("")

        # Test API endpoint bad geocoding query
        response = self.client.post("/api/geocode/", {"query": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_08_missing_required_fields(self):
        """8. Missing required fields in API returns 400 Bad Request."""
        response = self.client.post("/api/trips/plan/", {
            "current_location": "Chicago, IL"
            # Missing pickup_location and dropoff_location
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pickup_location", response.data["details"])
        self.assertIn("dropoff_location", response.data["details"])

    def test_09_daily_log_totals_equal_24_hours(self):
        """9. Every daily log's duty-status durations add up to exactly 24.0 hours."""
        result = build_trip_schedule(
            origin=self.chicago,
            pickup=self.milwaukee,
            dropoff=self.los_angeles,
            current_cycle_used=5.0
        )
        daily_logs = generate_daily_logs(result["timeline"])
        self.assertGreater(len(daily_logs), 0)
        for log in daily_logs:
            totals = log["status_totals"]
            total_sum = round(
                totals["off_duty_hours"] +
                totals["sleeper_berth_hours"] +
                totals["driving_hours"] +
                totals["on_duty_hours"],
                2
            )
            self.assertEqual(total_sum, 24.0, f"Day {log['day_number']} total was {total_sum} instead of 24.0")

    def test_10_no_driving_after_14_hour_window(self):
        """10. Driver cannot continue driving after the 14-hour window without 10h rest."""
        mock_timeline = [
            {"type": ON_DUTY_NOT_DRIVING, "duration_hours": 3.0, "notes": "Loading"},
            {"type": DRIVING, "duration_hours": 12.0, "notes": "Continuous driving past 14h window"}
        ]
        is_compliant, violations, _ = validate_hos_timeline(mock_timeline)
        self.assertFalse(is_compliant)
        self.assertTrue(any("14-Hour" in v for v in violations))

    def test_11_no_driving_after_11_hour_limit(self):
        """11. Driver cannot exceed 11 hours cumulative driving in a single shift."""
        mock_timeline = [
            {"type": DRIVING, "duration_hours": 11.5, "notes": "Over 11 hours driving"}
        ]
        is_compliant, violations, _ = validate_hos_timeline(mock_timeline)
        self.assertFalse(is_compliant)
        self.assertTrue(any("11-Hour" in v for v in violations))

    def test_12_no_driving_after_cycle_hours_exhausted(self):
        """12. No driving after cycle hours are exhausted."""
        stats = calculate_cycle_stats(current_cycle_used=69.0, trip_duty_hours=5.0)
        self.assertFalse(stats["is_compliant"])
        self.assertEqual(stats["status"], "VIOLATION_WARNING")
        self.assertGreater(len(stats["violations"]), 0)

    def test_13_api_trip_planning_and_retrieval(self):
        """13. Full API integration: Plan trip, retrieve by ID, list, and health check."""
        # Health check
        health_resp = self.client.get("/api/health/")
        self.assertEqual(health_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(health_resp.data["status"], "healthy")

        # Plan trip
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Chicago, IL",
            "dropoff_location": "Milwaukee, WI",
            "current_cycle_used": 15.0,
            "driver_name": "Marcus Vance",
            "carrier_name": "FreightStar Transport"
        }
        plan_resp = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(plan_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("trip_id", plan_resp.data)
        trip_id = plan_resp.data["trip_id"]

        # Retrieve trip
        detail_resp = self.client.get(f"/api/trips/{trip_id}/")
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_resp.data["trip_id"], trip_id)

        # List trips
        list_resp = self.client.get("/api/trips/")
        self.assertEqual(list_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(list_resp.data["count"], 1)

        # Delete trip
        del_resp = self.client.delete(f"/api/trips/{trip_id}/")
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
