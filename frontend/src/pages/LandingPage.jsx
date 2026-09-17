import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, Route, Clock, ShieldCheck, FileSpreadsheet, 
  ArrowRight, CheckCircle2, ChevronRight, Fuel, Bed 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-700/50 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 mb-6 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>FMCSA 49 CFR Part 395 Compliant Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
            ELD Route Planner & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">
              Hours of Service Log Generator
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            Intelligent commercial motor vehicle trip planning. Automatically calculates road routes via OpenStreetMap & OSRM, simulates property-carrying HOS shifts, schedules mandatory 30-min breaks, fuel stops, and 10-hr resets, and renders authentic 24-hour Form MCS-59 ELD logs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/planner"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2 text-base group"
            >
              <span>Start Planning Route</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/docs"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 text-base"
            >
              <span>HOS Rules & Documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Engineered for Commercial Motor Carriers
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            All core FMCSA property-carrying CMV regulations strictly calculated with real-world road networks and MongoDB persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Route Optimization */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Route className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Highway Routing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates genuine road geometry and driving times using OpenStreetMap Nominatim geocoding and the OSRM routing engine, with resilient fallbacks for continuous operation.
            </p>
          </div>

          {/* Card 2: HOS Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">FMCSA HOS Simulation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces 11-hour driving limits, 14-hour consecutive windows, mandatory 30-minute breaks after 8 hours driving, fuel stops every 1,000 miles, and 70-hour / 8-day cycle monitoring.
            </p>
          </div>

          {/* Card 3: 24h Paper Logs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="bg-purple-50 text-purple-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Precision 24h SVG Logs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Renders official Form MCS-59 Driver's Daily Logs with continuous 4-row duty-status SVG step grids, exact 24.0-hour totals, geographic remarks, and one-click print/PDF export.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight mb-12">
            Trip Simulation in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Enter Trip Points</h4>
              <p className="text-xs text-slate-600">
                Input origin, pickup facility, destination, and current cycle hours used from previous shifts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">HOS Engine Calculations</h4>
              <p className="text-xs text-slate-600">
                The engine segments driving, injects mandatory 30-min breaks, fuel stops (&le;1000 mi), and 10-hour sleeper resets.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Audit & Print Logs</h4>
              <p className="text-xs text-slate-600">
                Inspect the route on an interactive Leaflet map and download official Form MCS-59 daily log sheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
          Ready to plan an HOS-compliant route?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-8 max-w-lg mx-auto">
          Test out short hauls, cross-country trips, and cycle violation alerts with one-click presets.
        </p>
        <Link
          to="/planner"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow transition inline-flex items-center gap-2 text-sm"
        >
          <Truck className="w-4 h-4" />
          <span>Launch Trip Planner</span>
        </Link>
      </section>
    </div>
  );
}
