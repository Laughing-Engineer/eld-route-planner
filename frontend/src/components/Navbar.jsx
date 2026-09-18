import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Map, History, FileText, Activity, Shield, Database } from 'lucide-react';
import api from '../services/api';
import ConnectionModal from './ConnectionModal';

export default function Navbar() {
  const location = useLocation();
  const [health, setHealth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHealth = useCallback(() => {
    api.getHealth()
      .then(data => setHealth(data))
      .catch((err) => setHealth({ status: 'offline', error: err?.message }));
  }, []);

  useEffect(() => {
    fetchHealth();
    // Poll every 25 seconds to keep connection state reactive
    const interval = setInterval(fetchHealth, 25000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const navLinks = [
    { name: 'Plan Trip', path: '/planner', icon: Map },
    { name: 'Saved Trips', path: '/history', icon: History },
    { name: 'Rules & Regulations', path: '/docs?tab=rules', icon: FileText },
    { name: 'Compliance', path: '/docs?tab=compliance', icon: Shield },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-500 transition shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight block leading-none">
                ELD ROUTE PLANNER
              </span>
              <span className="text-[10px] text-blue-400 font-mono font-medium tracking-wider uppercase">
                FMCSA Hours of Service Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.path.includes('tab=compliance')
                ? location.pathname === '/docs' && location.search.includes('tab=compliance')
                : item.path.includes('tab=rules')
                  ? location.pathname === '/docs' && !location.search.includes('tab=compliance')
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* API & DB Status Pill (Interactive Diagnostics Modal Trigger) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              title="Click to view Backend & MongoDB Atlas connection manager"
              className="flex items-center gap-1.5 text-xs bg-slate-800/90 hover:bg-slate-750 px-3 py-1 rounded-full border border-slate-700 hover:border-slate-600 transition cursor-pointer group"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  health === null
                    ? 'bg-amber-400 animate-pulse'
                    : health.status === 'offline'
                    ? 'bg-rose-500'
                    : health.mongodb_connected
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 group-hover:text-white text-[11px] font-mono transition">
                {health === null
                  ? 'Connecting...'
                  : health.status === 'offline'
                  ? 'API Offline (Fix)'
                  : health.mongodb_connected
                  ? 'Atlas DB Online'
                  : 'API Online (DB Unset)'}
              </span>
            </button>
            <Link
              to="/planner"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-md shadow transition flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>New Trip</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Connection Manager Modal */}
      <ConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        health={health}
        onRefresh={fetchHealth}
      />
    </nav>
  );
}
