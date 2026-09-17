import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ELDLogSheet from '../components/ELDLogSheet';
import { Printer, ArrowLeft, Download, AlertTriangle, Calendar, Layers } from 'lucide-react';

export default function ELDLogsPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(-1); // -1 = show all days

  useEffect(() => {
    if (tripId) {
      setIsLoading(true);
      api.getTripById(tripId)
        .then(data => {
          setTrip(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching logs:', err);
          setIsLoading(false);
        });
    }
  }, [tripId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!trip) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip.daily_logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ELD_Logs_${trip.trip_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading ELD log sheets...</p>
      </div>
    );
  }

  if (!trip || !trip.daily_logs || trip.daily_logs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">No Logs Available</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Could not load ELD logs for trip {tripId}.</p>
        <Link to="/planner" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
          Plan Trip
        </Link>
      </div>
    );
  }

  const { daily_logs, driver_details } = trip;
  const logsToDisplay = selectedDayIdx === -1 ? daily_logs : [daily_logs[selectedDayIdx]];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
      {/* Non-printed Toolbar */}
      <div className="no-print pb-6 border-b border-slate-200 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link to={`/dashboard/${trip.trip_id}`} className="text-slate-400 hover:text-slate-700 transition">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                {trip.trip_id}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {trip.current_location?.name} &rarr; {trip.dropoff_location?.name}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Official Driver's Daily Log Sheets (Form MCS-59)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              FMCSA 49 CFR Part 395 Compliant | 24-Hour Continuous Duty Status Record
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{selectedDayIdx === -1 ? 'Print All Days (Binder PDF)' : `Print Day ${daily_logs[selectedDayIdx].day_number}`}</span>
            </button>
          </div>
        </div>

        {/* Multi-Day Navigation Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Select View:</span>
          </span>

          <button
            onClick={() => setSelectedDayIdx(-1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              selectedDayIdx === -1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Days ({daily_logs.length} Binder)</span>
          </button>

          {daily_logs.map((log, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDayIdx === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              Day {log.day_number} ({log.date})
            </button>
          ))}
        </div>
      </div>

      {/* Render Daily Log Sheets */}
      <div className="space-y-8">
        {logsToDisplay.map((log, idx) => (
          <ELDLogSheet
            key={log.day_number || idx}
            log={log}
            driverDetails={driver_details}
            currentCycleUsed={trip.current_cycle_used}
          />
        ))}
      </div>
    </div>
  );
}
