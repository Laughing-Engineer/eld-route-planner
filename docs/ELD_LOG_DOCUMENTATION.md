# ELD Daily Log Sheet Documentation (Form MCS-59 / 49 CFR Part 395)

This document provides a technical explanation of how the electronic Driver's Daily Log (ELD) is constructed, rendered as an SVG step graph, partitioned across multiple calendar days, and exported to print and PDF.

---

## 1. Overview & Regulatory Standards
Commercial motor vehicle drivers subject to FMCSA 49 CFR Part 395 must record their duty status for every 24-hour calendar period. Form MCS-59 is the United States Department of Transportation standard paper log format featuring:
- **Header details**: Date, Driver Name, Co-Driver, Carrier Name, Main Office Address, Tractor/Trailer ID, Shipping Document (BOL) #, 24-hour starting time.
- **24-Hour Graph Grid**: A 4-row timeline charting the continuous duty status throughout the day.
- **Right Column Totals**: Sum of hours spent in each of the 4 duty statuses, which must equal exactly 24.0 hours.
- **Remarks Table**: A chronological log of every change of duty status, with timestamp, geographic location, and operational remarks.
- **Driver Certification**: Electronic signature and certification statement.

---

## 2. The Four Standard Duty Statuses

The graph grid visualizes four mutually exclusive duty statuses:

| Status Index | Duty Status Name | Code | FMCSA Description |
|:---:|:---|:---:|:---|
| **0** | **OFF DUTY** | `OFF` | Driver is relieved from all work responsibilities. Applied to 30-min breaks, off-duty rest, pre-trip waiting, and post-trip downtime. |
| **1** | **SLEEPER BERTH** | `SB` | Rest periods spent in the commercial tractor's certified sleeper berth compartment. Used for the 10-hour mandatory shift reset. |
| **2** | **DRIVING** | `D` | Operating commercial motor vehicle controls on public highways. Maximum 11 hours per shift. |
| **3** | **ON DUTY (NOT DRIVING)** | `ON` | All work other than driving, including vehicle inspection, freight loading (1.0h), unloading (1.0h), and fueling (0.5h). |

---

## 3. Visual 24-Hour SVG Graph Grid & Mathematics

### Coordinate Geometry
The SVG grid is rendered using scalable vector graphics (`<svg viewBox="0 0 840 180">`):
- **Total ViewBox Width**: `840 px`
- **Left Label Margin**: `130 px`
- **Grid Timeline Width**: `660 px` (Spanning 24 hours &rarr; `hour_step = 660 / 24 = 27.5 px` per hour)
- **Top Header Margin**: `25 px`
- **Row Height**: `35 px` per status row

### Row Vertical Alignments ($Y$-coordinates):
$$egin{aligned}
Y_{	ext{OFF}} &= 25 + (0 	imes 35) + 15 = 40	ext{ px} \
Y_{	ext{SB}}  &= 25 + (1 	imes 35) + 15 = 75	ext{ px} \
Y_{	ext{D}}   &= 25 + (2 	imes 35) + 15 = 110	ext{ px} \
Y_{	ext{ON}}  &= 25 + (3 	imes 35) + 15 = 145	ext{ px}
\end{aligned}$$

### Hour Horizontal Alignments ($X$-coordinates):
$$X(h) = 130 + (h 	imes 27.5)$$
- Midnight ($h=0$): $X = 130.0	ext{ px}$
- 06:00 ($h=6$): $X = 130 + 165 = 295.0	ext{ px}$
- Noon ($h=12$): $X = 130 + 330 = 460.0	ext{ px}$
- 18:00 ($h=18$): $X = 130 + 495 = 625.0	ext{ px}$
- Midnight End ($h=24$): $X = 130 + 660 = 790.0	ext{ px}$

### Sub-Hour Tick Marks:
Inside each hour block, intermediate tick marks are drawn:
- **15-minute mark**: $X + 0.25 	imes 27.5$ (Dotted line)
- **30-minute mark**: $X + 0.50 	imes 27.5$ (Medium dashed line)
- **45-minute mark**: $X + 0.75 	imes 27.5$ (Dotted line)

---

## 4. Converting Timeline Events into SVG Step Paths

The step path is a continuous SVG `<path d="..." />` consisting of horizontal line segments along the active duty row, and vertical connector lines at status transitions:

```
[Row 0: OFF]   ------- (00:00 - 07:00)
                     |
[Row 3: ON]          |                 ------- (07:00 - 08:00 Loading)
                     |                 |
[Row 2: D]           -------------------         ------------------ (08:00 - 11:30 Driving)
```

### Path Generation Algorithm:
1. For segment $i$ starting at $h_1$ and ending at $h_2$ on status row $Y_i$:
   - Calculate $X_1 = X(h_1)$ and $X_2 = X(h_2)$.
   - If first segment: emit `M X1 Y_i`.
   - If not first segment and $Y_{i-1} 
eq Y_i$: emit vertical connector `L X1 Y_i`.
   - Emit horizontal duration segment: `L X2 Y_i`.
2. Connect cleanly to the final point at $h=24$.

---

## 5. Daily Totals & 24.0-Hour Equality Enforcement

Under federal logging rules, every 24-hour log must account for all 24.0 hours:
$$	ext{Off Duty Hours} + 	ext{Sleeper Berth Hours} + 	ext{Driving Hours} + 	ext{On Duty Hours} = 24.00$$

### Floating-Point Rebalancing:
Because floating-point calculations (e.g. $1.62 + 20.38 = 24.0$) can experience precision drift, `services/log_generator.py` applies an exact rebalancing check:
```python
sum_hrs = round(off_hrs + sb_hrs + drv_hrs + on_hrs, 2)
diff = round(24.0 - sum_hrs, 2)
if abs(diff) > 0.001:
    off_hrs = max(0.0, round(off_hrs + diff, 2))
```
This guarantees that the right-side total column always displays exactly `24.0 hrs`.

---

## 6. Remarks Table Generation

At every change of duty status, a row is automatically generated in the Form MCS-59 Remarks section containing:
1. **Time**: 24-hour timestamp in `HH:MM` format.
2. **Status Code**: `OFF`, `SB`, `D`, or `ON`.
3. **Geographic Waypoint**: City and State, or highway corridor mile marker.
4. **Activity Description**: Human-readable remark, e.g.:
   - `00:00` - `OFF` - Chicago, IL - "Off Duty prior to shift start"
   - `07:00` - `ON` - Chicago, IL - "Pickup Facility: Check-in, Loading Freight & Cargo Securement"
   - `08:00` - `D` - Chicago, IL - "Driving towards Milwaukee, WI"
   - `09:37` - `ON` - Milwaukee, WI - "Drop-off Facility: Freight Unloading & Delivery Signature Verification"
   - `10:37` - `OFF` - Milwaukee, WI - "Trip completed - Off Duty"

---

## 7. Multi-Day Trip Slicing (Midnight Partitioning)

For long-haul trips spanning multiple calendar days (e.g., 2,251 miles from Chicago to Los Angeles over 4 days):
1. The continuous simulation timeline is evaluated against calendar day boundaries (`00:00:00` to `23:59:59`).
2. Any event crossing midnight is mathematically split:
   - Slice 1 terminates at 24:00 on Day $N$.
   - Slice 2 begins at 00:00 on Day $N+1$.
3. Pre-shift padding: If the trip begins at 07:00 on Day 1, hours `00:00 - 07:00` (7.0 hrs) are recorded as `OFF_DUTY`.
4. Post-shift padding: If the trip ends at 10:37 on the final day, hours `10:37 - 24:00` (13.38 hrs) are recorded as `OFF_DUTY`.
5. Each day produces an independent, valid Form MCS-59 document with its own date, total miles driven today, SVG grid, status totals, and remarks.

---

## 8. Print & PDF Export

The ELD logs page utilizes `@media print` CSS:
- Non-essential UI (Navbar, tab buttons, action bars, search fields) is hidden via `.no-print`.
- Every daily log sheet is styled with a solid 1.5px black border and `page-break-after: always`, preventing grid clipping across page breaks.
- Clicking **Print All Days (Binder PDF)** triggers `window.print()`, allowing the user to send the document directly to a printer or use their browser's built-in **Save as PDF** destination to generate an official multi-page log binder.
