import React from 'react';
import { Clock, Truck, PackageCheck, Fuel, Bed, Coffee, CheckCircle, ArrowRight } from 'lucide-react';

export default function TimelineView({ events = [] }) {
  if (!events || events.length === 0) {
    return <div className="p-6 text-center text-slate-400">No events scheduled.</div>;
  }

  const getEventIcon = (type, notes = "") => {
    if (type === "DRIVING") return <Truck className="w-4 h-4 text-blue-600" />;
    if (type === "ON_DUTY_NOT_DRIVING") {
      if (notes.toLowerCase().includes("fuel")) return <Fuel className="w-4 h-4 text-amber-600" />;
      return <PackageCheck className="w-4 h-4 text-emerald-600" />;
    }
    if (type === "SLEEPER_BERTH") return <Bed className="w-4 h-4 text-purple-600" />;
    if (type === "OFF_DUTY") {
      if (notes.toLowerCase().includes("30-minute")) return <Coffee className="w-4 h-4 text-slate-600" />;
      return <Bed className="w-4 h-4 text-slate-500" />;
    }
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  const getStatusBadge = (type) => {
    switch (type) {
      case "DRIVING":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">DRIVING</span>;
      case "ON_DUTY_NOT_DRIVING":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">ON DUTY</span>;
      case "SLEEPER_BERTH":
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">SLEEPER</span>;
      case "OFF_DUTY":
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">OFF DUTY</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((evt, idx) => {
            const isLast = idx === events.length - 1;
            const startTimeStr = evt.start_time?.replace('T', ' ').substring(0, 16);
            const endTimeStr = evt.end_time?.replace('T', ' ').substring(0, 16);

            return (
              <li key={evt.id || idx}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                  )}
                  <div className="relative flex items-start space-x-3">
                    {/* Event Icon Pin */}
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                        {getEventIcon(evt.type, evt.notes)}
                      </div>
                    </div>

                    {/* Event Card */}
                    <div className="min-w-0 flex-1 bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(evt.type)}
                          <span className="font-bold text-slate-800 text-sm">
                            {evt.notes}
                          </span>
                        </div>
                        <span className="text-slate-500 font-mono font-medium">
                          {evt.duration_hours} hrs
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-600">
                        <div className="flex items-center gap-1 font-mono">
                          <span>{startTimeStr}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{endTimeStr}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span>Acc. Driving: <strong>{evt.accumulated_driving_hours}h</strong></span>
                          <span>Cycle Left: <strong>{evt.cycle_hours_remaining}h</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
