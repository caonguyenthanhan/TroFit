import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Bảng màu thiết kế cao cấp cho các phòng
const ROOM_COLORS = [
  { stroke: '#6366f1', fill: '#6366f1', fillOpacity: 0.15 }, // Indigo
  { stroke: '#10b981', fill: '#10b981', fillOpacity: 0.15 }, // Emerald
  { stroke: '#f59e0b', fill: '#f59e0b', fillOpacity: 0.15 }, // Amber
  { stroke: '#ec4899', fill: '#ec4899', fillOpacity: 0.15 }, // Pink
  { stroke: '#06b6d4', fill: '#06b6d4', fillOpacity: 0.15 }  // Cyan
];

const axisKeys = {
  viTri: 'Vị trí',
  chiPhi: 'Chi phí',
  tienIch: 'Tiện ích',
  dienTich: 'Diện tích',
  camQuan: 'Cảm quan',
  doThoang: 'Độ thoáng'
};

export default function CompareChart({ selectedRooms }) {
  if (!selectedRooms || selectedRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 min-h-[300px]">
        <p className="text-slate-400 text-sm text-center">Hãy chọn ít nhất 1 phòng trọ bên dưới để vẽ biểu đồ so sánh.</p>
      </div>
    );
  }

  // Format dữ liệu cho Recharts RadarChart
  // Cấu trúc mong muốn: [{ subject: 'Vị trí', 'Phòng A': 8, 'Phòng B': 7 }, ...]
  const chartData = Object.entries(axisKeys).map(([key, label]) => {
    const dataPoint = { subject: label };
    selectedRooms.forEach((room) => {
      dataPoint[room.ten] = room.diemTheoTruc?.[key] || 0;
    });
    return dataPoint;
  });

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-slate-300 mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((p, index) => (
              <div key={index} className="flex items-center gap-4 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="text-slate-400 font-medium truncate max-w-[120px]">{p.name}:</span>
                <span className="font-bold text-slate-100 ml-auto">{p.value} đ</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 w-full h-[400px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b' }} axisLine={false} />
          
          {selectedRooms.map((room, index) => {
            const colorScheme = ROOM_COLORS[index % ROOM_COLORS.length];
            return (
              <Radar
                key={room.id}
                name={room.ten}
                dataKey={room.ten}
                stroke={colorScheme.stroke}
                fill={colorScheme.fill}
                fillOpacity={colorScheme.fillOpacity}
                strokeWidth={2}
              />
            );
          })}
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
