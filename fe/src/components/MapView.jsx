import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getScoreColorHex } from '../lib/colorScale';

// HCMC mặc định
const DEFAULT_CENTER = [10.762622, 106.660172];

// Custom Icon cho Công ty (icon tòa nhà văn phòng)
const createCompanyIcon = () => {
  return L.divIcon({
    className: 'company-pin-icon',
    html: `
      <div style="background-color: #8b5cf6; width: 34px; height: 34px; border: 2px solid white; border-radius: 12px; box-shadow: 0 0 12px rgba(139,92,246,0.6); display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
          <path d="M10 6h4"/>
          <path d="M10 10h4"/>
          <path d="M10 14h4"/>
          <path d="M10 18h4"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

// Custom Icon hiển thị điểm tổng số phòng trọ bên trong hình tròn màu điểm
const createRoomIcon = (score) => {
  const color = getScoreColorHex(score);
  return L.divIcon({
    className: 'room-pin-icon',
    html: `
      <div style="background-color: ${color}; color: #ffffff; font-weight: 800; font-family: Outfit, sans-serif; font-size: 11px; width: 28px; height: 28px; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; transform: scale(1); transition: transform 0.2s;">
        ${Number(score).toFixed(1)}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Tự động căn chỉnh bounds bản đồ chứa tất cả markers
function MapFitBounds({ companyCoords, rooms }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    
    if (companyCoords && companyCoords.lat && companyCoords.lng) {
      points.push([companyCoords.lat, companyCoords.lng]);
    }
    
    rooms.forEach(r => {
      if (r.toaDo && r.toaDo.lat && r.toaDo.lng) {
        points.push([r.toaDo.lat, r.toaDo.lng]);
      }
    });

    if (points.length > 0) {
      // Nếu chỉ có 1 điểm, center và zoom 15
      if (points.length === 1) {
        map.setView(points[0], 15);
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [companyCoords, rooms, map]);

  return null;
}

export default function MapView({ companyCoords, companyAddress, rooms }) {
  const selectedRoomsWithCoords = useMemo(() => {
    return rooms.filter(r => r.toaDo && r.toaDo.lat && r.toaDo.lng);
  }, [rooms]);

  const hasCompany = companyCoords && companyCoords.lat && companyCoords.lng;
  const companyIcon = useMemo(() => createCompanyIcon(), []);

  // Tính tọa độ trung tâm
  const centerCoords = useMemo(() => {
    if (hasCompany) return [companyCoords.lat, companyCoords.lng];
    if (selectedRoomsWithCoords.length > 0) {
      return [selectedRoomsWithCoords[0].toaDo.lat, selectedRoomsWithCoords[0].toaDo.lng];
    }
    return DEFAULT_CENTER;
  }, [hasCompany, companyCoords, selectedRoomsWithCoords]);

  return (
    <div className="glass-panel p-4 w-full h-[450px] relative overflow-hidden z-0">
      <MapContainer
        center={centerCoords}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '12px', background: '#020617' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark theme map tiles
        />

        {/* Marker Công ty */}
        {hasCompany && (
          <Marker position={[companyCoords.lat, companyCoords.lng]} icon={companyIcon}>
            <Popup>
              <div className="text-slate-900 font-sans p-1">
                <div className="font-bold text-xs">💼 Vị trí công ty</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{companyAddress || 'Địa chỉ làm việc'}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Markers cho các phòng trọ & Polylines kết nối */}
        {selectedRoomsWithCoords.map((room) => {
          const roomLatLng = [room.toaDo.lat, room.toaDo.lng];
          const roomIcon = createRoomIcon(room.diemTong);
          const scoreColor = getScoreColorHex(room.diemTong);

          return (
            <React.Fragment key={room.id}>
              {/* Ghim phòng trọ */}
              <Marker position={roomLatLng} icon={roomIcon}>
                <Popup>
                  <div className="text-slate-900 font-sans p-1 space-y-1">
                    <div className="font-bold text-xs text-indigo-600">{room.ten}</div>
                    <div className="text-[11px] font-bold text-slate-800">
                      Giá thuê: {(Number(room.giaThue) || 0).toLocaleString()}đ
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tổng chi phí: {(room.tongChiPhiTho || 0).toLocaleString()}đ
                    </div>
                    {room.thoiGianDenCongTy && (
                      <div className="text-[10px] text-slate-600 font-medium">
                        Đi làm: {room.thoiGianDenCongTy} phút
                      </div>
                    )}
                    <div className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold mt-1 text-center">
                      Điểm tổng: {room.diemTong} / 10đ
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Đường nối nét đứt (Polyline) tới công ty */}
              {hasCompany && (
                <Polyline
                  positions={[[companyCoords.lat, companyCoords.lng], roomLatLng]}
                  pathOptions={{
                    color: scoreColor,
                    weight: 2,
                    dashArray: '6, 6',
                    opacity: 0.6
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Fit Bounds */}
        <MapFitBounds companyCoords={companyCoords} rooms={selectedRoomsWithCoords} />
      </MapContainer>
    </div>
  );
}
