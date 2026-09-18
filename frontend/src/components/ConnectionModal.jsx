import React, { useState, useEffect } from 'react';
import { X, Database, Server, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ExternalLink, Copy, Check } from 'lucide-react';
import api, { getApiBaseUrl, setCustomApiUrl, resetApiUrl } from '../services/api';

export default function ConnectionModal({ isOpen, onClose, health, onRefresh }) {
  const [apiUrl, setApiUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getApiBaseUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = apiUrl.trim().replace(/\/+$/, '');
      setCustomApiUrl(cleanUrl);
      const res = await api.getHealth();
      setTestResult({ success: true, message: 'Successfully connected to backend!', data: res });
      if (onRefresh) onRefresh();
    } catch (err) {
      setTestResult({
        success: false,
        message: `Failed to reach backend at ${apiUrl}. Make sure your server is running or awake. (${err.message})`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    resetApiUrl();
    const defaultUrl = getApiBaseUrl();
    setApiUrl(defaultUrl);
    setTestResult({ success: true, message: `Reset to default URL: ${defaultUrl}` });
    if (onRefresh) onRefresh();
  };

  const copyAtlasTemplate = () => {
    navigator.clipboard.writeText('mongodb+srv://<username>:<password>@cluster0.mongodb.net/eld_planner?retryWrites=true&w=majority');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

        {/* Change Backend API URL Form */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Backend API Endpoint URL
          </label>
          <p className="text-[11px] text-slate-500 mb-2.5">
            If running on Vercel, you can enter your deployed Render backend URL (e.g. <code className="bg-slate-200 px-1 rounded text-slate-800">https://your-app.onrender.com/api</code>).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000/api"
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveAndTest}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Save & Test'}</span>
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
              title="Reset to default URL"
            >
              Reset
            </button>
          </div>

          {testResult && (
            <div className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-start gap-2 ${testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* MongoDB Atlas Setup Guide */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>How to Connect MongoDB Atlas (Cloud Database)</span>
            <a
              href="https://www.mongodb.com/cloud/atlas/register"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px] normal-case font-medium"
            >
              MongoDB Atlas Signup <ExternalLink className="w-3 h-3" />
            </a>
          </h4>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-xl border border-slate-200">
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Create a free cluster at <strong>mongodb.com/atlas</strong> (Shared M0 is 100% free forever).</span>
            </div>
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Under <strong>Network Access</strong>, add IP Address <code>0.0.0.0/0</code> (Allow Access from Anywhere so Render / local can connect).</span>
            </div>
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Under <strong>Database Access</strong>, create a database user with password (e.g. <code>eld_admin</code>).</span>
            </div>
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div className="flex-1">
                <span>Click <strong>Connect</strong> &gt; <strong>Drivers</strong> &gt; Copy connection string URI:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-slate-200/80 px-2 py-1 rounded text-[11px] text-slate-800 font-mono flex-1 truncate">
                    mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/eld_planner?retryWrites=true&amp;w=majority
                  </code>
                  <button
                    onClick={copyAtlasTemplate}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 shrink-0 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</span>
              <span>
                <strong>Deploying on Render:</strong> In your Render Web Service &gt; <strong>Environment</strong> &gt; Add <code>MONGODB_URI</code> = your connection string. Render will auto-redeploy!
              </span>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-lg text-[11px] text-blue-900">
            <strong>Note:</strong> While MongoDB Atlas is not yet configured, the application automatically uses <strong>in-memory persistence</strong>. All trip planning, HOS calculations, route maps, and ELD log generation work 100% out of the box!
          </div>
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
