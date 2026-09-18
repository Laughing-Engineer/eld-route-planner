import React, { useState } from 'react';
import { 
  MapPin, Clock, Truck, User, Building, ShieldCheck, 
  ChevronDown, ChevronUp, RotateCcw, AlertCircle, Info 
} from 'lucide-react';
import AssumptionsModal from './AssumptionsModal';
import LocationAutocomplete from './LocationAutocomplete';

export default function TripForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 10.0,
    driver_name: 'John Doe',
    co_driver_name: '',
    carrier_name: 'Apex Logistics Inc.',
    main_office_address: '100 Freight Way, Chicago, IL 60601',
    home_terminal_timezone: 'America/Chicago',
    truck_number: 'TRK-8802',
    trailer_number: 'TRL-4410',
    shipping_doc_number: 'BOL-98231',
    start_datetime: '',
    average_truck_speed: 55.0,
    fuel_tank_range_miles: 1000.0
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current_cycle_used' || name === 'average_truck_speed' || name === 'fuel_tank_range_miles'
        ? parseFloat(value) || 0
        : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleClear = () => {
    setFormData({
      current_location: '',
      pickup_location: '',
      dropoff_location: '',
      current_cycle_used: 0.0,
      driver_name: 'John Doe',
      co_driver_name: '',
      carrier_name: 'Apex Logistics Inc.',
      main_office_address: '100 Freight Way, Chicago, IL 60601',
      home_terminal_timezone: 'America/Chicago',
      truck_number: 'TRK-8802',
      trailer_number: 'TRL-4410',
      shipping_doc_number: 'BOL-98231',
      start_datetime: '',
      average_truck_speed: 55.0,
      fuel_tank_range_miles: 1000.0
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.current_location.trim()) newErrors.current_location = 'Current location is required.';
    if (!formData.pickup_location.trim()) newErrors.pickup_location = 'Pickup location is required.';
    if (!formData.dropoff_location.trim()) newErrors.dropoff_location = 'Drop-off location is required.';
    if (formData.current_cycle_used < 0 || formData.current_cycle_used > 70) {
      newErrors.current_cycle_used = 'Cycle used must be between 0 and 70 hours.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const remainingCycleHours = Math.max(0, (70.0 - formData.current_cycle_used)).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>Trip Parameters & Hours of Service Input</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input commercial vehicle route points and available cycle hours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAssumptions(true)}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 self-start sm:self-auto bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
        >
          <Info className="w-4 h-4" />
          <span>Assumptions & Rules</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Core Required Inputs with Search Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Location */}
          <LocationAutocomplete
            label="1. Current Location"
            name="current_location"
            value={formData.current_location}
            onChange={handleChange}
            placeholder="e.g. Dallas, TX or California"
            error={errors.current_location}
            iconColor="text-blue-600"
            required
          />

          {/* Pickup Location */}
          <LocationAutocomplete
            label="2. Pickup Location"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            placeholder="e.g. Chicago, IL or Shipper City"
            error={errors.pickup_location}
            iconColor="text-emerald-600"
            required
          />

          {/* Drop-off Location */}
          <LocationAutocomplete
            label="3. Drop-off Location"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            placeholder="e.g. Los Angeles, CA or Delivery City"
            error={errors.dropoff_location}
            iconColor="text-rose-600"
            required
          />
        </div>

        {/* Cycle Hours Input + Live Gauge */}
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-md">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                4. Current Cycle Used in Hours (70h/8d Rule) <span className="text-red-500">*</span>
              </label>
              <div className="relative w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  type="number"
                  name="current_cycle_used"
                  value={formData.current_cycle_used}
                  onChange={handleChange}
                  min="0"
                  max="70"
                  step="0.5"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.current_cycle_used && (
                <p className="text-red-500 text-[11px] mt-1">{errors.current_cycle_used}</p>
              )}
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Cycle Limit</span>
                <span className="text-base font-bold text-slate-800">70.0 h</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Used</span>
                <span className="text-base font-bold text-blue-600">{formData.current_cycle_used} h</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Remaining</span>
                <span className={`text-base font-black ${
                  remainingCycleHours < 10 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {remainingCycleHours} h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Optional / Driver Fields */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-slate-50 px-4 py-3 text-left flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Optional Carrier, Vehicle & Driver Information</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Driver Name</label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Co-Driver Name</label>
                <input
                  type="text"
                  name="co_driver_name"
                  value={formData.co_driver_name}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Carrier Name</label>
                <input
                  type="text"
                  name="carrier_name"
                  value={formData.carrier_name}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Main Office Address</label>
                <input
                  type="text"
                  name="main_office_address"
                  value={formData.main_office_address}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Tractor / Truck #</label>
                <input
                  type="text"
                  name="truck_number"
                  value={formData.truck_number}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Trailer #</label>
                <input
                  type="text"
                  name="trailer_number"
                  value={formData.trailer_number}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Shipping Doc / BOL #</label>
                <input
                  type="text"
                  name="shipping_doc_number"
                  value={formData.shipping_doc_number}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Avg Truck Speed (mph)</label>
                <input
                  type="number"
                  name="average_truck_speed"
                  value={formData.average_truck_speed}
                  onChange={handleChange}
                  min="30"
                  max="75"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Fuel Tank Range (mi)</label>
                <input
                  type="number"
                  name="fuel_tank_range_miles"
                  value={formData.fuel_tank_range_miles}
                  onChange={handleChange}
                  min="500"
                  max="1500"
                  step="50"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Starting Date & Time</label>
                <input
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-md transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Geocoding & Calculating HOS Plan...</span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>Generate Route & ELD Logs</span>
              </>
            )}
          </button>
        </div>
      </form>

      <AssumptionsModal isOpen={showAssumptions} onClose={() => setShowAssumptions(false)} />
    </div>
  );
}
