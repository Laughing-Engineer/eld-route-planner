import datetime
from .hos_engine import (
    OFF_DUTY,
    SLEEPER_BERTH,
    DRIVING,
    ON_DUTY_NOT_DRIVING,
    DUTY_CODES,
    STATUS_ROW_INDICES
)

def parse_iso(dt_str: str) -> datetime.datetime:
    clean_str = dt_str.replace("Z", "").split(".")[0]
    if "T" in clean_str:
        return datetime.datetime.fromisoformat(clean_str)
    return datetime.datetime.strptime(clean_str, "%Y-%m-%d %H:%M:%S")

def format_time_hm(dt: datetime.datetime) -> str:
    return dt.strftime("%H:%M")

def generate_svg_path(segments, width=720, height=160):
    """
    Generates an SVG path 'd' attribute string representing the continuous step line.
    Grid coordinates:
    width = 720 (30 px per hour, from 0 to 24)
    Row Y positions:
    - OFF_DUTY: 20
    - SLEEPER_BERTH: 60
    - DRIVING: 100
    - ON_DUTY_NOT_DRIVING: 140
    """
    row_y = {
        0: 20,
        1: 60,
        2: 100,
        3: 140
    }

    if not segments:
        # Default flat off duty line
        return f"M 0 {row_y[0]} L {width} {row_y[0]}"

    path_commands = []
    prev_y = None

    for idx, seg in enumerate(segments):
        start_h = seg["start_hour"]
        end_h = seg["end_hour"]
        s_idx = seg["status_index"]

        x1 = round((start_h / 24.0) * width, 2)
        x2 = round((end_h / 24.0) * width, 2)
        y = row_y.get(s_idx, 20)

        if idx == 0:
            path_commands.append(f"M {x1} {y}")
            path_commands.append(f"L {x2} {y}")
        else:
            if prev_y != y:
                # Vertical connector at the transition point
                path_commands.append(f"L {x1} {y}")
            path_commands.append(f"L {x2} {y}")

        prev_y = y

    return " ".join(path_commands)

def generate_daily_logs(timeline_events, driver_details=None, total_trip_miles=0.0):
    if not timeline_events:
        return []

    if driver_details is None:
        driver_details = {
            "driver_name": "John Doe",
            "co_driver_name": "",
            "carrier_name": "Apex Logistics Inc.",
            "main_office_address": "100 Freight Way, Chicago, IL 60601",
            "home_terminal_timezone": "America/Chicago",
            "truck_number": "TRK-8802",
            "trailer_number": "TRL-4410",
            "shipping_doc_number": "BOL-98231"
        }

    first_start = parse_iso(timeline_events[0]["start_time"])
    last_end = parse_iso(timeline_events[-1]["end_time"])

    start_date = first_start.date()
    end_date = last_end.date()
    total_days = (end_date - start_date).days + 1

    daily_logs = []

    for day_offset in range(total_days):
        current_date = start_date + datetime.timedelta(days=day_offset)
        day_start_dt = datetime.datetime.combine(current_date, datetime.time.min)
        day_end_dt = datetime.datetime.combine(current_date, datetime.time.max)

        day_segments = []
        day_remarks = []
        miles_today = 0.0

        # Pre-trip off-duty if trip starts after 00:00 on day 1
        if current_date == start_date and first_start > day_start_dt:
            pre_hours = round((first_start - day_start_dt).total_seconds() / 3600.0, 2)
            if pre_hours > 0.01:
                day_segments.append({
                    "status": OFF_DUTY,
                    "status_code": "OFF",
                    "status_index": 0,
                    "start_hour": 0.0,
                    "end_hour": pre_hours,
                    "duration_hours": pre_hours,
                    "location": timeline_events[0]["start_location"],
                    "notes": "Off Duty prior to shift start"
                })
                day_remarks.append({
                    "time": "00:00",
                    "status": "OFF",
                    "location": timeline_events[0]["start_location"],
                    "activity": "Off Duty"
                })

        # Process timeline events that overlap with this calendar day
        for evt in timeline_events:
            e_start = parse_iso(evt["start_time"])
            e_end = parse_iso(evt["end_time"])

            # Check overlap
            if e_end <= day_start_dt or e_start >= day_end_dt:
                continue

            # Clip event to current day boundaries
            seg_start = max(e_start, day_start_dt)
            seg_end = min(e_end, day_end_dt)

            start_hour = round((seg_start - day_start_dt).total_seconds() / 3600.0, 2)
            end_hour = round((seg_end - day_start_dt).total_seconds() / 3600.0, 2)
            duration = max(0.01, round(end_hour - start_hour, 2))

            evt_type = evt["type"]
            s_idx = STATUS_ROW_INDICES.get(evt_type, 0)
            s_code = DUTY_CODES.get(evt_type, "OFF")

            day_segments.append({
                "status": evt_type,
                "status_code": s_code,
                "status_index": s_idx,
                "start_hour": start_hour,
                "end_hour": end_hour,
                "duration_hours": duration,
                "location": evt.get("start_location", ""),
                "notes": evt.get("notes", "")
            })

            # Remarks for status changes starting today
            if e_start >= day_start_dt:
                day_remarks.append({
                    "time": format_time_hm(e_start),
                    "status": s_code,
                    "location": evt.get("start_location", ""),
                    "activity": evt.get("notes", evt_type)
                })

            if evt_type == DRIVING:
                # Approximate miles for this slice
                total_evt_dur = evt["duration_hours"]
                if total_evt_dur > 0:
                    fraction = duration / total_evt_dur
                    miles_today += fraction * 55.0 * total_evt_dur

        # Post-trip off-duty if trip ends before 24:00 on the last day
        if current_date == end_date and last_end < day_end_dt:
            last_hour = round((last_end - day_start_dt).total_seconds() / 3600.0, 2)
            post_hours = max(0.0, round(24.0 - last_hour, 2))
            if post_hours > 0.01:
                day_segments.append({
                    "status": OFF_DUTY,
                    "status_code": "OFF",
                    "status_index": 0,
                    "start_hour": last_hour,
                    "end_hour": 24.0,
                    "duration_hours": post_hours,
                    "location": timeline_events[-1]["end_location"],
                    "notes": "Off Duty following shift end"
                })
                day_remarks.append({
                    "time": format_time_hm(last_end),
                    "status": "OFF",
                    "location": timeline_events[-1]["end_location"],
                    "activity": "Trip completed - Off Duty"
                })

        # Calculate exact status totals
        off_hrs = round(sum(s["duration_hours"] for s in day_segments if s["status"] == OFF_DUTY), 2)
        sb_hrs = round(sum(s["duration_hours"] for s in day_segments if s["status"] == SLEEPER_BERTH), 2)
        drv_hrs = round(sum(s["duration_hours"] for s in day_segments if s["status"] == DRIVING), 2)
        on_hrs = round(sum(s["duration_hours"] for s in day_segments if s["status"] == ON_DUTY_NOT_DRIVING), 2)

        # Enforce exact 24.0 hours sum constraint
        sum_hrs = round(off_hrs + sb_hrs + drv_hrs + on_hrs, 2)
        diff = round(24.0 - sum_hrs, 2)
        if abs(diff) > 0.001:
            # Rebalance by adding/subtracting diff from off_duty
            off_hrs = max(0.0, round(off_hrs + diff, 2))
            sum_hrs = 24.0

        # Generate SVG grid data
        svg_path = generate_svg_path(day_segments, width=720, height=160)

        # Sort remarks by time
        day_remarks.sort(key=lambda r: r["time"])

        daily_logs.append({
            "day_number": day_offset + 1,
            "date": current_date.strftime("%Y-%m-%d"),
            "driver_details": driver_details,
            "total_miles_driving_today": round(miles_today, 1),
            "duty_segments": day_segments,
            "status_totals": {
                "off_duty_hours": off_hrs,
                "sleeper_berth_hours": sb_hrs,
                "driving_hours": drv_hrs,
                "on_duty_hours": on_hrs,
                "total_hours": 24.0
            },
            "remarks": day_remarks,
            "compliance_warnings": [],
            "svg_grid_data": {
                "width": 720,
                "height": 160,
                "step_path": svg_path,
                "row_labels": [
                    {"label": "1. OFF DUTY", "code": "OFF", "y": 20},
                    {"label": "2. SLEEPER BERTH", "code": "SB", "y": 60},
                    {"label": "3. DRIVING", "code": "D", "y": 100},
                    {"label": "4. ON DUTY (NOT DRIVING)", "code": "ON", "y": 140}
                ]
            }
        })

    return daily_logs
