import React from 'react';
import { Calendar, MapPin, Check, X, ShieldAlert } from 'lucide-react';

export default function CompareTable({ selectedRooms }) {
  if (!selectedRooms || selectedRooms.length === 0) {
    return null;
  }

  const formatCost = (val) => {
    if (val === undefined || val === null || val === '') return '-';
    return `${Number(val).toLocaleString()}đ`;
  };

  const formatElectricWater = (val, type) => {
    if (!val) return '-';
    const num = Number(val);
    if (num < 10000) {
      return type === 'dien' ? `${num.toLocaleString()}đ/kWh` : `${num.toLocaleString()}đ/khối`;
    }
    return `${num.toLocaleString()}đ/tháng`;
  };

  const getYesNoIcon = (val) => {
    return val ? (
      <span className="inline-flex items-center text-emerald-400 font-semibold gap-1">
        <Check className="w-4 h-4" /> Có
      </span>
    ) : (
      <span className="inline-flex items-center text-slate-600 gap-1">
        <X className="w-4 h-4" /> Không
      </span>
    );
  };

  const getAmbianceLabel = (val) => {
    if (val === 'thuan_tien') return 'Rất thuận tiện';
    if (val === 'binh_thuong') return 'Bình thường';
    if (val === 'khong_thuan_tien') return 'Kém/Khó khăn';
    return '-';
  };

  const getSizeLabel = (val) => {
    if (val === 'lon') return 'Rộng rãi';
    if (val === 'vua') return 'Vừa vặn';
    if (val === 'nho') return 'Hơi nhỏ';
    return '-';
  };

  return (
    <div className="glass-panel p-6 overflow-hidden space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-100">Bảng So Sánh Số Liệu Thô</h3>
        <p className="text-slate-400 text-xs mt-0.5">Đối chiếu trực quan từng thông số chi tiết đã ghi chép</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="p-3 text-slate-400 font-semibold min-w-[150px]">Tiêu chí / Thông số</th>
              {selectedRooms.map((room) => (
                <th key={room.id} className="p-3 font-extrabold text-indigo-400 min-w-[180px] max-w-[240px] truncate">
                  {room.ten}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60">
            {/* Điểm tổng */}
            <tr className="bg-indigo-500/5 font-semibold text-slate-200">
              <td className="p-3">Điểm tổng (Tổng hợp)</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3">
                  <span className="text-sm font-black text-indigo-300">{room.diemTong} / 10</span>
                </td>
              ))}
            </tr>

            {/* Giá thuê */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Giá thuê (tháng)</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 font-semibold text-emerald-400">
                  {formatCost(room.giaThue)}
                </td>
              ))}
            </tr>

            {/* Ước tính trọn gói */}
            <tr className="hover:bg-slate-900/20 bg-emerald-500/5">
              <td className="p-3 text-slate-300 font-medium">Tổng chi phí (Trọn gói)</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 font-extrabold text-emerald-300">
                  {formatCost(room.tongChiPhiTho)}
                </td>
              ))}
            </tr>

            {/* Phụ phí chi tiết */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400 pl-6">- Tiền Điện</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {formatElectricWater(room.chiPhiKhac?.dien, 'dien')}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400 pl-6">- Tiền Nước</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {formatElectricWater(room.chiPhiKhac?.nuoc, 'nuoc')}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400 pl-6">- Gửi xe máy</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {formatCost(room.chiPhiKhac?.xe)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400 pl-6">- Dịch vụ chung</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {formatCost(room.chiPhiKhac?.dichVu)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400 pl-6">- Internet / Wifi</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {formatCost(room.chiPhiKhac?.wifi)}
                </td>
              ))}
            </tr>

            {/* Đi làm */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Thời gian đi làm</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300 font-medium">
                  {room.thoiGianDenCongTy ? `${room.thoiGianDenCongTy} phút` : '-'}
                </td>
              ))}
            </tr>

            {/* Ti tiện ích */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Tiện ích xung quanh</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {getAmbianceLabel(room.khongGianXungQuanh)}
                </td>
              ))}
            </tr>

            {/* Diện tích */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Diện tích phòng</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-slate-300">
                  {room.dienTichM2 ? `${room.dienTichM2} m²` : getSizeLabel(room.doRong)}
                </td>
              ))}
            </tr>

            {/* Thiết bị & Độ thoáng */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Có Máy lạnh</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3">
                  {getYesNoIcon(room.doThoang?.mayLanh)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Có Ban công</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3">
                  {getYesNoIcon(room.doThoang?.banCong)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Có Cửa sổ ra ngoài</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3">
                  {getYesNoIcon(room.doThoang?.cuaSo)}
                </td>
              ))}
            </tr>

            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Có Giếng trời</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3">
                  {getYesNoIcon(room.doThoang?.cuaSoTroi)}
                </td>
              ))}
            </tr>

            {/* Cảm quan & Ghi chú */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Ghi chú & Đánh giá</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-xs text-slate-300 max-w-[240px] whitespace-pre-line leading-relaxed">
                  <div className="font-semibold text-indigo-300 mb-1">
                    Cảm quan: {room.diemCamQuan} / 5
                  </div>
                  {room.ghiChuCamQuan || <span className="text-slate-500 italic">Không có ghi chú</span>}
                </td>
              ))}
            </tr>

            {/* Ngày xem */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Ngày khảo sát</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-xs text-slate-400 font-medium">
                  {room.ngayXem}
                </td>
              ))}
            </tr>

            {/* Địa chỉ */}
            <tr className="hover:bg-slate-900/20">
              <td className="p-3 text-slate-400">Địa chỉ cụ thể</td>
              {selectedRooms.map((room) => (
                <td key={room.id} className="p-3 text-xs text-slate-400 max-w-[240px] truncate" title={room.diaChi}>
                  {room.diaChi || '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
