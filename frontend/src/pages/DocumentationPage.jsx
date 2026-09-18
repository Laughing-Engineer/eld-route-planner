import React from 'react';
import { BookOpen, ShieldCheck, Clock, Fuel, Bed, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Reference Guide</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Hours of Service (HOS) Engine & ELD Documentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete guide to the FMCSA 49 CFR Part 395 regulations, calculation methodology, duty statuses, and paper log generation.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Section 1: Overview */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>1. Regulatory Baseline: Property-Carrying CMV</span>
          </h2>
          <p className="mb-2">
            The Hours of Service (HOS) calculation engine is designed according to United States Department of Transportation (US DOT) and Federal Motor Carrier Safety Administration (FMCSA) regulations under <strong>49 CFR Part 395</strong> for property-carrying commercial motor vehicles.
          </p>
          <p>
            Under these rules, commercial drivers must maintain an active record of duty status (RODS) for every 24-hour calendar period, balancing driving performance with mandatory physiological rest periods.
          </p>
        </section>

        {/* Section 2: Core HOS Rules */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>2. Core HOS Rules Implemented</span>
          </h2>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">A. 11-Hour Driving Limit</h3>
              <p className="text-xs text-slate-600">
                A property-carrying CMV driver may drive a maximum of 11 cumulative hours within a driving window following 10 consecutive hours off duty. Once 11 driving hours are reached in any shift, driving must cease immediately until another 10 consecutive hours off-duty/sleeper berth rest is completed.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">B. 14-Hour Consecutive Duty Window</h3>
              <p className="text-xs text-slate-600">
                A driver may not drive beyond the 14th consecutive hour after coming on duty, following 10 consecutive hours off duty. Non-driving duties such as pickup loading (1 hr), drop-off unloading (1 hr), and vehicle fueling (0.5 hr) consume the 14-hour window, but do NOT extend it.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">C. 30-Minute Rest Break (8-Hour Driving Rule)</h3>
              <p className="text-xs text-slate-600">
                FMCSA mandates at least a 30 consecutive minute non-driving rest break (which may be Off Duty, Sleeper Berth, or On Duty Not Driving) after 8 cumulative hours of driving without at least a 30-minute interruption. The engine automatically injects this break at or before the 8th driving hour.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">D. 70-Hour / 8-Day Cycle Rule</h3>
              <p className="text-xs text-slate-600">
                Drivers cannot drive after having been on duty (Driving + On Duty Not Driving) for 70 hours in any 8 consecutive days.
                <br />
                <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 mt-1 inline-block font-mono">
                  Remaining Cycle Hours = 70.0 - Current Cycle Hours Used
                </code>
                <br />
                If the trip requires more duty hours than available in the remaining cycle, the compliance engine flags a prominent <strong>VIOLATION_WARNING</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">E. Fuel Stops Every &le; 1,000 Miles</h3>
              <p className="text-xs text-slate-600">
                Mandatory fuel stops are scheduled at least once every 1,000 miles. Each fuel stop accounts for 0.5 hours (30 minutes) of <em>On Duty Not Driving</em> for fueling and walkaround vehicle inspection.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: ELD Duty Statuses */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            <span>3. The Four Standard Duty Statuses</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">1. OFF DUTY (OFF)</span>
              <p className="text-slate-600">
                Time when the driver is relieved of all work responsibilities. Used for 30-minute breaks, pre-trip waiting, and post-trip rest.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">2. SLEEPER BERTH (SB)</span>
              <p className="text-slate-600">
                Rest periods spent inside the commercial tractor's sleeper berth compartment. Used for the 10-hour mandatory shift reset rest.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">3. DRIVING (D)</span>
              <p className="text-slate-600">
                All time spent behind the steering controls of the commercial motor vehicle in operation on public highways.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">4. ON DUTY NOT DRIVING (ON)</span>
              <p className="text-slate-600">
                All work performed other than driving, including freight loading (1 hr at pickup), unloading (1 hr at drop-off), and vehicle fueling (30 mins).
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: 24-Hour Graph Grid & Midnight Splitting */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            4. 24-Hour Log Sheet Generation & Midnight Splitting
          </h2>
          <p className="mb-2">
            According to FMCSA guidelines, an ELD or paper log must represent exactly one 24-hour calendar day from midnight (00:00:00) to midnight (24:00:00).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 mb-3">
            <li>Any event crossing 24:00 is mathematically partitioned into two discrete segments.</li>
            <li>For every calendar day, the sum of Off Duty + Sleeper Berth + Driving + On Duty hours equals exactly <strong>24.0 hours</strong>.</li>
            <li>Status changes automatically generate a corresponding line in the Form MCS-59 Remarks table, detailing the timestamp, geographic location, and activity description.</li>
          </ul>
        </section>

        {/* Section 5: Guidelines & Standards */}
        <section className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 text-blue-950">
          <div className="flex items-center gap-2 font-bold text-sm mb-2 text-blue-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>5. Operating Guidelines & Compliance Standards</span>
          </div>
          <p className="text-xs leading-relaxed text-blue-900/80">
            This platform models FMCSA 49 CFR Part 395 standards for property-carrying commercial motor vehicles with full mathematical precision. Drivers and dispatchers should ensure entered route points, loading times, and cycle hours match physical bills of lading and active duty records.
          </p>
        </section>
      </div>
    </div>
  );
}
