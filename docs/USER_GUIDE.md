# User Guide

## 1. Getting Started
Launch the application and navigate to **Trip Planner**.

---

## 2. Entering Trip Parameters
1. **Current Location**: Enter your starting truck location (e.g. `Chicago, IL`).
2. **Pickup Location**: Enter the shipper facility location (e.g. `Chicago, IL`).
3. **Drop-off Location**: Enter the final receiver destination (e.g. `Los Angeles, CA`).
4. **Current Cycle Used**: Enter the number of hours previously consumed in the driver's 70-hour / 8-day cycle (e.g. `15.0`).
5. *(Optional)* Expand **Carrier, Vehicle & Driver Information** to enter driver name, tractor/trailer numbers, and BOL document number.

### Quick-Fill Presets
For instant testing, click one of the preset buttons:
- **1. Short Haul (Chicago &rarr; Milwaukee)**: Fast regional route under 11 hours.
- **2. Long Haul Multi-Day (Chicago &rarr; Los Angeles)**: Cross-country freight trip demonstrating fuel stops (&le;1000 mi), 30-min breaks, and 10-hour sleeper berth resets across multiple days.
- **3. Cycle Violation Test**: High cycle usage scenario demonstrating automatic violation warnings.

---

## 3. Reviewing Trip Results
- **Route Map**: View the route polyline on OpenStreetMap with color-coded markers for Origin, Pickup, Fuel stops, Rest stops, and Drop-off. Click any marker for arrival/departure timestamps.
- **Timeline**: Review chronological events, accumulated driving time, and remaining cycle hours at each step.
- **ELD Daily Logs**: View authentic Form MCS-59 24-hour daily logs with duty status totals summing to 24.0 hours.
- **Print / PDF Export**: Click **Print All Daily Logs (PDF)** to print or save a complete driver's log binder.
