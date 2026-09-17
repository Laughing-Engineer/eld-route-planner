# FMCSA Hours of Service (HOS) Calculation Logic

## 1. Regulatory Context
The calculation engine models the United States Federal Motor Carrier Safety Administration (FMCSA) **49 CFR Part 395** rules for property-carrying commercial motor vehicles under the standard **70-hour / 8-day cycle**.

---

## 2. Implemented Rules & Mathematical Mechanics

### A. 11-Hour Driving Limit
- **Rule**: A driver may drive a maximum of 11 cumulative hours following 10 consecutive hours off duty.
- **Implementation**:
  ```python
  if shift_driving_hours + chunk_hours > 11.0:
      take_10hr_rest()
  ```
  Once 11.0 driving hours accumulate in a single shift, no further driving is permitted until a 10.0-hour rest period is completed.

### B. 14-Hour Consecutive Duty Window
- **Rule**: Driving cannot occur beyond the 14th consecutive hour from when the driver starts on-duty work following 10 consecutive hours off duty.
- **Implementation**:
  The window clock starts immediately upon any duty activity (`ON_DUTY_NOT_DRIVING` or `DRIVING`).
  ```python
  shift_duty_window_hours = (current_time - shift_start_time).total_seconds() / 3600.0
  if shift_duty_window_hours >= 14.0:
      take_10hr_rest()
  ```
  Non-driving duties (such as 1 hour of freight loading or 30 minutes of fueling) advance the duty window, reducing available drive time.

### C. 30-Minute Rest Break
- **Rule**: After 8 cumulative hours of driving without at least a 30-minute interruption, drivers must take a consecutive 30-minute break.
- **Implementation**:
  ```python
  continuous_drive_since_break += chunk_hours
  if continuous_drive_since_break >= 8.0:
      take_30min_break() # 0.5 hours OFF_DUTY or ON_DUTY_NOT_DRIVING
      continuous_drive_since_break = 0.0
  ```

### D. 70-Hour / 8-Day Cycle Rule
- **Rule**: A driver cannot drive after having been on duty for 70 hours in any 8 consecutive days.
- **Implementation**:
  ```python
  remaining_cycle_hours = 70.0 - current_cycle_used
  trip_duty_hours = total_driving_hours + total_on_duty_hours
  if trip_duty_hours > remaining_cycle_hours:
      compliance_status = "VIOLATION_WARNING"
      violations.append("70-hour / 8-day cycle limit exceeded...")
  ```

### E. Fuel Stops (Every &le; 1,000 Miles)
- **Rule**: Mandatory fuel stop at least once every 1,000 miles.
- **Implementation**:
  For total distance $D$, stops count = $\lfloor D / 1000 floor$.
  Each stop accounts for 0.5 hours (30 minutes) of `ON_DUTY_NOT_DRIVING` for fueling and walkaround vehicle inspection.

### F. Loading & Unloading Events
- **Pickup**: Exactly 1.0 hour of `ON_DUTY_NOT_DRIVING` for shipper check-in, cargo loading, and bill of lading (BOL) verification.
- **Drop-off**: Exactly 1.0 hour of `ON_DUTY_NOT_DRIVING` for receiver check-in, freight unloading, and delivery receipt sign-off.
