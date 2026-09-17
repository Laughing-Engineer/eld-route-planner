import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TimelineView from '../components/TimelineView';
import { Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function SchedulePage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      setIsLoading(true);
      api.getTripById(tripId)
        .then(data => {
          setTrip(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading schedule...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <Link to="/planner" className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg mt-4 inline-block">
          Plan Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/dashboard/${trip.trip_id}`} className="text-slate-400 hover:text-slate-700 transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
              {trip.trip_id}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Trip Schedule & Timeline</span>
          </h1>
        </div>
      </div>

      <TimelineView events={trip.timeline} />
    </div>
  );
}
