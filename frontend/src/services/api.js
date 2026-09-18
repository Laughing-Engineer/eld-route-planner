import axios from 'axios';

// Default base URL from build-time Vite env or fallback to localhost:8000
const DEFAULT_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  try {
    const custom = localStorage.getItem('eld_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    // localStorage might be unavailable in some sandboxes
  }
  return DEFAULT_API_BASE_URL;
};

export const setCustomApiUrl = (url) => {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem('eld_api_url');
    } else {
      localStorage.setItem('eld_api_url', url.trim().replace(/\/+$/, ''));
    }
  } catch (e) {}
};

export const resetApiUrl = () => {
  try {
    localStorage.removeItem('eld_api_url');
  } catch (e) {}
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Dynamically use active base URL for every request
apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export const api = {
  getApiBaseUrl,
  setCustomApiUrl,
  resetApiUrl,
  // Plan new trip
  planTrip: async (payload) => {
    const response = await apiClient.post('/trips/plan/', payload);
    return response.data;
  },

  // List trips
  getTrips: async (search = '') => {
    const response = await apiClient.get('/trips/', {
      params: search ? { search } : {},
    });
    return response.data;
  },

  // Get trip by ID
  getTripById: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/`);
    return response.data;
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    const response = await apiClient.delete(`/trips/${tripId}/`);
    return response.data;
  },

  // Get route geometry
  getTripRoute: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/route/`);
    return response.data;
  },

  // Get schedule
  getTripSchedule: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/schedule/`);
    return response.data;
  },

  // Get logs
  getTripLogs: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/logs/`);
    return response.data;
  },

  // Geocode address
  geocode: async (query) => {
    const response = await apiClient.post('/geocode/', { query });
    return response.data;
  },

  // Location suggestions autocomplete
  getLocationSuggestions: async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await apiClient.get('/locations/suggest/', {
        params: { q: query.trim() },
      });
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch location suggestions:', err);
      return [];
    }
  },

  // System Health
  getHealth: async () => {
    const response = await apiClient.get('/health/');
    return response.data;
  },
};

export default api;
