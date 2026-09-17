import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper component to auto-fit bounds
function FitBounds({ coordinates, stops }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (coordinates && coordinates.length > 0) {
      coordinates.forEach(c => points.push([c[0], c[1]]));
    }
    if (stops && stops.length > 0) {
      stops.forEach(s => {
        if (s.latitude && s.longitude) points.push([s.latitude, s.longitude]);
      });
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coordinates, stops, map]);

  return null;
}

// Custom DivIcons for distinct stops
const createStopIcon = (type, label) => {
  let bgColor = "#2563eb"; // default blue
  let iconSymbol = "📍";

  if (type === "ORIGIN") {
    bgColor = "#1e40af";
    iconSymbol = "🚩";
  } else if (type === "PICKUP") {
    bgColor = "#059669";
    iconSymbol = "📦";
  } else if (type === "DROPOFF") {
    bgColor = "#dc2626";
    iconSymbol = "🏁";
  } else if (type === "FUEL") {
    bgColor = "#d97706";
    iconSymbol = "⛽";
  } else if (type === "REST") {
    bgColor = "#7c3aed";
    iconSymbol = "🛏️";
  } else if (type === "BREAK") {
    bgColor = "#475569";
    iconSymbol = "☕";
  }

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: bold;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        ${iconSymbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function MapComponent({ routeGeometry, stops = [], summary }) {
  const coordinates = routeGeometry?.coordinates || [];
  
  // Default center if empty: Center of US
  const defaultCenter = [39.8283, -98.5795];
  const defaultZoom = 4;

  const validStops = stops.filter(s => s.latitude && s.longitude);

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden shadow-md border border-slate-200 relative">
      <MapContainer
        center={coordinates.length > 0 ? [coordinates[0][0], coordinates[0][1]] : defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {coordinates.length > 1 && (
          <Polyline
            positions={coordinates}
            pathOptions={{
              color: '#2563eb',
              weight: 5,
              opacity: 0.85,
              lineJoin: 'round'
            }}
          />
        )}

        {/* Stop Markers */}
        {validStops.map((stop, idx) => (
          <Marker
            key={stop.stop_id || idx}
            position={[stop.latitude, stop.longitude]}
            icon={createStopIcon(stop.stop_type, idx + 1)}
          >
            <Popup className="font-sans">
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                    stop.stop_type === 'PICKUP' ? 'bg-emerald-600' :
                    stop.stop_type === 'DROPOFF' ? 'bg-red-600' :
                    stop.stop_type === 'FUEL' ? 'bg-amber-600' :
                    stop.stop_type === 'REST' ? 'bg-purple-600' :
                    stop.stop_type === 'BREAK' ? 'bg-slate-600' : 'bg-blue-600'
                  }`}>
                    {stop.stop_type}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Mile {stop.cumulative_miles || 0}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{stop.location_name}</h4>
                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                  <div><strong>Arrival:</strong> {stop.arrival_time?.replace('T', ' ') || 'N/A'}</div>
                  <div><strong>Departure:</strong> {stop.departure_time?.replace('T', ' ') || 'N/A'}</div>
                  {stop.duration_hours > 0 && (
                    <div><strong>Duration:</strong> {stop.duration_hours} hrs</div>
                  )}
                  {stop.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-1">{stop.notes}</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds coordinates={coordinates} stops={validStops} />
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-slate-200 text-xs font-medium z-[400] flex flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block"></span>
          <span>Origin</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
          <span>Fuel Stop</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
          <span>10-Hr Rest</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
          <span>30-Min Break</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
          <span>Drop-off</span>
        </div>
      </div>
    </div>
  );
}
