import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Navigation, AlertTriangle, Check } from 'lucide-react';
import { geocodeAddress, getApiUsage } from '../lib/geocoding';

// Trung tâm TP.HCM mặc định
const HCMC_CENTER = { lat: 10.762622, lng: 106.660172 };

// Custom icon hình tròn màu indigo cho ghim kéo thả
const createMarkerIcon = (color = '#6366f1') => {
  return L.divIcon({
    className: 'custom-pin-icon',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.4); animation: pulse 2s infinite;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

// Component helper để di chuyển bản đồ tới tọa độ mới
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.setView([coords.lat, coords.lng], 15);
    }
  }, [coords, map]);
  return null;
}

export default function AddressPicker({ label, address, value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [usage, setUsage] = useState({ count: 0 });
  const markerRef = useRef(null);

  useEffect(() => {
    setUsage(getApiUsage());
  }, [loading]);

  const handleLocate = async () => {
    if (!address || !address.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ trước khi định vị!');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        onChange(coords);
        setSuccessMsg('Định vị thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg('Không tìm thấy tọa độ. Hãy tự ghim thủ công trên bản đồ.');
      }
    } catch (e) {
      setErrorMsg('Lỗi khi tìm tọa độ. Hãy tự ghim thủ công.');
    } finally {
      setLoading(false);
    }
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChange({
            lat: latLng.lat,
            lng: latLng.lng
          });
        }
      },
    }),
    [onChange]
  );

  const currentCoords = value && value.lat && value.lng ? value : HCMC_CENTER;
  const markerIcon = useMemo(() => createMarkerIcon('#6366f1'), []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          {label}
        </label>
        
        <button
          type="button"
          onClick={handleLocate}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin w-3 h-3 border border-t-transparent border-indigo-400 rounded-full mr-1"></span>
          ) : (
            <Navigation className="w-3 h-3" />
          )}
          Tự động định vị
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 animate-fade-in">
          <AlertTriangle className="w-3.5 h-3.5" />
          {errorMsg}
        </div>
      )}

      {/* Bản đồ mini */}
      <div className="relative h-[200px] w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner z-0">
        <MapContainer 
          center={[currentCoords.lat, currentCoords.lng]} 
          zoom={value ? 15 : 11} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#020617' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark map tiles
          />
          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[currentCoords.lat, currentCoords.lng]}
            ref={markerRef}
            icon={markerIcon}
          />
          <MapRecenter coords={value} />
        </MapContainer>
        
        {/* API Usage display */}
        {usage.count > 0 && (
          <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-[9px] text-slate-400 pointer-events-none">
            Mapbox calls: {usage.count} / 100k
          </div>
        )}
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        * Nhấp chọn "Tự động định vị" để tìm ghim theo địa chỉ trên, hoặc **kéo thả dấu chấm xanh** trên bản đồ để tự điều chỉnh tọa độ chính xác nhất.
      </p>
    </div>
  );
}
