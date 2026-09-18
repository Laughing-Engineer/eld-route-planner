import axios from 'axios';

// Vite injects the production API URL at build time.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://eld-route-planner-api-fga1.onrender.com/api'
).replace(/\/+$/, '');

export const getApiBaseUrl = () => API_BASE_URL;

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  getApiBaseUrl,
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
