import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Map, History, FileText, Shield } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

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

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow transition flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Plan a trip</span>
            </Link>
          </div>
        </div>
        <div className="flex md:hidden gap-1 overflow-x-auto border-t border-slate-800 py-2 scrollbar-none">
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
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
