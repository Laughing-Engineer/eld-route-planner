import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TripForm from '../components/TripForm';
import api from '../services/api';
import { AlertTriangle } from 'lucide-react';

export default function PlannerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePlanTrip = async (formData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.planTrip(formData);
      if (result && result.trip_id) {
        navigate(`/dashboard/${result.trip_id}`);
      } else {
        setErrorMsg('Unexpected server response format. Please try again.');
      }
    } catch (err) {
      console.error('Plan trip error:', err);
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to calculate trip.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm block">Trip Calculation Error</span>
            <p className="mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />
    </div>
  );
}
