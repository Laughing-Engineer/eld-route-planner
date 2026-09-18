import React from 'react';
import { Truck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-base mb-2">
              <Truck className="w-5 h-5 text-blue-500" />
              <span>ELD Route Planner & HOS Log Generator</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A comprehensive logistics routing and FMCSA compliance platform. Calculates real-world highway routes via OpenStreetMap & OSRM, evaluates 70-hr/8-day property-carrying rules, schedules required breaks and fuel stops, and generates 24-hour Form MCS-59 paper-style ELD driver logs.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/planner" className="hover:text-blue-400 transition">Trip Planner</Link></li>
              <li><Link to="/history" className="hover:text-blue-400 transition">Saved Trips</Link></li>
              <li><Link to="/docs?tab=rules" className="hover:text-blue-400 transition">Rules & Regulations</Link></li>
              <li><Link to="/docs?tab=compliance" className="hover:text-blue-400 transition">Compliance Standards</Link></li>
              <li><Link to="/docs?tab=statuses" className="hover:text-blue-400 transition">ELD Duty Statuses & Logs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">FMCSA Standards</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• 11-Hour Maximum Driving Limit</li>
              <li>• 14-Hour Consecutive Duty Window</li>
              <li>• 30-Minute Break after 8h Driving</li>
              <li>• 10-Hour Mandatory Sleeper Reset</li>
              <li>• 70-Hour / 8-Day Cycle Rule</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 text-[11px]">
          <div>ELD Route Planner & Hours of Service Management</div>
          <div className="text-slate-500">FMCSA 49 CFR Part 395 Compliant Routing</div>
        </div>
      </div>
    </footer>
  );
}
