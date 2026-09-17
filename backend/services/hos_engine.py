"""
FMCSA Hours of Service (HOS) Engine for Property-Carrying Commercial Motor Vehicles
49 CFR Part 395 Compliance Rules:
1. 11-Hour Driving Limit: Driver cannot drive more than 11 cumulative hours following 10 consecutive hours off duty.
2. 14-Hour Driving Window: Driver cannot drive beyond the 14th consecutive hour after coming on duty following 10 consecutive hours off duty.
3. 30-Minute Break: Driver must take at least 30 consecutive minutes of non-driving time after 8 cumulative hours of driving.
4. 70-Hour / 8-Day Cycle: Driver may not drive after accumulating 70 hours on duty in any 8 consecutive days.
5. Fuel Stops: Scheduled at least once every 1,000 miles (30 min on duty).
6. 10-Hour Reset Rest: 10 consecutive hours off-duty/sleeper berth resets the 11-hour and 14-hour clocks.
"""

# HOS Constants
MAX_DRIVE_HOURS_PER_SHIFT = 11.0
MAX_DUTY_WINDOW_HOURS = 14.0
BREAK_DRIVING_THRESHOLD_HOURS = 8.0
MANDATORY_BREAK_DURATION_HOURS = 0.5   # 30 minutes
RESET_REST_DURATION_HOURS = 10.0      # 10 consecutive hours
CYCLE_LIMIT_HOURS = 70.0               # 70-hour / 8-day cycle
FUEL_STOP_INTERVAL_MILES = 1000.0      # At least once every 1,000 miles
FUEL_STOP_DURATION_HOURS = 0.5         # 30 minutes on-duty
PICKUP_DURATION_HOURS = 1.0            # 1 hour on-duty
DROPOFF_DURATION_HOURS = 1.0           # 1 hour on-duty

# Duty Status Constants
OFF_DUTY = "OFF_DUTY"
SLEEPER_BERTH = "SLEEPER_BERTH"
DRIVING = "DRIVING"
ON_DUTY_NOT_DRIVING = "ON_DUTY_NOT_DRIVING"

DUTY_CODES = {
    OFF_DUTY: "OFF",
    SLEEPER_BERTH: "SB",
    DRIVING: "D",
    ON_DUTY_NOT_DRIVING: "ON"
}

STATUS_ROW_INDICES = {
    OFF_DUTY: 0,
    SLEEPER_BERTH: 1,
    DRIVING: 2,
    ON_DUTY_NOT_DRIVING: 3
}

def calculate_cycle_stats(current_cycle_used: float, trip_duty_hours: float):
    """
    Computes remaining cycle hours before and after the trip.
    Duty hours that count toward cycle: DRIVING and ON_DUTY_NOT_DRIVING.
    """
    current_cycle_used = max(0.0, float(current_cycle_used or 0.0))
    trip_duty_hours = max(0.0, float(trip_duty_hours or 0.0))

    cycle_remaining_start = max(0.0, round(CYCLE_LIMIT_HOURS - current_cycle_used, 2))
    cycle_remaining_end = round(cycle_remaining_start - trip_duty_hours, 2)

    is_compliant = cycle_remaining_end >= 0.0
    violations = []
    warnings = []

    if not is_compliant:
        violations.append(
            f"70-hour / 8-day cycle limit exceeded: Trip requires {trip_duty_hours:.1f} duty hours, "
            f"but driver has only {cycle_remaining_start:.1f} available cycle hours remaining. "
            f"Driver will exhaust available hours by {abs(cycle_remaining_end):.1f} hours and requires a 34-hour restart."
        )
    elif cycle_remaining_end <= 5.0:
        warnings.append(
            f"Low cycle reserve: Only {cycle_remaining_end:.1f} hours will remain on the 70-hour / 8-day cycle upon trip completion."
        )

    return {
        "current_cycle_used": current_cycle_used,
        "cycle_hours_remaining_start": cycle_remaining_start,
        "cycle_hours_used_trip": round(trip_duty_hours, 2),
        "cycle_hours_remaining_end": max(0.0, cycle_remaining_end),
        "is_compliant": is_compliant,
        "status": "COMPLIANT" if is_compliant else "VIOLATION_WARNING",
        "violations": violations,
        "warnings": warnings
    }

def validate_hos_timeline(timeline_events):
    """
    Audits a planned event timeline against FMCSA HOS regulations.
    Returns (is_compliant, violations, warnings).
    """
    violations = []
    warnings = []
    shift_drive_hours = 0.0
    shift_window_hours = 0.0
    continuous_drive_since_break = 0.0

    for idx, evt in enumerate(timeline_events):
        evt_type = evt.get("type")
        duration = evt.get("duration_hours", 0.0)

        if evt_type in (OFF_DUTY, SLEEPER_BERTH):
            if duration >= RESET_REST_DURATION_HOURS:
                # 10-hour consecutive rest resets shift
                shift_drive_hours = 0.0
                shift_window_hours = 0.0
                continuous_drive_since_break = 0.0
            elif duration >= MANDATORY_BREAK_DURATION_HOURS:
                # 30-minute break resets the 8-hour driving threshold
                continuous_drive_since_break = 0.0
                shift_window_hours += duration
            else:
                shift_window_hours += duration

        elif evt_type == ON_DUTY_NOT_DRIVING:
            shift_window_hours += duration
            if duration >= MANDATORY_BREAK_DURATION_HOURS:
                # Under current FMCSA rules, 30-minute break can be on-duty not driving
                continuous_drive_since_break = 0.0

        elif evt_type == DRIVING:
            shift_drive_hours += duration
            shift_window_hours += duration
            continuous_drive_since_break += duration

            if continuous_drive_since_break > BREAK_DRIVING_THRESHOLD_HOURS + 0.01:
                violations.append(
                    f"30-minute break violation at event #{idx+1} ({evt.get('notes', 'Driving')}): "
                    f"Drove {continuous_drive_since_break:.2f} hours without a required 30-minute rest break."
                )

            if shift_drive_hours > MAX_DRIVE_HOURS_PER_SHIFT + 0.01:
                violations.append(
                    f"11-Hour driving limit exceeded at event #{idx+1}: "
                    f"Shift driving hours reached {shift_drive_hours:.2f} hrs (limit is {MAX_DRIVE_HOURS_PER_SHIFT} hrs)."
                )

            if shift_window_hours > MAX_DUTY_WINDOW_HOURS + 0.01:
                violations.append(
                    f"14-Hour driving window violated at event #{idx+1}: "
                    f"Driving occurred at {shift_window_hours:.2f} hours into the shift (limit is {MAX_DUTY_WINDOW_HOURS} hrs)."
                )

    is_compliant = len(violations) == 0
    return is_compliant, violations, warnings
