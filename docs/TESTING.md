# Testing Guide

The backend includes a comprehensive test suite verifying all FMCSA regulations and API endpoints.

## 1. Running Backend Tests
From the `backend` directory:
```bash
python manage.py test trips
```

## 2. Test Scenarios Covered
1. **Short trip under 11 driving hours**: Verifies completion without overnight rest stops.
2. **30-minute break**: Verifies consecutive 30-min break is inserted after 8 cumulative driving hours.
3. **Fuel stops**: Verifies mandatory fuel stop is scheduled at or before 1,000 miles.
4. **Overnight rest**: Verifies 10-hour rest is scheduled when 11 driving hours or 14-hour window is reached.
5. **Multi-day trip**: Verifies multi-day routes generate multiple 24-hour log sheets.
6. **Cycle used near 70 hours**: Verifies cycle violation warning when trip hours exceed available cycle.
7. **Invalid locations**: Verifies geocoding validation and error responses.
8. **Missing required fields**: Verifies 400 Bad Request responses with field error details.
9. **Daily log totals equal 24.0 hours**: Verifies strict 24-hour sum across all duty statuses for every day.
10. **14-hour window enforcement**: Verifies no driving occurs after 14 hours from shift start.
11. **11-hour driving limit**: Verifies driving halts at 11 cumulative hours in a single shift.
12. **Cycle exhaustion check**: Verifies trip compliance status transitions to `VIOLATION_WARNING`.
13. **API integration**: Verifies health check, trip planning, retrieval, listing, and deletion endpoints.
