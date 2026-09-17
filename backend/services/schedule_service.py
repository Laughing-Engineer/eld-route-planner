import datetime
import uuid
from .route_service import calculate_driving_route, haversine_distance_miles
from .hos_engine import (
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
    DUTY_CODES,
    calculate_cycle_stats,
    validate_hos_timeline
)

def format_iso(dt: datetime.datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S")

def find_coord_at_distance(coordinates, target_miles, total_miles):
    """Finds the coordinate along a list of [lat, lon] closest to target_miles."""
    if not coordinates:
        return None
    if target_miles <= 0:
        return coordinates[0]
    if target_miles >= total_miles or len(coordinates) == 1:
        return coordinates[-1]

    fraction = max(0.0, min(1.0, target_miles / max(1.0, total_miles)))
    index = int(fraction * (len(coordinates) - 1))
    return coordinates[index]

def build_trip_schedule(
    origin: dict,
    pickup: dict,
    dropoff: dict,
    current_cycle_used: float = 0.0,
    start_datetime: str = None,
    avg_speed_mph: float = 55.0,
    fuel_interval_miles: float = 1000.0,
    driver_details: dict = None
):
    if not start_datetime:
        current_time = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        # Default start tomorrow 07:00 or current day 07:00
        start_dt = current_time.replace(hour=7)
        if start_dt < current_time:
            start_dt += datetime.timedelta(days=1)
    else:
        try:
            # Parse ISO or simple string
            clean_str = start_datetime.replace("Z", "").split(".")[0]
            if "T" in clean_str:
                start_dt = datetime.datetime.fromisoformat(clean_str)
            else:
                start_dt = datetime.datetime.strptime(clean_str, "%Y-%m-%d %H:%M:%S")
        except Exception:
            start_dt = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)

    avg_speed = max(35.0, min(75.0, float(avg_speed_mph or 55.0)))
    fuel_interval = max(500.0, float(fuel_interval_miles or 1000.0))

    # 1. Route: Origin -> Pickup
    leg1_route = calculate_driving_route(
        origin["latitude"], origin["longitude"],
        pickup["latitude"], pickup["longitude"],
        avg_speed_mph=avg_speed
    )
    # 2. Route: Pickup -> Drop-off
    leg2_route = calculate_driving_route(
        pickup["latitude"], pickup["longitude"],
        dropoff["latitude"], dropoff["longitude"],
        avg_speed_mph=avg_speed
    )

    combined_coordinates = []
    if leg1_route["coordinates"]:
        combined_coordinates.extend(leg1_route["coordinates"])
    if leg2_route["coordinates"]:
        combined_coordinates.extend(leg2_route["coordinates"])

    combined_instructions = []
    if leg1_route.get("instructions"):
        combined_instructions.extend(leg1_route["instructions"])
    if leg2_route.get("instructions"):
        combined_instructions.extend(leg2_route["instructions"])

    total_distance_miles = round(leg1_route["distance_miles"] + leg2_route["distance_miles"], 1)

    # Calculate planned fuel stops
    planned_fuel_stops = []
    if total_distance_miles >= fuel_interval:
        # Number of fuel stops needed
        num_stops = int(total_distance_miles // fuel_interval)
        spacing = total_distance_miles / (num_stops + 1)
        for i in range(1, num_stops + 1):
            target_mi = round(i * spacing, 1)
            coord = find_coord_at_distance(combined_coordinates, target_mi, total_distance_miles)
            planned_fuel_stops.append({
                "target_miles": target_mi,
                "coord": coord,
                "completed": False
            })

    # Simulation state variables
    sim_time = start_dt
    events = []
    stops = []
    stop_counter = 1

    # Shift tracking
    shift_driving_hours = 0.0
    shift_duty_window_hours = 0.0
    continuous_drive_since_break = 0.0
    accumulated_driving_hours = 0.0
    cumulative_miles_driven = 0.0

    # Origin Stop
    stops.append({
        "stop_id": f"STOP-{stop_counter}",
        "stop_type": "ORIGIN",
        "location_name": origin["name"],
        "latitude": origin["latitude"],
        "longitude": origin["longitude"],
        "duration_hours": 0.0,
        "arrival_time": format_iso(sim_time),
        "departure_time": format_iso(sim_time),
        "notes": "Trip Origin Departure",
        "cumulative_miles": 0.0
    })
    stop_counter += 1

    def advance_time(duration_hrs: float):
        nonlocal sim_time
        sim_time += datetime.timedelta(hours=duration_hrs)

    def add_event(evt_type: str, duration_hrs: float, start_loc: str, end_loc: str, notes: str):
        nonlocal sim_time, shift_driving_hours, shift_duty_window_hours, continuous_drive_since_break, accumulated_driving_hours
        evt_start = sim_time
        advance_time(duration_hrs)
        evt_end = sim_time

        evt = {
            "id": f"EVT-{len(events) + 1}",
            "type": evt_type,
            "status_code": DUTY_CODES.get(evt_type, "OFF"),
            "start": format_iso(evt_start),
            "end": format_iso(evt_end),
            "start_time": format_iso(evt_start),
            "end_time": format_iso(evt_end),
            "duration_hours": round(duration_hrs, 2),
            "location": start_loc,
            "start_location": start_loc,
            "end_location": end_loc,
            "notes": notes,
            "accumulated_driving_hours": round(accumulated_driving_hours, 2),
            "shift_driving_hours": round(shift_driving_hours, 2),
            "shift_duty_hours": round(shift_duty_window_hours, 2),
            "cycle_hours_remaining": round(max(0.0, (70.0 - current_cycle_used) - (accumulated_driving_hours + 2.0)), 2)
        }
        events.append(evt)
        return evt

    def take_10hr_rest(location_name: str, lat: float, lon: float, reason: str):
        nonlocal shift_driving_hours, shift_duty_window_hours, continuous_drive_since_break, stop_counter
        rest_arr = format_iso(sim_time)
        add_event(
            SLEEPER_BERTH,
            RESET_REST_DURATION_HOURS,
            location_name,
            location_name,
            f"10-Hour Mandatory Off-Duty / Sleeper Berth Rest ({reason})"
        )
        rest_dep = format_iso(sim_time)
        stops.append({
            "stop_id": f"STOP-{stop_counter}",
            "stop_type": "REST",
            "location_name": f"Rest Stop ({location_name})",
            "latitude": lat,
            "longitude": lon,
            "duration_hours": RESET_REST_DURATION_HOURS,
            "arrival_time": rest_arr,
            "departure_time": rest_dep,
            "notes": f"Mandatory 10-Hour Rest ({reason})",
            "cumulative_miles": round(cumulative_miles_driven, 1)
        })
        stop_counter += 1
        # Reset shift counters
        shift_driving_hours = 0.0
        shift_duty_window_hours = 0.0
        continuous_drive_since_break = 0.0

    def take_30min_break(location_name: str, lat: float, lon: float):
        nonlocal shift_duty_window_hours, continuous_drive_since_break, stop_counter
        arr = format_iso(sim_time)
        add_event(
            OFF_DUTY,
            MANDATORY_BREAK_DURATION_HOURS,
            location_name,
            location_name,
            "Mandatory 30-Minute Consecutive Rest Break (after 8 cumulative driving hours)"
        )
        dep = format_iso(sim_time)
        shift_duty_window_hours += MANDATORY_BREAK_DURATION_HOURS
        continuous_drive_since_break = 0.0
        stops.append({
            "stop_id": f"STOP-{stop_counter}",
            "stop_type": "BREAK",
            "location_name": f"30-Min Rest Area near {location_name}",
            "latitude": lat,
            "longitude": lon,
            "duration_hours": MANDATORY_BREAK_DURATION_HOURS,
            "arrival_time": arr,
            "departure_time": dep,
            "notes": "30-Minute Rest Break (8-hr driving compliance)",
            "cumulative_miles": round(cumulative_miles_driven, 1)
        })
        stop_counter += 1

    def execute_driving_segment(target_miles: float, start_name: str, end_name: str, segment_coords: list):
        nonlocal shift_driving_hours, shift_duty_window_hours, continuous_drive_since_break, accumulated_driving_hours, cumulative_miles_driven, stop_counter

        miles_remaining = target_miles
        while miles_remaining > 0.1:
            # Check fuel stops due
            for fuel_stop in planned_fuel_stops:
                if not fuel_stop["completed"] and cumulative_miles_driven >= fuel_stop["target_miles"]:
                    # Take fuel stop
                    fuel_stop["completed"] = True
                    f_lat = fuel_stop["coord"][0] if fuel_stop["coord"] else origin["latitude"]
                    f_lon = fuel_stop["coord"][1] if fuel_stop["coord"] else origin["longitude"]
                    f_name = f"En-Route Fuel Facility (Mile {int(cumulative_miles_driven)})"
                    
                    fuel_arr = format_iso(sim_time)
                    add_event(
                        ON_DUTY_NOT_DRIVING,
                        FUEL_STOP_DURATION_HOURS,
                        f_name,
                        f_name,
                        "Mandatory Fuel Stop & Vehicle Walkaround Inspection"
                    )
                    fuel_dep = format_iso(sim_time)
                    shift_duty_window_hours += FUEL_STOP_DURATION_HOURS
                    stops.append({
                        "stop_id": f"STOP-{stop_counter}",
                        "stop_type": "FUEL",
                        "location_name": f_name,
                        "latitude": f_lat,
                        "longitude": f_lon,
                        "duration_hours": FUEL_STOP_DURATION_HOURS,
                        "arrival_time": fuel_arr,
                        "departure_time": fuel_dep,
                        "notes": "Fueling & Equipment Inspection",
                        "cumulative_miles": round(cumulative_miles_driven, 1)
                    })
                    stop_counter += 1

            # Check if 10-hour rest is required (11h drive limit or 14h duty window limit)
            drive_left_in_shift = MAX_DRIVE_HOURS_PER_SHIFT - shift_driving_hours
            window_left_in_shift = MAX_DUTY_WINDOW_HOURS - shift_duty_window_hours
            available_drive = max(0.0, min(drive_left_in_shift, window_left_in_shift))

            if available_drive <= 0.05:
                curr_coord = find_coord_at_distance(combined_coordinates, cumulative_miles_driven, total_distance_miles) or [origin["latitude"], origin["longitude"]]
                reason = "11-hour driving limit reached" if drive_left_in_shift <= 0.05 else "14-hour duty window reached"
                take_10hr_rest(f"Highway Travel Plaza near Mile {int(cumulative_miles_driven)}", curr_coord[0], curr_coord[1], reason)
                continue

            # Check 8-hour continuous drive limit
            drive_until_break = max(0.0, BREAK_DRIVING_THRESHOLD_HOURS - continuous_drive_since_break)
            if drive_until_break <= 0.05:
                curr_coord = find_coord_at_distance(combined_coordinates, cumulative_miles_driven, total_distance_miles) or [origin["latitude"], origin["longitude"]]
                take_30min_break(f"Mile {int(cumulative_miles_driven)}", curr_coord[0], curr_coord[1])
                continue

            # Determine maximum drive chunk for this step
            chunk_hours = min(
                miles_remaining / avg_speed,
                available_drive,
                drive_until_break,
                3.5  # Break driving into clean 2-3.5 hour segments for realistic logging
            )

            chunk_miles = round(chunk_hours * avg_speed, 1)
            if chunk_miles > miles_remaining:
                chunk_miles = miles_remaining
                chunk_hours = round(chunk_miles / avg_speed, 2)

            # Perform drive chunk
            shift_driving_hours += chunk_hours
            shift_duty_window_hours += chunk_hours
            continuous_drive_since_break += chunk_hours
            accumulated_driving_hours += chunk_hours
            cumulative_miles_driven += chunk_miles
            miles_remaining = max(0.0, round(miles_remaining - chunk_miles, 1))

            add_event(
                DRIVING,
                chunk_hours,
                start_name,
                end_name,
                f"Driving towards {end_name} ({chunk_miles} miles at avg {int(avg_speed)} mph)"
            )

    # --- EXECUTE TRIP ---

    # 1. Drive Origin -> Pickup (if distance > 1 mile)
    if leg1_route["distance_miles"] > 1.0:
        execute_driving_segment(leg1_route["distance_miles"], origin["name"], pickup["name"], leg1_route["coordinates"])

    # 2. Pickup Loading (1.0 hour On Duty Not Driving)
    # Check if 14-hour window would be exceeded before loading
    if shift_duty_window_hours + PICKUP_DURATION_HOURS > MAX_DUTY_WINDOW_HOURS:
        take_10hr_rest(pickup["name"], pickup["latitude"], pickup["longitude"], "Rest before loading freight")

    pickup_arr = format_iso(sim_time)
    shift_duty_window_hours += PICKUP_DURATION_HOURS
    add_event(
        ON_DUTY_NOT_DRIVING,
        PICKUP_DURATION_HOURS,
        pickup["name"],
        pickup["name"],
        "Pickup Facility: Check-in, Loading Freight & Cargo Securement"
    )
    pickup_dep = format_iso(sim_time)
    stops.append({
        "stop_id": f"STOP-{stop_counter}",
        "stop_type": "PICKUP",
        "location_name": pickup["name"],
        "latitude": pickup["latitude"],
        "longitude": pickup["longitude"],
        "duration_hours": PICKUP_DURATION_HOURS,
        "arrival_time": pickup_arr,
        "departure_time": pickup_dep,
        "notes": "Freight Loading & Bill of Lading Verification",
        "cumulative_miles": round(cumulative_miles_driven, 1)
    })
    stop_counter += 1

    # 3. Drive Pickup -> Drop-off
    execute_driving_segment(leg2_route["distance_miles"], pickup["name"], dropoff["name"], leg2_route["coordinates"])

    # 4. Drop-off Unloading (1.0 hour On Duty Not Driving)
    dropoff_arr = format_iso(sim_time)
    shift_duty_window_hours += DROPOFF_DURATION_HOURS
    add_event(
        ON_DUTY_NOT_DRIVING,
        DROPOFF_DURATION_HOURS,
        dropoff["name"],
        dropoff["name"],
        "Drop-off Facility: Freight Unloading & Delivery Signature Verification"
    )
    dropoff_dep = format_iso(sim_time)
    stops.append({
        "stop_id": f"STOP-{stop_counter}",
        "stop_type": "DROPOFF",
        "location_name": dropoff["name"],
        "latitude": dropoff["latitude"],
        "longitude": dropoff["longitude"],
        "duration_hours": DROPOFF_DURATION_HOURS,
        "arrival_time": dropoff_arr,
        "departure_time": dropoff_dep,
        "notes": "Cargo Unloading & Final Delivery Receipt",
        "cumulative_miles": round(cumulative_miles_driven, 1)
    })

    # Summary calculations
    total_driving_hours = sum(e["duration_hours"] for e in events if e["type"] == DRIVING)
    total_on_duty_hours = sum(e["duration_hours"] for e in events if e["type"] == ON_DUTY_NOT_DRIVING)
    total_off_duty_hours = sum(e["duration_hours"] for e in events if e["type"] in (OFF_DUTY, SLEEPER_BERTH))
    total_trip_duration_hours = round(total_driving_hours + total_on_duty_hours + total_off_duty_hours, 2)
    trip_duty_hours = round(total_driving_hours + total_on_duty_hours, 2)

    fuel_count = len([s for s in stops if s["stop_type"] == "FUEL"])
    rest_count = len([s for s in stops if s["stop_type"] == "REST"])

    cycle_stats = calculate_cycle_stats(current_cycle_used, trip_duty_hours)
    hos_compliant, hos_violations, hos_warnings = validate_hos_timeline(events)

    compliance_status = {
        "is_compliant": cycle_stats["is_compliant"] and hos_compliant,
        "status": "COMPLIANT" if (cycle_stats["is_compliant"] and hos_compliant) else "VIOLATION_WARNING",
        "current_cycle_used": cycle_stats["current_cycle_used"],
        "cycle_hours_remaining_start": cycle_stats["cycle_hours_remaining_start"],
        "cycle_hours_used_trip": cycle_stats["cycle_hours_used_trip"],
        "cycle_hours_remaining_end": cycle_stats["cycle_hours_remaining_end"],
        "warnings": cycle_stats["warnings"] + hos_warnings,
        "violations": cycle_stats["violations"] + hos_violations
    }

    route_summary = {
        "total_distance_miles": total_distance_miles,
        "estimated_driving_time_hours": round(total_driving_hours, 2),
        "total_trip_duration_hours": total_trip_duration_hours,
        "total_driving_hours": round(total_driving_hours, 2),
        "total_on_duty_hours": round(total_on_duty_hours, 2),
        "total_off_duty_hours": round(total_off_duty_hours, 2),
        "fuel_stops_count": fuel_count,
        "rest_stops_count": rest_count
    }

    return {
        "route_summary": route_summary,
        "stops": stops,
        "timeline": events,
        "compliance": compliance_status,
        "route_geometry": {
            "type": "LineString",
            "coordinates": combined_coordinates
        },
        "route_instructions": combined_instructions
    }
