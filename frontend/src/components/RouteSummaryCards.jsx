import React from 'react';
import { Route, Clock, ShieldCheck, AlertTriangle, Fuel, Bed, BatteryCharging } from 'lucide-react';

export default function RouteSummaryCards({ summary, compliance, onSelectTab }) {
  if (!summary) return null;

  const isCompliant = compliance?.is_compliant !== false;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Distance */}
      <div 
        onClick={() => onSelectTab && onSelectTab('map')}
        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${onSelectTab ? 'cursor-pointer hover:border-blue-300 transition' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Distance</span>
          <Route className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-black text-slate-900">
          {summary.total_distance_miles?.toLocaleString() || 0} <span className="text-xs font-normal text-slate-500">mi</span>
        </div>
        <span className="text-[11px] text-slate-400">Via highway routing</span>
      </div>

      {/* Driving Hours */}
      <div 
        onClick={() => onSelectTab && onSelectTab('schedule')}
        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${onSelectTab ? 'cursor-pointer hover:border-blue-300 transition' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Drive Time</span>
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-black text-blue-700">
          {summary.total_driving_hours || 0} <span className="text-xs font-normal text-slate-500">hrs</span>
        </div>
        <span className="text-[11px] text-slate-400">At avg CMV speed</span>
      </div>

      {/* Total Duration */}
      <div 
        onClick={() => onSelectTab && onSelectTab('schedule')}
        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${onSelectTab ? 'cursor-pointer hover:border-blue-300 transition' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Trip</span>
          <Clock className="w-4 h-4 text-slate-600" />
        </div>
        <div className="text-xl font-black text-slate-900">
          {summary.total_trip_duration_hours || 0} <span className="text-xs font-normal text-slate-500">hrs</span>
        </div>
        <span className="text-[11px] text-slate-400">Inc. rests, fuels, load</span>
      </div>

      {/* Fuel Stops */}
      <div 
        onClick={() => onSelectTab && onSelectTab('map')}
        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${onSelectTab ? 'cursor-pointer hover:border-blue-300 transition' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Fuel Stops</span>
          <Fuel className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xl font-black text-amber-700">
          {summary.fuel_stops_count || 0}
        </div>
        <span className="text-[11px] text-slate-400">&le; 1,000 mi interval</span>
      </div>

      {/* Rest Stops */}
      <div 
        onClick={() => onSelectTab && onSelectTab('schedule')}
        className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm ${onSelectTab ? 'cursor-pointer hover:border-blue-300 transition' : ''}`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">Rest Stops</span>
          <Bed className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-xl font-black text-purple-700">
          {summary.rest_stops_count || 0}
        </div>
        <span className="text-[11px] text-slate-400">10-hr reset periods</span>
      </div>

      {/* Compliance Badge */}
      <div 
        onClick={() => onSelectTab && onSelectTab('audit')}
        className={`p-3.5 rounded-xl border shadow-sm ${onSelectTab ? 'cursor-pointer hover:shadow-md transition' : ''} ${
          isCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">HOS Status</span>
          {isCompliant ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
        </div>
        <div className="text-base font-black truncate">
          {isCompliant ? 'COMPLIANT' : 'VIOLATION'}
        </div>
        <span className="text-[11px] block mt-0.5">
          {compliance?.cycle_hours_remaining_end?.toFixed(1) || 0} hrs cycle left
        </span>
      </div>
    </div>
  );
}
