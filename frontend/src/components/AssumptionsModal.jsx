import React from 'react';
import { X, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export default function AssumptionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-blue-900">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Assumptions & HOS Calculation Rules</h3>
            <span className="text-xs text-slate-500">49 CFR Part 395 FMCSA Property-Carrying Standard</span>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">1. 11-Hour Driving Limit</h4>
            <p>
              A driver may drive a maximum of 11 hours after 10 consecutive hours off duty. The engine automatically enforces driving pauses once 11 cumulative hours are reached in any shift.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">2. 14-Hour Consecutive Duty Window</h4>
            <p>
              A driver may not drive beyond the 14th consecutive hour after coming on duty, following 10 consecutive hours off duty. Non-driving duties (pickup, drop-off, fueling) count toward the 14-hour window.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">3. 30-Minute Rest Break</h4>
            <p>
              Drivers must take a consecutive 30-minute non-driving break after 8 cumulative hours of driving without at least a 30-minute interruption.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">4. 70-Hour / 8-Day Cycle</h4>
            <p>
              Driver cannot drive after accumulating 70 on-duty hours in any 8 consecutive days. Remaining cycle hours = 70.0 - current cycle used. If the trip requires more duty hours than available, a clear violation warning is generated.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">5. Stop Durations & Intervals</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Pickup Duration:</strong> Exactly 1.0 hour (On Duty Not Driving) for loading.</li>
              <li><strong>Drop-off Duration:</strong> Exactly 1.0 hour (On Duty Not Driving) for unloading.</li>
              <li><strong>Fuel Stops:</strong> Scheduled at least once every 1,000 miles (30 mins On Duty).</li>
              <li><strong>Rest Periods:</strong> 10 consecutive hours (Sleeper Berth or Off Duty).</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
