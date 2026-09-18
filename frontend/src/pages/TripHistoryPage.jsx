import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  History, Search, Trash2, ArrowRight, FileText, 
  MapPin, Clock, Truck, ShieldCheck, AlertTriangle 
} from 'lucide-react';

export default function TripHistoryPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteMsg, setDeleteMsg] = useState(null);

  const loadTrips = (query = '') => {
    setIsLoading(true);
    api.getTrips(query)
      .then(data => {
        setTrips(data.trips || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading trips:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTrips(searchTerm);
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm(`Are you sure you want to delete trip ${tripId}?`)) return;
    try {
      await api.deleteTrip(tripId);
      setDeleteMsg(`Trip ${tripId} removed.`);
      setTimeout(() => setDeleteMsg(null), 3000);
      loadTrips(searchTerm);
    } catch (err) {
      console.error('Error deleting trip:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            <span>Saved Trips & Trip History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review planned routes, compliance results, and generated driver logs in one place.
          </p>
        </div>

        <Link
          to="/planner"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-1.5"
        >
          <Truck className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {deleteMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
          {deleteMsg}
        </div>
      )}

      {/* Search Filter Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by trip ID, city, state, or driver name..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          Search
        </button>
      </form>

      {/* Trips List */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading saved trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Saved Trips Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
            {searchTerm ? `No trips matching '${searchTerm}'. Try a different keyword.` : "You haven't planned any trips yet. Create your first trip to generate HOS schedules and ELD logs."}
          </p>
          <Link
            to="/planner"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition inline-flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Launch Trip Planner</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => {
            const isCompliant = t.is_compliant !== false;
            return (
              <div
                key={t.trip_id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {t.trip_id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {t.compliance_status || (isCompliant ? 'COMPLIANT' : 'VIOLATION')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{t.current_location}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span>{t.dropoff_location}</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span>Driver: <strong>{t.driver_name || 'John Doe'}</strong></span>
                    <span>•</span>
                    <span>{t.total_distance_miles} mi</span>
                    <span>•</span>
                    <span>{t.total_driving_hours} hrs drive</span>
                    <span>•</span>
                    <span>{t.total_days} day(s) logged</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Link
                    to={`/dashboard/${t.trip_id}`}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/logs/${t.trip_id}`}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Logs</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(t.trip_id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
