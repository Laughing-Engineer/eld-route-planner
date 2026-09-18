import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Info, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AssumptionsModal({ isOpen, onClose }) {
  const [modalTab, setModalTab] = useState('rules');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
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
            <h3 className="text-lg font-bold text-slate-900">Assumptions, Rules & Compliance</h3>
            <span className="text-xs text-slate-500">FMCSA 49 CFR Part 395 Property-Carrying Standard</span>
          </div>
        </div>

        {/* Modal Internal Tabs */}
        <div className="flex border-b border-slate-200 mb-4 gap-2 text-xs">
          <button
            onClick={() => setModalTab('rules')}
            className={`pb-2 px-2.5 font-bold border-b-2 transition ${
              modalTab === 'rules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            HOS Shift Rules
          </button>
          <button
            onClick={() => setModalTab('compliance')}
            className={`pb-2 px-2.5 font-bold border-b-2 transition ${
              modalTab === 'compliance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            70h Cycle Compliance
          </button>
          <button
            onClick={() => setModalTab('stops')}
            className={`pb-2 px-2.5 font-bold border-b-2 transition ${
              modalTab === 'stops' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Stop Durations & Speeds
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700 max-h-[50vh] overflow-y-auto pr-1">
          {modalTab === 'rules' && (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">11-Hour Maximum Driving Limit</h4>
                <p>
                  A driver may drive a maximum of 11 hours after 10 consecutive hours off duty. The engine automatically enforces rest pauses once 11 cumulative hours are reached in any shift.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">14-Hour Consecutive Duty Window</h4>
                <p>
                  A driver may not drive beyond the 14th consecutive hour after coming on duty, following 10 consecutive hours off duty. Non-driving duties (pickup, drop-off, fueling) count toward the 14-hour window.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">30-Minute Rest Break (8-Hour Rule)</h4>
                <p>
                  Drivers must take a consecutive 30-minute non-driving break after 8 cumulative hours of driving without at least a 30-minute interruption.
                </p>
              </div>
            </>
          )}

          {modalTab === 'compliance' && (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-1">70-Hour / 8-Day Cycle Rule</h4>
                <p>
                  Driver cannot drive after accumulating 70 on-duty hours in any 8 consecutive days. Remaining cycle hours = 70.0 - current cycle used. If the trip requires more duty hours than available, a clear violation warning is generated.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900">
                <h4 className="font-bold text-sm mb-1">Automated Compliance Auditing</h4>
                <p>
                  Every planned trip calculates both start cycle reserve and end cycle reserve. If a violation is predicted, dispatch warnings and suggested 34-hour restart points are highlighted.
                </p>
              </div>
            </>
          )}

          {modalTab === 'stops' && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Operational Constants</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Pickup Duration:</strong> Exactly 1.0 hour (On Duty Not Driving) for loading.</li>
                <li><strong>Drop-off Duration:</strong> Exactly 1.0 hour (On Duty Not Driving) for unloading.</li>
                <li><strong>Fuel Stops:</strong> Scheduled at least once every 1,000 miles (30 mins On Duty).</li>
                <li><strong>Rest Periods:</strong> 10 consecutive hours (Sleeper Berth or Off Duty).</li>
                <li><strong>Average Speed:</strong> Configurable (default 55 mph) for CMV highway realism.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <Link
            to="/docs?tab=rules"
            onClick={onClose}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>Open Full Rules & Regulations Guide</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
