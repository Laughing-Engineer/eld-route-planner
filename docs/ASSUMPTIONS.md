# System Assumptions & Rules

1. **Vehicle Classification**: Property-carrying commercial motor vehicle operating under standard US FMCSA regulations.
2. **Cycle Regulation**: 70-hour / 8-day cycle. Remaining cycle hours = $70.0 - 	ext{current\_cycle\_used}$.
3. **Driving Limits**: Maximum 11 cumulative hours driving per shift.
4. **Shift Window**: Maximum 14 consecutive hours duty window from shift start. Non-driving duties consume this window without extending it.
5. **Rest Break**: Mandatory consecutive 30-minute non-driving break after 8 cumulative hours of driving.
6. **Shift Reset**: 10 consecutive hours off duty or sleeper berth resets the 11-hour and 14-hour clocks.
7. **Fuel Stops**: Scheduled at least once every 1,000 miles. Duration = 30 minutes (0.5 hrs) On Duty Not Driving.
8. **Shipper & Receiver Operations**:
   - Pickup Loading: 1.0 hour On Duty Not Driving.
   - Drop-off Unloading: 1.0 hour On Duty Not Driving.
9. **Log Sheet Partitioning**: Continuous timeline is divided into discrete 24-hour calendar days (00:00 to 24:00). Status totals on each log sheet strictly equal 24.0 hours.
