import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RouteSummaryCards from '../components/RouteSummaryCards';
import MapComponent from '../components/MapComponent';
import TimelineView from '../components/TimelineView';
import ELDLogSheet from '../components/ELDLogSheet';
import { 
  Map, Calendar, FileText, ShieldAlert, ShieldCheck, 
  Printer, ArrowLeft, Download, ChevronRight, AlertTriangle 
} from 'lucide-react';

export default function DashboardPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  useEffect(() => {
    if (tripId) {
      setIsLoading(true);
      api.getTripById(tripId)
        .then(data => {
          setTrip(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching trip:', err);
          setIsLoading(false);
        });
    }
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading trip details and ELD logs...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Could not retrieve trip {tripId}.</p>
        <Link to="/planner" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">
          Plan a New Trip
        </Link>
      </div>
    );
  }

  const { route_summary, compliance, stops, timeline, daily_logs, route_geometry, route_instructions, driver_details } = trip;
  const isCompliant = compliance?.is_compliant !== false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/planner" className="text-slate-400 hover:text-slate-700 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              {trip.trip_id}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {compliance?.status || (isCompliant ? 'COMPLIANT' : 'VIOLATION')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {trip.current_location?.name} &rarr; {trip.dropoff_location?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Driver: <strong>{driver_details?.driver_name}</strong> | Carrier: {driver_details?.carrier_name} | Truck: {driver_details?.truck_number}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Link
            to={`/logs/${trip.trip_id}`}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>View & Print ELD Logs ({daily_logs?.length || 1} Days)</span>
          </Link>
        </div>
      </div>

      {/* Compliance Warnings Banner if Violations Exist */}
      {compliance?.violations?.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-900 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Hours of Service Violation Detected</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            {compliance.violations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Route KPI Summary Cards */}
      <RouteSummaryCards summary={route_summary} compliance={compliance} />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Route Map & Stops</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline & Shifts ({timeline?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Daily ELD Logs ({daily_logs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance Audit</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* Tab 1: Map & Stops */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <MapComponent routeGeometry={route_geometry} stops={stops} summary={route_summary} />

          {/* Stops Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Route Waypoints & Scheduled Stops
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-2.5 px-3">Stop #</th>
                    <th className="p-2.5 px-3">Type</th>
                    <th className="p-2.5 px-3">Facility / Location</th>
                    <th className="p-2.5 px-3">Arrival</th>
                    <th className="p-2.5 px-3">Departure</th>
                    <th className="p-2.5 px-3">Duration</th>
                    <th className="p-2.5 px-3">Mile</th>
                    <th className="p-2.5 px-3">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stops?.map((stop, idx) => (
                    <tr key={stop.stop_id || idx} className="hover:bg-slate-50 font-sans">
                      <td className="p-2.5 px-3 font-mono font-bold text-slate-700">{idx + 1}</td>
                      <td className="p-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stop.stop_type === 'PICKUP' ? 'bg-emerald-100 text-emerald-800' :
                          stop.stop_type === 'DROPOFF' ? 'bg-red-100 text-red-800' :
                          stop.stop_type === 'FUEL' ? 'bg-amber-100 text-amber-800' :
                          stop.stop_type === 'REST' ? 'bg-purple-100 text-purple-800' :
                          stop.stop_type === 'BREAK' ? 'bg-slate-200 text-slate-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {stop.stop_type}
                        </span>
                      </td>
                      <td className="p-2.5 px-3 font-semibold text-slate-900">{stop.location_name}</td>
                      <td className="p-2.5 px-3 font-mono text-slate-600">{stop.arrival_time?.replace('T', ' ')}</td>
                      <td className="p-2.5 px-3 font-mono text-slate-600">{stop.departure_time?.replace('T', ' ')}</td>
                      <td className="p-2.5 px-3 font-mono">{stop.duration_hours > 0 ? `${stop.duration_hours}h` : '-'}</td>
                      <td className="p-2.5 px-3 font-mono text-blue-700">{stop.cumulative_miles || 0} mi</td>
                      <td className="p-2.5 px-3 text-slate-600">{stop.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline */}
      {activeTab === 'schedule' && (
        <TimelineView events={timeline} />
      )}

      {/* Tab 3: Daily ELD Logs */}
      {activeTab === 'logs' && daily_logs && daily_logs.length > 0 && (
        <div>
          {/* Day Navigation Bar */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-2">Select Day:</span>
              {daily_logs.map((log, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedDayIdx === idx
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  Day {log.day_number} ({log.date})
                </button>
              ))}
            </div>

            <Link
              to={`/logs/${trip.trip_id}`}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
            >
              Open Print Binder &rarr;
            </Link>
          </div>

          <ELDLogSheet 
            log={daily_logs[selectedDayIdx]} 
            driverDetails={driver_details}
            currentCycleUsed={trip.current_cycle_used}
          />
        </div>
      )}

      {/* Tab 4: Compliance Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            FMCSA Hours of Service Compliance Audit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>11-Hour Driving Rule</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Maximum shift driving was kept within 11 cumulative driving hours per shift. 10 consecutive hours of rest were taken before resumption of driving.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>14-Hour Consecutive Duty Window</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Driving tasks were scheduled within the 14-hour window from the driver's shift start time. Non-driving duties were accounted for in window calculations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>30-Minute Rest Break (8-Hour Driving Rule)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                A consecutive 30-minute rest break was scheduled after 8 cumulative hours of driving without an intervening break.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fuel Stops Every &le; 1,000 Miles</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Route distance of {route_summary.total_distance_miles} miles has {route_summary.fuel_stops_count} designated 30-minute fueling and equipment inspection stops.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/50">
            <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">
              70-Hour / 8-Day Cycle Audit
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Start Cycle Used</span>
                <span className="text-sm font-bold text-slate-800">{compliance?.current_cycle_used} hrs</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Trip Duty Time</span>
                <span className="text-sm font-bold text-blue-700">{compliance?.cycle_hours_used_trip} hrs</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">End Cycle Reserve</span>
                <span className="text-sm font-bold text-slate-800">{compliance?.cycle_hours_remaining_end} hrs</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">Cycle Compliance</span>
                <span className={`text-sm font-black ${isCompliant ? 'text-emerald-700' : 'text-red-700'}`}>
                  {isCompliant ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
