import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  BookOpen, ShieldCheck, Clock, Fuel, Bed, AlertTriangle, 
  FileSpreadsheet, CheckCircle2, ChevronRight, Truck, Info, Award
} from 'lucide-react';

export default function DocumentationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'rules';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['rules', 'compliance', 'statuses', 'assumptions'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'rules', label: 'Rules & Regulations', icon: Clock },
    { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
    { id: 'statuses', label: 'ELD Duty Statuses', icon: FileSpreadsheet },
    { id: 'assumptions', label: 'Assumptions & Guidelines', icon: Info },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Regulatory Reference & Audit Guide</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          FMCSA Hours of Service & Compliance Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Complete guide to FMCSA 49 CFR Part 395 standards, automated compliance calculation rules, duty status logging, and Form MCS-59 ELD sheets.
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-2 sm:space-x-4 border-b border-slate-200 mt-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Rules & Regulations */}
      {activeTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Core FMCSA 49 CFR Part 395 Property-Carrying CMV Rules</span>
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              The Hours of Service regulations establish statutory boundaries for commercial motor vehicle operators to reduce fatigue-related accidents.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 11-Hour Rule */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">1. 11-Hour Maximum Driving Limit</h3>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Driving</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A property-carrying driver may drive a maximum of <strong>11 cumulative hours</strong> following 10 consecutive hours off duty. Once 11 driving hours are reached in any shift, driving must cease until another 10-hour sleeper berth or off-duty reset is completed.
                </p>
              </div>

              {/* 14-Hour Window */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">2. 14-Hour Consecutive Duty Window</h3>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Duty Window</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A driver may not drive beyond the <strong>14th consecutive hour</strong> after coming on duty, following 10 consecutive hours off duty. Non-driving duties such as pickup loading (1 hr), drop-off unloading (1 hr), and fueling count towards the 14-hour window and cannot extend it.
                </p>
              </div>

              {/* 30-Minute Break */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">3. 30-Minute Rest Break (8-Hour Rule)</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Rest Break</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Drivers must take at least <strong>30 consecutive minutes</strong> of non-driving time (Off Duty, Sleeper Berth, or On Duty Not Driving) after 8 cumulative hours of driving without an interruption. The planner automatically inserts this break at or before the 8-hour mark.
                </p>
              </div>

              {/* 10-Hour Reset */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">4. 10-Hour Mandatory Shift Reset</h3>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Sleeper Reset</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prior to resuming driving after hitting either the 11-hour driving cap or 14-hour duty window, drivers must complete <strong>10 consecutive hours</strong> of rest (Sleeper Berth or Off Duty), which fully resets the 11-hour driving and 14-hour window clocks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Compliance & Audit Standards */}
      {activeTab === 'compliance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>FMCSA Compliance Audit & Cycle Enforcement</span>
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              How the engine verifies adherence to the 70-hour / 8-day cumulative duty limit and generates violation notices.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">70-Hour / 8-Day Cumulative Cycle Standard</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Drivers cannot drive after accumulating 70 total on-duty hours (Driving + On Duty Not Driving) in any 8 consecutive days.
                </p>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs space-y-1 text-slate-800">
                  <p><strong>Initial Reserve:</strong> 70.0 - Current Cycle Used</p>
                  <p><strong>Trip Duty Accumulation:</strong> Total Driving Hours + Pickup (1.0h) + Drop-off (1.0h) + Fueling Stops (0.5h each)</p>
                  <p><strong>Final Reserve:</strong> Initial Reserve - Trip Duty Accumulation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>COMPLIANT Status</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    When the required duty hours are less than or equal to the driver's available 70-hour cycle reserve. The trip is legally dispatched without cycle breach.
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 font-bold text-red-900 text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>VIOLATION_WARNING Status</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Triggered when the trip demands more duty hours than remain in the 70-hour cycle. The audit system flags the exact deficit and warns dispatchers of required 34-hour restarts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ELD Duty Statuses & Logs */}
      {activeTab === 'statuses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <span>The Four Standard Duty Statuses & Form MCS-59 Logs</span>
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Every driver log records 24 continuous hours across four distinct FMCSA duty rows.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm mb-1">1. OFF DUTY (OFF)</span>
                <p className="text-slate-600 leading-relaxed">
                  Driver is relieved of all work responsibilities. Applied to mandatory 30-minute rest breaks, pre-trip off-duty intervals, and post-delivery rest.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm mb-1">2. SLEEPER BERTH (SB)</span>
                <p className="text-slate-600 leading-relaxed">
                  Rest spent inside the commercial tractor sleeper compartment. Enforces the 10-hour mandatory shift reset rest periods between driving shifts.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm mb-1">3. DRIVING (D)</span>
                <p className="text-slate-600 leading-relaxed">
                  All time spent operating the commercial vehicle on public highways, connecting waypoints, facilities, and rest locations.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block text-sm mb-1">4. ON DUTY NOT DRIVING (ON)</span>
                <p className="text-slate-600 leading-relaxed">
                  All non-driving commercial work: freight loading (1 hr at pickup), freight unloading (1 hr at drop-off), and vehicle fueling (30 mins).
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Form MCS-59 24.0-Hour Precision Rule</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                For every calendar day generated, the sum of (OFF + SB + D + ON) equals <strong>exactly 24.0 hours</strong>. Any shift event that crosses midnight (24:00) is cleanly split into two contiguous segments at 00:00:00.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Assumptions & Guidelines */}
      {activeTab === 'assumptions' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>Routing Assumptions & Standard Operating Durations</span>
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Default operational constants applied by the routing and scheduling simulator.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Shipper Pickup Loading Duration:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">1.0 Hour (On Duty)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Receiver Drop-off Unloading Duration:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">1.0 Hour (On Duty)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Fuel Stop Interval & Duration:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">Every &le; 1,000 mi (0.5 hr On Duty)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Mandatory Shift Reset Rest:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">10.0 Consecutive Hours (Sleeper)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-800">Default Average Truck Speed:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">55.0 MPH (Highway Standard)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
