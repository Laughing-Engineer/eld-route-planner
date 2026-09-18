import React from 'react';
import { X, Database, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

export default function ConnectionModal({ isOpen, onClose, health, onRefresh }) {
  if (!isOpen) return null;

  const isApiOnline = health?.status === 'healthy';
  const isMongoConnected = health?.mongodb_connected === true;
  const mongoStatus = health?.mongodb_status || (isApiOnline ? 'not_configured' : 'unknown');

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-blue-50 text-blue-700 p-2.5 rounded-xl border border-blue-100">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Backend & Database Connection Manager
            </h3>
            <p className="text-xs text-slate-500">
              Live diagnostics, MongoDB Atlas setup, and remote API configuration
            </p>
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Backend API Box */}
          <div className={`p-3.5 rounded-xl border ${isApiOnline ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Server className="w-4 h-4" /> Backend Server
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isApiOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {isApiOnline ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Online
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600" /> Offline
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-600 truncate font-mono bg-white/70 px-2 py-1 rounded border border-slate-200/60">
              {getApiBaseUrl()}
            </p>
          </div>

          {/* MongoDB Box */}
          <div className={`p-3.5 rounded-xl border ${isMongoConnected ? 'bg-emerald-50/70 border-emerald-200' : mongoStatus === 'error' ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/70 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> MongoDB Atlas
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${isMongoConnected ? 'bg-emerald-100 text-emerald-800' : mongoStatus === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                {isMongoConnected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connected
                  </>
                ) : mongoStatus === 'error' ? (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600" /> Connection Error
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Not Configured
                  </>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              {health?.mongodb_message || (isApiOnline ? 'Checking MongoDB status...' : 'Waiting for backend response...')}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <p className="text-xs font-bold text-slate-800 mb-1">Configured backend API</p>
          <p className="text-[11px] text-slate-500 mb-2">This endpoint is configured by the Vercel build environment.</p>
          <p className="text-xs text-slate-600 truncate font-mono bg-white px-2 py-1.5 rounded border border-slate-200">
            {getApiBaseUrl()}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Diagnostics</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
