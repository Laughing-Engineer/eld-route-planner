import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Building2, Compass } from 'lucide-react';
import { api } from '../services/api';

const LOCAL_POPULAR_LOCATIONS = [
  { name: 'Dallas, TX', display: 'Dallas, Dallas County, Texas, USA', type: 'city', keywords: ['dallas', 'dellas', 'dalas', 'texas', 'tx'] },
  { name: 'California, USA', display: 'California, United States', type: 'state', keywords: ['california', 'califonia', 'calfornia', 'cali', 'ca'] },
  { name: 'Los Angeles, CA', display: 'Los Angeles, Los Angeles County, California, USA', type: 'city', keywords: ['los angeles', 'la', 'california', 'ca'] },
  { name: 'Chicago, IL', display: 'Chicago, Cook County, Illinois, USA', type: 'city', keywords: ['chicago', 'chicargo', 'chigago', 'illinois', 'il'] },
  { name: 'Houston, TX', display: 'Houston, Harris County, Texas, USA', type: 'city', keywords: ['houston', 'housten', 'texas', 'tx'] },
  { name: 'Phoenix, AZ', display: 'Phoenix, Maricopa County, Arizona, USA', type: 'city', keywords: ['phoenix', 'pheonix', 'phenix', 'arizona', 'az'] },
  { name: 'San Antonio, TX', display: 'San Antonio, Bexar County, Texas, USA', type: 'city', keywords: ['san antonio', 'texas', 'tx'] },
  { name: 'San Diego, CA', display: 'San Diego, San Diego County, California, USA', type: 'city', keywords: ['san Diego', 'california', 'ca'] },
  { name: 'San Francisco, CA', display: 'San Francisco, California, USA', type: 'city', keywords: ['san francisco', 'sf', 'san fran', 'california', 'ca'] },
  { name: 'Austin, TX', display: 'Austin, Travis County, Texas, USA', type: 'city', keywords: ['austin', 'texas', 'tx'] },
  { name: 'Fort Worth, TX', display: 'Fort Worth, Tarrant County, Texas, USA', type: 'city', keywords: ['fort worth', 'ft worth', 'texas', 'tx'] },
  { name: 'Indianapolis, IN', display: 'Indianapolis, Marion County, Indiana, USA', type: 'city', keywords: ['indianapolis', 'indy', 'indiana', 'in'] },
  { name: 'Columbus, OH', display: 'Columbus, Franklin County, Ohio, USA', type: 'city', keywords: ['columbus', 'columbas', 'ohio', 'oh'] },
  { name: 'Charlotte, NC', display: 'Charlotte, Mecklenburg County, North Carolina, USA', type: 'city', keywords: ['charlotte', 'north carolina', 'nc'] },
  { name: 'Seattle, WA', display: 'Seattle, King County, Washington, USA', type: 'city', keywords: ['seattle', 'washington', 'wa'] },
  { name: 'Denver, CO', display: 'Denver, Colorado, USA', type: 'city', keywords: ['denver', 'colorado', 'co'] },
  { name: 'Atlanta, GA', display: 'Atlanta, Fulton County, Georgia, USA', type: 'city', keywords: ['atlanta', 'atl', 'georgia', 'ga'] },
  { name: 'Miami, FL', display: 'Miami, Miami-Dade County, Florida, USA', type: 'city', keywords: ['miami', 'florida', 'fl'] },
  { name: 'Philadelphia, PA', display: 'Philadelphia, Pennsylvania, USA', type: 'city', keywords: ['philadelphia', 'philly', 'pennsylvania', 'pa'] },
  { name: 'New York, NY', display: 'New York, New York, USA', type: 'city', keywords: ['new york', 'nyc', 'ny'] },
  { name: 'Nashville, TN', display: 'Nashville, Davidson County, Tennessee, USA', type: 'city', keywords: ['nashville', 'nashvile', 'tennessee', 'tn'] },
  { name: 'Memphis, TN', display: 'Memphis, Shelby County, Tennessee, USA', type: 'city', keywords: ['memphis', 'mempis', 'tennessee', 'tn'] },
  { name: 'Detroit, MI', display: 'Detroit, Wayne County, Michigan, USA', type: 'city', keywords: ['detroit', 'michigan', 'mi'] },
  { name: 'Milwaukee, WI', display: 'Milwaukee, Milwaukee County, Wisconsin, USA', type: 'city', keywords: ['milwaukee', 'milwakee', 'wisconsin', 'wi'] },
  { name: 'Kansas City, MO', display: 'Kansas City, Jackson County, Missouri, USA', type: 'city', keywords: ['kansas city', 'kc', 'missouri', 'mo'] },
  { name: 'St. Louis, MO', display: 'St. Louis, Missouri, USA', type: 'city', keywords: ['st louis', 'st. louis', 'stl', 'missouri', 'mo'] },
  { name: 'Las Vegas, NV', display: 'Las Vegas, Clark County, Nevada, USA', type: 'city', keywords: ['las vegas', 'vegas', 'nevada', 'nv'] },
  { name: 'Salt Lake City, UT', display: 'Salt Lake City, Utah, USA', type: 'city', keywords: ['salt lake city', 'slc', 'utah', 'ut'] },
  { name: 'Portland, OR', display: 'Portland, Multnomah County, Oregon, USA', type: 'city', keywords: ['portland', 'oregon', 'or'] },
  { name: 'Texas, USA', display: 'Texas, United States', type: 'state', keywords: ['texas', 'tx'] },
  { name: 'Florida, USA', display: 'Florida, United States', type: 'state', keywords: ['florida', 'fl'] },
  { name: 'Illinois, USA', display: 'Illinois, United States', type: 'state', keywords: ['illinois', 'il'] },
  { name: 'Ohio, USA', display: 'Ohio, United States', type: 'state', keywords: ['ohio', 'oh'] },
  { name: 'Pennsylvania, USA', display: 'Pennsylvania, United States', type: 'state', keywords: ['pennsylvania', 'pa'] }
];

export default function LocationAutocomplete({
  label,
  name,
  value,
  onChange,
  onSelect,
  placeholder,
  error,
  iconColor = 'text-blue-600',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const q = query.trim().toLowerCase();
    
    // 1. Instant local matching
    const localMatches = LOCAL_POPULAR_LOCATIONS.filter(item => {
      if (item.name.toLowerCase().includes(q)) return true;
      if (item.display.toLowerCase().includes(q)) return true;
      return item.keywords.some(k => k.startsWith(q) || q.startsWith(k));
    }).map(item => ({
      name: item.name,
      display_name: item.display,
      type: item.type
    }));

    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setIsOpen(true);
    }

    // 2. Debounced API fetch for comprehensive address search
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const remoteData = await api.getLocationSuggestions(query);
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          const names = new Set(remoteData.map(r => r.name.toLowerCase()));
          const combined = [
            ...remoteData,
            ...localMatches.filter(l => !names.has(l.name.toLowerCase()))
          ];
          setSuggestions(combined.slice(0, 8));
          setIsOpen(true);
        } else if (localMatches.length > 0) {
          setSuggestions(localMatches);
          setIsOpen(true);
        }
      } catch {
        // Keep local matches on error
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange({ target: { name, value: val } });
    fetchSuggestions(val);
  };

  const handleSelect = (item) => {
    const selectedText = item.name || item.display_name;
    onChange({ target: { name, value: selectedText } });
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange({ target: { name, value: '' } });
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className={`w-4 h-4 ${iconColor}`} />
        </div>

        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value && value.trim().length >= 2) {
              fetchSuggestions(value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 pr-9 py-2 text-sm rounded-lg border bg-white shadow-xs transition ${
            error 
              ? 'border-red-400 focus:ring-2 focus:ring-red-400 focus:border-red-400' 
              : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          } focus:outline-none`}
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          )}
          {value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-[11px] mt-1">{error}</p>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={`${item.name}-${idx}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-3.5 py-2.5 cursor-pointer flex items-start gap-2.5 transition ${
                  isHighlighted ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="mt-0.5 text-slate-400 shrink-0">
                  {item.type === 'state' ? (
                    <Compass className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Building2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {item.type || 'city'}
                    </span>
                  </div>
                  {item.display_name && item.display_name !== item.name && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.display_name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
