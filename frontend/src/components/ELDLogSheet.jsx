import React from 'react';
import ELDGridSVG from './ELDGridSVG';
import { Calendar, User, Truck, ShieldCheck, MapPin, Clock } from 'lucide-react';

export default function ELDLogSheet({ log, driverDetails, currentCycleUsed = 0 }) {
  if (!log) return null;

  const driver = log.driver_details || driverDetails || {};
  const totals = log.status_totals || {};
  const segments = log.duty_segments || [];
  const remarks = log.remarks || [];

  return (
    <div className="eld-log-sheet bg-white border-2 border-slate-800 rounded-lg p-6 shadow-md text-slate-900 font-sans print:p-2 print:border-black print:shadow-none mb-8">
      {/* Header Bar */}
      <div className="border-b-2 border-slate-800 pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded tracking-wide">
              FORM MCS-59 COMPLIANT
            </span>
            <span className="text-xs text-slate-500 font-medium">49 CFR Part 395 - US DOT</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 mt-1 uppercase">
            Driver's Daily Log / ELD 24-Hour Duty Record
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-700">DAY {log.day_number}</div>
          <div className="text-lg font-mono font-bold text-blue-800">{log.date}</div>
        </div>
      </div>

      {/* Grid Metadata Form Fields */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-300 text-xs mb-4 print:bg-white print:border-black">
        <div>
          <span className="text-slate-500 block font-semibold uppercase text-[10px]">Driver Name</span>
          <span className="font-bold text-slate-900 text-sm">{driver.driver_name || "John Doe"}</span>
          {driver.co_driver_name && (
            <span className="text-slate-500 block text-[10px]">Co-Driver: {driver.co_driver_name}</span>
          )}
        </div>
        <div>
          <span className="text-slate-500 block font-semibold uppercase text-[10px]">Carrier Name</span>
          <span className="font-bold text-slate-900">{driver.carrier_name || "Apex Logistics Inc."}</span>
          <span className="text-slate-500 block text-[10px] truncate">{driver.main_office_address}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold uppercase text-[10px]">Vehicle / Trailer</span>
          <span className="font-bold text-slate-900">
            Tractor: {driver.truck_number || "TRK-8802"}
          </span>
          <span className="text-slate-600 block text-[11px]">Trailer: {driver.trailer_number || "TRL-4410"}</span>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold uppercase text-[10px]">Shipping Document / BOL #</span>
          <span className="font-bold text-slate-900 font-mono text-sm">
            {driver.shipping_doc_number || "BOL-98231"}
          </span>
          <span className="text-slate-500 block text-[10px]">24-Hr Period Start: 00:00 Midnight</span>
        </div>
      </div>

      {/* 24-Hour SVG Graph */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-700">
          <span>24-HOUR DUTY STATUS GRAPH GRID</span>
          <span className="text-blue-700 font-mono">Total Miles Today: {log.total_miles_driving_today || 0} mi</span>
        </div>
        <ELDGridSVG segments={segments} totals={totals} />
      </div>

      {/* Daily Status Totals Summary */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold border border-slate-300 rounded p-2 bg-slate-100 mb-4 print:bg-white print:border-black">
        <div className="border-r border-slate-300">
          <span className="block text-[10px] text-slate-500 uppercase">1. Off Duty</span>
          <span className="text-sm font-mono text-slate-800">{(totals.off_duty_hours || 0).toFixed(1)} hrs</span>
        </div>
        <div className="border-r border-slate-300">
          <span className="block text-[10px] text-slate-500 uppercase">2. Sleeper</span>
          <span className="text-sm font-mono text-slate-800">{(totals.sleeper_berth_hours || 0).toFixed(1)} hrs</span>
        </div>
        <div className="border-r border-slate-300">
          <span className="block text-[10px] text-slate-500 uppercase">3. Driving</span>
          <span className="text-sm font-mono text-blue-700">{(totals.driving_hours || 0).toFixed(1)} hrs</span>
        </div>
        <div className="border-r border-slate-300">
          <span className="block text-[10px] text-slate-500 uppercase">4. On Duty</span>
          <span className="text-sm font-mono text-amber-700">{(totals.on_duty_hours || 0).toFixed(1)} hrs</span>
        </div>
        <div className="bg-blue-50 text-blue-900 rounded p-0.5 print:bg-white print:border print:border-black">
          <span className="block text-[10px] text-blue-700 uppercase">Total (Must = 24)</span>
          <span className="text-sm font-mono font-black text-blue-900">{(totals.total_hours || 24.0).toFixed(1)} hrs</span>
        </div>
      </div>

      {/* Remarks Table */}
      <div className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Duty Status Change Remarks & Geographic Location
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 print:bg-white">
                <th className="p-1.5 px-3 w-16">Time</th>
                <th className="p-1.5 px-2 w-16 text-center">Status</th>
                <th className="p-1.5 px-3 w-48">Location / Checkpoint</th>
                <th className="p-1.5 px-3">Activity & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {remarks.length > 0 ? (
                remarks.map((rem, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-1.5 px-3 font-bold text-slate-800">{rem.time}</td>
                    <td className="p-1.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rem.status === 'D' ? 'bg-blue-100 text-blue-800' :
                        rem.status === 'ON' ? 'bg-amber-100 text-amber-800' :
                        rem.status === 'SB' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {rem.status}
                      </span>
                    </td>
                    <td className="p-1.5 px-3 text-slate-700 font-sans">{rem.location || "En-route"}</td>
                    <td className="p-1.5 px-3 text-slate-600 font-sans">{rem.activity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-slate-400 font-sans italic">
                    Continuous Off-Duty status for 24-hour period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Certification and Signature Section */}
      <div className="border-t-2 border-slate-800 pt-3 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div className="max-w-md">
          <p className="font-semibold text-slate-800 text-[11px]">
            "I certify that these entries are true and correct to the best of my knowledge in compliance with 49 CFR Part 395."
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-slate-400 text-[10px]">Certified Electronically by:</span>
            <span className="font-serif italic font-bold text-blue-900 border-b border-dashed border-slate-400 px-2">
              {driver.driver_name || "John Doe"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>ELD System Verified</span>
          </div>
          <span className="block text-[10px] text-slate-400 mt-1 font-mono">Audit ID: {log.date}-{driver.truck_number || "TRK"}</span>
        </div>
      </div>
    </div>
  );
}
