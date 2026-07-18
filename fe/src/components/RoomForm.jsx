import React, { useState, useEffect } from 'react';
import { PlusCircle, HelpCircle, Sparkles, Building, Landmark, Compass, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';
import { scoreRoom } from '../lib/scoring';
import TagSelect from './TagSelect';
import { getTags } from '../lib/tags';
import AddressPicker from './AddressPicker';
import { getTravelTime } from '../lib/directions';


const INITIAL_ROOM_STATE = {
  ten: '',
  diaChi: '',
  thoiGianDenCongTy: '',
  giaThue: '',
  chiPhiKhac: {
    dien: '',
    nuoc: '',
    xe: '',
    dichVu: '',
    wifi: ''
  },
  khongGianXungQuanh: 'binh_thuong',
  doRong: 'vua',
  dienTichM2: '',
  diemCamQuan: 3,
  ghiChuCamQuan: '',
  doThoang: {
    mayLanh: false,
    banCong: false,
    cuaSoTroi: false,
    cuaSo: false
  },
  tags: [], // Tiện ích chi tiết
  ngayXem: new Date().toISOString().split('T')[0]
};

export default function RoomForm({ config, profile, onSaveRoom, editingRoom, onCancelEdit }) {
  const [room, setRoom] = useState({ ...INITIAL_ROOM_STATE });

  useEffect(() => {
    if (editingRoom) {
      setRoom({
        ...INITIAL_ROOM_STATE,
        ...editingRoom,
        tags: editingRoom.tags || []
      });
    } else {
      setRoom({
        ...INITIAL_ROOM_STATE,
        ngayXem: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingRoom]);

  // Tự động tính thời gian di chuyển đi làm khi tọa độ phòng thay đổi
  useEffect(() => {
    const fetchTime = async () => {
      if (room.toaDo && profile?.toaDoCongTy) {
        const mode = profile.tinhChatCongViec === 'di_bo' ? 'walking' : 'driving';
        const minutes = await getTravelTime(room.toaDo, profile.toaDoCongTy, mode);
        if (minutes !== null) {
          handleChange('thoiGianDenCongTy', minutes);
        }
      }
    };
    fetchTime();
  }, [room.toaDo, profile?.toaDoCongTy, profile?.tinhChatCongViec]);

  const handleChange = (field, value) => {
    setRoom(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setRoom(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = (parent, field, checked) => {
    setRoom(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: checked
      }
    }));
  };

  const handleTagsChange = (newTags) => {
    setRoom(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  // Live scoring calculation (including 7th axis and profile matching)
  const scoredRoom = scoreRoom(room, config, profile);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room.ten.trim()) {
      alert('Vui lòng nhập tên hoặc ký hiệu phòng trọ!');
      return;
    }
    if (Number(room.giaThue) <= 0) {
      alert('Vui lòng nhập giá thuê phòng hợp lệ!');
      return;
    }

    const roomToSave = {
      ...scoredRoom,
      id: room.id || crypto.randomUUID()
    };
    onSaveRoom(roomToSave);
  };

  const getScoreColorClass = (score) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 5) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  const axisLabels = {
    viTri: 'Vị trí',
    chiPhi: 'Chi phí',
    tienIch: 'Tiện ích',
    dienTich: 'Diện tích',
    camQuan: 'Cảm quan',
    doThoang: 'Độ thoáng',
    phuHopCaNhan: 'Phù hợp cá nhân'
  };

  // Lấy danh sách tên hiển thị của các tag bắt buộc bị thiếu
  const allAvailableTags = getTags();
  const getTagName = (id) => allAvailableTags.find(t => t.id === id)?.label || id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cột 1 & 2: Form nhập dữ liệu */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 glass-panel p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Building className="text-indigo-400 w-6 h-6" />
            {editingRoom ? 'Cập Nhật Phòng Trọ' : 'Khảo Sát Phòng Mới'}
          </h2>
          {editingRoom && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        {/* Cảnh báo thiếu yêu cầu bắt buộc ngay trong Form */}
        {scoredRoom.thieuBatBuoc && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Cảnh báo thiếu yêu cầu bắt buộc:</span>
              <p>Phòng này hiện chưa đáp ứng các tiện nghi: <strong className="underline">{scoredRoom.danhSachThieuBatBuoc.map(getTagName).join(', ')}</strong>. Điểm "Phù hợp cá nhân" bị phạt nặng.</p>
            </div>
          </div>
        )}

        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Tên phòng / Ký hiệu *</label>
              <input
                type="text"
                value={room.ten}
                onChange={(e) => handleChange('ten', e.target.value)}
                className="glass-input"
                placeholder="VD: Trọ Nguyễn Văn A - Lầu 2"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Ngày xem phòng</label>
              <input
                type="date"
                value={room.ngayXem}
                onChange={(e) => handleChange('ngayXem', e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Địa chỉ</label>
              <input
                type="text"
                value={room.diaChi}
                onChange={(e) => handleChange('diaChi', e.target.value)}
                className="glass-input"
                placeholder="VD: 123/45 Huỳnh Tấn Phát, Quận 7, TP.HCM"
              />
            </div>
            <div className="md:col-span-2">
              <AddressPicker
                label="Vị trí tọa độ phòng trọ"
                address={room.diaChi}
                value={room.toaDo}
                onChange={(coords) => handleChange('toaDo', coords)}
              />
            </div>
          </div>
        </div>

        {/* Vị trí & Chi phí */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Landmark className="w-4 h-4" /> Vị trí & Chi phí
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                Thời gian đi làm / đi học (phút)
                <span className="group relative cursor-pointer text-slate-500">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                    Ước tính thời gian chạy xe/buýt đến văn phòng.
                  </span>
                </span>
              </label>
              <input
                type="number"
                value={room.thoiGianDenCongTy}
                onChange={(e) => handleChange('thoiGianDenCongTy', e.target.value)}
                className="glass-input"
                placeholder="VD: 20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Giá thuê gốc (VND/tháng) *</label>
              <input
                type="number"
                value={room.giaThue}
                onChange={(e) => handleChange('giaThue', e.target.value)}
                className="glass-input"
                placeholder="VD: 3500000"
                required
              />
            </div>

            {/* Chi phí khác */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-slate-400">Các khoản phí dịch vụ khác (VND/tháng hoặc đơn giá)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Điện (đ/kWh hoặc đ/tháng)</span>
                  <input
                    type="number"
                    value={room.chiPhiKhac.dien}
                    onChange={(e) => handleNestedChange('chiPhiKhac', 'dien', e.target.value)}
                    className="glass-input py-2 text-center text-xs"
                    placeholder="3500 hoặc 300k"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Nước (đ/m3 hoặc đ/tháng)</span>
                  <input
                    type="number"
                    value={room.chiPhiKhac.nuoc}
                    onChange={(e) => handleNestedChange('chiPhiKhac', 'nuoc', e.target.value)}
                    className="glass-input py-2 text-center text-xs"
                    placeholder="10000 hoặc 100k"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Gửi xe / xe máy</span>
                  <input
                    type="number"
                    value={room.chiPhiKhac.xe}
                    onChange={(e) => handleNestedChange('chiPhiKhac', 'xe', e.target.value)}
                    className="glass-input py-2 text-center text-xs"
                    placeholder="100000"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Dịch vụ chung</span>
                  <input
                    type="number"
                    value={room.chiPhiKhac.dichVu}
                    onChange={(e) => handleNestedChange('chiPhiKhac', 'dichVu', e.target.value)}
                    className="glass-input py-2 text-center text-xs"
                    placeholder="150000"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-500">Wifi / Internet</span>
                  <input
                    type="number"
                    value={room.chiPhiKhac.wifi}
                    onChange={(e) => handleNestedChange('chiPhiKhac', 'wifi', e.target.value)}
                    className="glass-input py-2 text-center text-xs"
                    placeholder="100000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Đặc điểm không gian */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Compass className="w-4 h-4" /> Môi trường & Diện tích
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Không gian & Tiện ích xung quanh</label>
              <div className="flex gap-2">
                {['khong_thuan_tien', 'binh_thuong', 'thuan_tien'].map((opt) => (
                  <label
                    key={opt}
                    className={`flex-1 text-center py-2.5 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                      room.khongGianXungQuanh === opt
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="khongGianXungQuanh"
                      value={opt}
                      checked={room.khongGianXungQuanh === opt}
                      onChange={() => handleChange('khongGianXungQuanh', opt)}
                      className="sr-only"
                    />
                    {opt === 'thuan_tien' && 'Thuận tiện'}
                    {opt === 'binh_thuong' && 'Bình thường'}
                    {opt === 'khong_thuan_tien' && 'Kém'}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Đo kích thước thô (hoặc diện tích)</label>
              <div className="flex gap-2">
                {['nho', 'vua', 'lon'].map((opt) => (
                  <label
                    key={opt}
                    className={`flex-1 text-center py-2.5 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                      room.doRong === opt
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="doRong"
                      value={opt}
                      checked={room.doRong === opt}
                      onChange={() => handleChange('doRong', opt)}
                      className="sr-only"
                    />
                    {opt === 'nho' && 'Nhỏ'}
                    {opt === 'vua' && 'Vừa'}
                    {opt === 'lon' && 'Rộng'}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Diện tích chính xác (m² - Không bắt buộc)</label>
              <input
                type="number"
                value={room.dienTichM2}
                onChange={(e) => handleChange('dienTichM2', e.target.value)}
                className="glass-input"
                placeholder="VD: 25"
              />
            </div>

            {/* Độ thoáng (Checkboxes) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">Độ thoáng & Thiết bị có sẵn</label>
              <div className="grid grid-cols-2 gap-3 bg-slate-950/30 p-3 rounded-xl border border-slate-900">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={room.doThoang.mayLanh}
                    onChange={(e) => handleCheckboxChange('doThoang', 'mayLanh', e.target.checked)}
                    className="glass-checkbox"
                  />
                  Có Máy lạnh / Điều hòa
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={room.doThoang.banCong}
                    onChange={(e) => handleCheckboxChange('doThoang', 'banCong', e.target.checked)}
                    className="glass-checkbox"
                  />
                  Có Ban công
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={room.doThoang.cuaSoTroi}
                    onChange={(e) => handleCheckboxChange('doThoang', 'cuaSoTroi', e.target.checked)}
                    className="glass-checkbox"
                  />
                  Có Giếng trời / Ô thoáng
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={room.doThoang.cuaSo}
                    onChange={(e) => handleCheckboxChange('doThoang', 'cuaSo', e.target.checked)}
                    className="glass-checkbox"
                  />
                  Có Cửa sổ ra ngoài
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tiện ích phòng trọ (TagSelect) */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Tiện nghi & Luật lệ phòng trọ
          </h3>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400">Chọn các đặc điểm tiện nghi có sẵn của phòng:</label>
            <TagSelect
              selectedTags={room.tags}
              onChange={handleTagsChange}
            />
          </div>
        </div>

        {/* Cảm quan thực tế */}
        <div className="space-y-4 pt-4 border-t border-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Cảm quan & Ghi chú
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Điểm cảm quan chung (Thang 1-5):</span>
                <span className="font-bold text-indigo-400">{room.diemCamQuan} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={room.diemCamQuan}
                onChange={(e) => handleChange('diemCamQuan', e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 px-1">
                <span>Rất tồi/ẩm thấp</span>
                <span>Bình thường</span>
                <span>Tuyệt vời/sáng sủa</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Ghi chú chi tiết</label>
              <textarea
                value={room.ghiChuCamQuan}
                onChange={(e) => handleChange('ghiChuCamQuan', e.target.value)}
                className="glass-input min-h-[80px] resize-none"
                placeholder="VD: Lối vào sáng sủa, bảo vệ 24/7, nhà vệ sinh sạch sẽ, chủ nhà thân thiện..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="gradient-btn w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white flex justify-center items-center gap-2 py-3 text-base shadow-indigo-600/20"
        >
          <PlusCircle className="w-5 h-5" />
          {editingRoom ? 'Cập Nhật Phòng Trọ' : 'Lưu Phòng Trọ'}
        </button>
      </form>

      {/* Cột 3: Live Preview Điểm (7 Trục) */}
      <div className="glass-panel p-6 flex flex-col justify-between h-fit lg:sticky lg:top-6 space-y-6 col-span-1">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
            <Sparkles className="text-indigo-400 w-5 h-5" />
            Live Preview Điểm
          </h2>
          
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl border mb-6 transition-all duration-300 shadow-inner min-h-[140px] text-center border-slate-800 bg-slate-950/20">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Điểm tổng ước tính</span>
            <span className={`text-5xl font-black font-sans my-2.5 ${getScoreColorClass(scoredRoom.diemTong).split(' ')[0]}`}>
              {scoredRoom.diemTong}
            </span>
            <div className="text-xs text-slate-500 max-w-[200px]">
              Điểm tổng trung bình có trọng số của 7 tiêu chí chấm điểm
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Điểm chi tiết (Thang 1-10)</h3>
            <div className="space-y-3">
              {Object.entries(scoredRoom.diemTheoTruc || {}).map(([key, val]) => {
                const percent = val * 10;
                let barColor = 'bg-rose-500';
                if (val >= 8) barColor = 'bg-emerald-500';
                else if (val >= 5) barColor = 'bg-amber-500';

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{axisLabels[key]}</span>
                      <span className="font-bold text-slate-100">{val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                      <div
                        className={`h-full ${barColor} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 space-y-2.5">
          <h4 className="text-xs font-bold text-indigo-400">Tóm tắt các chi phí ước tính:</h4>
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Giá thuê gốc:</span>
              <span className="font-medium text-slate-200">{(Number(room.giaThue) || 0).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span>Phụ phí hàng tháng:</span>
              <span className="font-medium text-slate-200">
                {(scoredRoom.tongChiPhiTho - (Number(room.giaThue) || 0)).toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-900 text-slate-300 font-bold">
              <span>Tổng chi phí trọn gói:</span>
              <span className="text-indigo-400">{(scoredRoom.tongChiPhiTho || 0).toLocaleString()}đ / tháng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
