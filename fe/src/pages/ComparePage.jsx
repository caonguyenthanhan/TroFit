import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  DollarSign, 
  Download, 
  Upload, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';
import CompareChart from '../components/CompareChart';
import CompareTable from '../components/CompareTable';
import PromptHelper from '../components/PromptHelper';
import { getRooms, getConfig, getProfile, deleteRoom, saveRoomsList, saveConfig, saveProfile } from '../lib/storage';
import { scoreRoom, analyzeSensitivity, calculateCommuteOpportunityCost } from '../lib/scoring';
import { checkBudgetExtensionConditions } from '../lib/budgetRules';

import MapView from '../components/MapView';


export default function ComparePage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [importMessage, setImportMessage] = useState({ text: '', type: '' });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tro-compare-view-mode') || 'radar');

  const handleToggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('tro-compare-view-mode', mode);
  };

  // Initial load
  useEffect(() => {
    const loadedConfig = getConfig();
    const loadedProfile = getProfile();
    const loadedRooms = getRooms();
    
    // Score all rooms based on current profile and configuration weights/thresholds
    const scoredRooms = loadedRooms.map(room => scoreRoom(room, loadedConfig, loadedProfile));
    
    setConfig(loadedConfig);
    setProfile(loadedProfile);
    setRooms(scoredRooms);
    
    // Auto-select first few rooms (up to 3) for comparison
    if (scoredRooms.length > 0) {
      setSelectedIds(scoredRooms.slice(0, 3).map(r => r.id));
    }
  }, []);

  const handleToggleCompare = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 5) {
          alert('Chỉ chọn tối đa 5 phòng để biểu đồ radar hiển thị rõ ràng nhất!');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/nhap/${id}`);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
      const updated = deleteRoom(id);
      if (updated) {
        setRooms(updated.map(r => scoreRoom(r, config, profile)));
        setSelectedIds(prev => prev.filter(item => item !== id));
      }
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({
        exportedAt: new Date().toISOString(),
        config,
        profile,
        danhSachPhong: getRooms()
      }, null, 2);
      
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `trofit-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting data', error);
      alert('Đã xảy ra lỗi khi xuất dữ liệu JSON.');
    }
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || typeof data !== 'object') {
          throw new Error('Dữ liệu không đúng định dạng JSON');
        }

        if (data.config) saveConfig(data.config);
        if (data.profile) saveProfile(data.profile);
        if (Array.isArray(data.danhSachPhong)) {
          saveRoomsList(data.danhSachPhong);
        } else if (Array.isArray(data)) {
          saveRoomsList(data);
        }

        // Reload data
        const loadedConfig = getConfig();
        const loadedProfile = getProfile();
        const loadedRooms = getRooms();
        const scoredRooms = loadedRooms.map(r => scoreRoom(r, loadedConfig, loadedProfile));

        setConfig(loadedConfig);
        setProfile(loadedProfile);
        setRooms(scoredRooms);
        
        if (scoredRooms.length > 0) {
          setSelectedIds(scoredRooms.slice(0, 3).map(r => r.id));
        }

        setImportMessage({ text: 'Nhập dữ liệu JSON thành công!', type: 'success' });
        setTimeout(() => setImportMessage({ text: '', type: '' }), 4000);
      } catch (error) {
        setImportMessage({ text: 'Tệp tin không đúng cấu trúc JSON của TroFit!', type: 'error' });
        setTimeout(() => setImportMessage({ text: '', type: '' }), 4000);
      }
    };
    fileReader.readAsText(file);
  };

  if (!config || !profile) return <div className="text-center p-12 text-slate-400">Đang tải trang so sánh...</div>;

  const totalRoomsCount = rooms.length;
  const selectedRoomsList = rooms.filter(r => selectedIds.includes(r.id));
  const bestRoom = rooms.length > 0 
    ? [...rooms].sort((a, b) => b.diemTong - a.diemTong)[0]
    : null;
  const avgRent = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + Number(r.giaThue || 0), 0) / rooms.length)
    : 0;

  // Hạn mức tài chính
  const targetBudget = profile.thuNhap 
    ? (Number(profile.thuNhap) * (profile.percentNganSach || 30) / 100)
    : config.nganSachGiaThue;

  const sensitivity = analyzeSensitivity(rooms, config, profile);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Import/Export buttons & stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 p-4 rounded-2xl border border-slate-900">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Bảng Điều Khiển So Sánh
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">So sánh đa tiêu chí và quản lý dữ liệu khảo sát</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <label className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-300 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-indigo-400" />
            Nhập JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleExport}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-300 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Xuất JSON
          </button>
        </div>
      </div>

      {importMessage.text && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${
          importMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {importMessage.text}
        </div>
      )}

      {/* Quick Statistics Banner */}
      {totalRoomsCount > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Đã khảo sát</div>
              <div className="text-xl font-black text-slate-100 mt-0.5">{totalRoomsCount} phòng</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phòng tốt nhất</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5 truncate max-w-[200px]" title={bestRoom.ten}>
                {bestRoom.ten} ({bestRoom.diemTong}đ)
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tiền thuê trung bình</div>
              <div className="text-xl font-black text-slate-100 mt-0.5">{avgRent.toLocaleString()}đ</div>
            </div>
          </div>
        </section>
      )}

      {/* Cảnh báo độ nhạy xếp hạng (Sensitivity Analysis) */}
      {totalRoomsCount > 1 && sensitivity.isSensitive && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4.5 h-4.5 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <span className="font-bold">⚠️ Độ nhạy xếp hạng cao:</span>
            <p>
              Nếu bạn thay đổi hoặc điều chỉnh độ ưu tiên (trọng số) các trục đi <strong>±10%</strong>, phòng tốt nhất có thể chuyển từ <strong className="text-slate-200">{bestRoom.ten}</strong> thành <strong className="text-slate-200">{sensitivity.changedBestRoomName}</strong>. Hãy cân nhắc kỹ bảng trọng số của bạn!
            </p>
          </div>
        </div>
      )}

      {totalRoomsCount === 0 ? (
        <div className="glass-panel p-12 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="p-4 bg-slate-950/50 border border-slate-900 text-slate-500 rounded-full">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-300">Chưa có phòng trọ nào</h3>
            <p className="text-slate-500 text-xs mt-1">Hãy bắt đầu bằng cách điền thông tin khảo sát phòng trọ bạn vừa đi xem.</p>
          </div>
          <button
            onClick={() => navigate('/nhap')}
            className="gradient-btn bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs mt-2 flex items-center gap-1.5"
          >
            Khảo sát phòng đầu tiên
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Radar Chart & Selector Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">
                    {viewMode === 'radar' ? 'Biểu Đồ Radar So Sánh 7 Trục' : 'Bản Đồ Vị Trí Phòng Trọ'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {viewMode === 'radar' 
                      ? 'Trực quan hóa điểm số chuẩn hóa của các phòng được chọn' 
                      : 'Hiển thị vị trí các phòng trọ so với công ty và vẽ đường nối đi lại'}
                  </p>
                </div>
                
                {/* Toggle buttons */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('radar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      viewMode === 'radar' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Radar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleViewMode('map')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      viewMode === 'map' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Bản đồ
                  </button>
                </div>
              </div>

              {viewMode === 'radar' ? (
                <CompareChart selectedRooms={selectedRoomsList} />
              ) : (
                <MapView 
                  companyCoords={profile?.toaDoCongTy} 
                  companyAddress={profile?.diaChiCongTy} 
                  rooms={selectedRoomsList} 
                />
              )}
            </div>

            {/* Selector list */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-3">
                Chọn phòng trọ muốn so sánh:
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {rooms.map((room) => {
                  const isChecked = selectedIds.includes(room.id);
                  const isOverBudget = room.tongChiPhiTho > targetBudget;
                  return (
                    <div
                      key={room.id}
                      onClick={() => handleToggleCompare(room.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-indigo-500/80 bg-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="glass-checkbox pointer-events-none"
                        />
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-100 max-w-[140px] truncate" title={room.ten}>
                            {room.ten}
                          </h4>
                          <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-0.5">
                            <span className={`font-semibold ${isOverBudget ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                              {room.tongChiPhiTho.toLocaleString()}đ
                            </span>
                            {room.thoiGianDenCongTy && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {room.thoiGianDenCongTy}'
                              </span>
                            )}
                          </div>
                          {room.thoiGianDenCongTy && profile?.thuNhap > 0 && (
                            <div className="text-[9px] text-slate-500 mt-1 font-semibold">
                              CP thời gian: ≈ {calculateCommuteOpportunityCost(room.thoiGianDenCongTy, profile.thuNhap).toLocaleString()}đ
                            </div>
                          )}
                          {/* Badges warning */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {room.thieuBatBuoc && (
                              <span className="text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded">
                                Thiếu bắt buộc
                              </span>
                            )}
                            {isOverBudget && (
                              <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.5 rounded">
                                Vượt ngân sách
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/15">
                          {room.diemTong}đ
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(room.id); }}
                          className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-all"
                          title="Sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(room.id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-500 bg-slate-950/30 p-3 rounded-lg border border-slate-900 leading-relaxed">
                💡 Tích chọn để đưa vào biểu đồ so sánh tối đa 5 phòng. Nhấp nút bút chì để chỉnh sửa thông số.
              </div>
            </div>
          </section>

          {/* Detailed table comparison */}
          {selectedIds.length > 0 && (
            <section className="space-y-4">
              <CompareTable selectedRooms={selectedRoomsList} profile={profile} />
            </section>
          )}

          {/* AI prompt and tips helper */}
          <section className="pt-4">
            <PromptHelper selectedRooms={selectedRoomsList} config={config} />
          </section>
        </>
      )}
    </div>
  );
}
