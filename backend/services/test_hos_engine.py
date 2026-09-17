import unittest
import os
import sys
from pathlib import Path

# Ensure backend directory is in python path
backend_dir = Path(r"C:\Users\Nitin\.gemini\antigravity\scratch\eld-route-planner\backend")
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Initialize Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from services.hos_engine import (
    MAX_DRIVE_HOURS_PER_SHIFT,
    MAX_DUTY_WINDOW_HOURS,
    BREAK_DRIVING_THRESHOLD_HOURS,
    MANDATORY_BREAK_DURATION_HOURS,
    RESET_REST_DURATION_HOURS,
    FUEL_STOP_INTERVAL_MILES,
    FUEL_STOP_DURATION_HOURS,
    PICKUP_DURATION_HOURS,
    DROPOFF_DURATION_HOURS,
    OFF_DUTY,
    SLEEPER_BERTH,
    DRIVING,
    ON_DUTY_NOT_DRIVING,
    calculate_cycle_stats,
    validate_hos_timeline
)
from services.schedule_service import build_trip_schedule
from services.log_generator import generate_daily_logs

class HOSEngineServiceUnitTests(unittest.TestCase):
    def setUp(self):
        self.chicago = {"name": "Chicago, IL", "latitude": 41.8781, "longitude": -87.6298}
        self.milwaukee = {"name": "Milwaukee, WI", "latitude": 43.0389, "longitude": -87.9065}
        self.denver = {"name": "Denver, CO", "latitude": 39.7392, "longitude": -104.9903}
        self.los_angeles = {"name": "Los Angeles, CA", "latitude": 34.0522, "longitude": -118.2437}

    def test_01_eleven_hour_driving_limit(self):
        """Rule 1: Driver cannot drive more than 11 cumulative hours per shift without 10h rest."""
        schedule = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.denver,
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        shift_drive = 0.0
        for evt in schedule["timeline"]:
            if evt["type"] in (OFF_DUTY, SLEEPER_BERTH) and evt["duration_hours"] >= 10.0:
                shift_drive = 0.0
            elif evt["type"] == DRIVING:
                shift_drive += evt["duration_hours"]
                self.assertLessEqual(shift_drive, 11.01, f"Shift driving exceeded 11 hours: {shift_drive}")

    def test_02_fourteen_hour_duty_window(self):
        """Rule 2: Driving is prohibited past the 14th consecutive hour from shift start."""
        schedule = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.denver,
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        is_compliant, violations, _ = validate_hos_timeline(schedule["timeline"])
        self.assertTrue(is_compliant, f"Violations found: {violations}")

    def test_03_thirty_minute_break_after_8_driving_hours(self):
        """Rule 3: 30-minute consecutive break required after 8 cumulative driving hours."""
        schedule = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff={"name": "Kansas City, MO", "latitude": 39.0997, "longitude": -94.5786},
            current_cycle_used=10.0,
            avg_speed_mph=55.0
        )
        break_events = [e for e in schedule["timeline"] if "30-Minute" in e["notes"]]
        self.assertGreaterEqual(len(break_events), 1)
        self.assertEqual(break_events[0]["duration_hours"], 0.5)
        self.assertIn(break_events[0]["type"], (OFF_DUTY, ON_DUTY_NOT_DRIVING))

    def test_04_seventy_hour_cycle_calculation(self):
        """Rule 4: 70-hr / 8-day cycle = 70.0 - current_cycle_used. Flags violations when exceeded."""
        stats_ok = calculate_cycle_stats(current_cycle_used=20.0, trip_duty_hours=15.0)
        self.assertEqual(stats_ok["cycle_hours_remaining_start"], 50.0)
        self.assertEqual(stats_ok["cycle_hours_remaining_end"], 35.0)
        self.assertTrue(stats_ok["is_compliant"])
        self.assertEqual(stats_ok["status"], "COMPLIANT")

        stats_violation = calculate_cycle_stats(current_cycle_used=65.0, trip_duty_hours=10.0)
        self.assertEqual(stats_violation["cycle_hours_remaining_start"], 5.0)
        self.assertFalse(stats_violation["is_compliant"])
        self.assertEqual(stats_violation["status"], "VIOLATION_WARNING")
        self.assertGreaterEqual(len(stats_violation["violations"]), 1)

    def test_05_pickup_and_dropoff_durations(self):
        """Rule 5: Pickup = 1 hr on-duty, Drop-off = 1 hr on-duty."""
        schedule = build_trip_schedule(
            origin=self.chicago,
            pickup=self.chicago,
            dropoff=self.milwaukee,
            current_cycle_used=10.0
        )
        pickup_stops = [s for s in schedule["stops"] if s["stop_type"] == "PICKUP"]
        dropoff_stops = [s for s in schedule["stops"] if s["stop_type"] == "DROPOFF"]

        self.assertEqual(len(pickup_stops), 1)
        self.assertEqual(pickup_stops[0]["duration_hours"], 1.0)
        self.assertEqual(len(dropoff_stops), 1)
        self.assertEqual(dropoff_stops[0]["duration_hours"], 1.0)

        pickup_events = [e for e in schedule["timeline"] if "Pickup Facility" in e["notes"]]
        dropoff_events = [e for e in schedule["timeline"] if "Drop-off Facility" in e["notes"]]
        self.assertEqual(pickup_events[0]["type"], ON_DUTY_NOT_DRIVING)
        self.assertEqual(dropoff_events[0]["type"], ON_DUTY_NOT_DRIVING)

    def test_06_fueling_every_1000_miles(self):
        """Rule 6: Mandatory fuel stop at least once every 1,000 miles."""
        short_sched = build_trip_schedule(self.chicago, self.chicago, self.milwaukee)
        short_fuels = [s for s in short_sched["stops"] if s["stop_type"] == "FUEL"]
        self.assertEqual(len(short_fuels), 0)

        long_sched = build_trip_schedule(self.chicago, self.chicago, self.los_angeles, fuel_interval_miles=1000.0)
        long_fuels = [s for s in long_sched["stops"] if s["stop_type"] == "FUEL"]
        self.assertGreaterEqual(len(long_fuels), 2)
        for fuel_stop in long_fuels:
            self.assertEqual(fuel_stop["duration_hours"], 0.5)

    def test_07_rest_scheduling_ten_hours(self):
        """Rule 7: Rest stops are 10 consecutive hours resetting the shift clock."""
        schedule = build_trip_schedule(self.chicago, self.chicago, self.los_angeles)
        rest_stops = [s for s in schedule["stops"] if s["stop_type"] == "REST"]
        self.assertGreaterEqual(len(rest_stops), 2)
        for rest in rest_stops:
            self.assertEqual(rest["duration_hours"], 10.0)

        rest_events = [e for e in schedule["timeline"] if e["type"] in (SLEEPER_BERTH, OFF_DUTY) and e["duration_hours"] >= 10.0]
        self.assertGreaterEqual(len(rest_events), 2)

    def test_08_multi_day_schedules_sum_exactly_24_hours(self):
        """Rule 8: Every 24-hour daily log schedule totals exactly 24.0 hours."""
        schedule = build_trip_schedule(self.chicago, self.chicago, self.los_angeles)
        daily_logs = generate_daily_logs(schedule["timeline"])

        self.assertGreaterEqual(len(daily_logs), 2)
        for log in daily_logs:
            totals = log["status_totals"]
            total_sum = round(
                totals["off_duty_hours"] +
                totals["sleeper_berth_hours"] +
                totals["driving_hours"] +
                totals["on_duty_hours"],
                2
            )
            self.assertEqual(total_sum, 24.0, f"Day {log['day_number']} total hours: {total_sum} != 24.0")
            self.assertEqual(totals["total_hours"], 24.0)

if __name__ == '__main__':
    unittest.main()
