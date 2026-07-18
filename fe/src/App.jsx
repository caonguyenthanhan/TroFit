import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Settings2, 
  BarChart3, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Layers, 
  Building,
  HelpCircle,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import RoomForm from './components/RoomForm';
import CompareChart from './components/CompareChart';
import CompareTable from './components/CompareTable';
import ConfigSettings from './components/ConfigSettings';
import PromptHelper from './components/PromptHelper';
import { 
  getRooms, 
  getConfig, 
  saveRoom, 
  deleteRoom as removeRoomFromStorage, 
  saveConfig as saveConfigToStorage,
  importData, 
  exportData 
} from './lib/storage';
import { scoreRoom } from './lib/scoring';

export default function App() {
  const [activeTab, setActiveTab] = useState('survey'); // 'survey' | 'compare' | 'settings'
  const [rooms, setRooms] = useState([]);
  const [config, setConfig] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [importMessage, setImportMessage] = useState({ text: '', type: '' });

  // Initial load
  useEffect(() => {
    const loadedConfig = getConfig();
    const loadedRooms = getRooms();
    
    // Re-score all rooms based on current config weights/thresholds
    const scoredRooms = loadedRooms.map(room => scoreRoom(room, loadedConfig));
    
    setConfig(loadedConfig);
    setRooms(scoredRooms);
    
    // Auto-select first few rooms (up to 3) for comparison
    if (scoredRooms.length > 0) {
      setSelectedRoomIds(scoredRooms.slice(0, 3).map(r => r.id));
    }
  }, []);

  const handleSaveRoom = (roomData) => {
    const updatedRooms = saveRoom(roomData);
    if (updatedRooms) {
      // Re-score all rooms just to keep consistency
      const scored = updatedRooms.map(r => scoreRoom(r, config));
      setRooms(scored);
      setEditingRoom(null);
      
      // Auto-select the room if it's new
      if (!selectedRoomIds.includes(roomData.id) && selectedRoomIds.length < 5) {
        setSelectedRoomIds(prev => [...prev, roomData.id]);
      }
      
      // Navigate to comparison to see it
      setActiveTab('compare');
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setActiveTab('survey');
  };

  const handleDeleteRoom = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
      const updated = removeRoomFromStorage(id);
      if (updated) {
        setRooms(updated.map(r => scoreRoom(r, config)));
        setSelectedRoomIds(prev => prev.filter(item => item !== id));
      }
    }
  };

  const handleSaveConfig = (newConfig) => {
    const success = saveConfigToStorage(newConfig);
    if (success) {
      setConfig(newConfig);
      // Re-calculate scores for all rooms with the new configuration
      const updatedRooms = rooms.map(room => scoreRoom(room, newConfig));
      setRooms(updatedRooms);
    }
  };

  const handleCheckboxToggle = (id) => {
    setSelectedRoomIds(prev => {
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

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(exportData(), null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `troscorer-data-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting data', error);
      alert('Đã xảy ra lỗi khi xuất dữ liệu JSON.');
    }
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        const success = importData(parsedData);
        if (success) {
          // Reload
          const loadedConfig = getConfig();
          const loadedRooms = getRooms();
          const scoredRooms = loadedRooms.map(room => scoreRoom(room, loadedConfig));
          
          setConfig(loadedConfig);
          setRooms(scoredRooms);
          
          if (scoredRooms.length > 0) {
            setSelectedRoomIds(scoredRooms.slice(0, 3).map(r => r.id));
          }
          
          setImportMessage({ text: 'Nhập dữ liệu JSON thành công!', type: 'success' });
          setTimeout(() => setImportMessage({ text: '', type: '' }), 4000);
        }
      } catch (error) {
        setImportMessage({ text: 'Tệp tin không đúng cấu trúc JSON của TroFit!', type: 'error' });
        setTimeout(() => setImportMessage({ text: '', type: '' }), 4000);
      }
    };
    fileReader.readAsText(file);
  };

  // Stats calculation
  const totalRoomsCount = rooms.length;
  const bestRoom = rooms.length > 0 
    ? [...rooms].sort((a, b) => b.diemTong - a.diemTong)[0]
    : null;
  const avgRent = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + Number(r.giaThue || 0), 0) / rooms.length)
    : 0;

  const selectedRoomsList = rooms.filter(r => selectedRoomIds.includes(r.id));

  if (!config) return <div className="text-center p-12 text-slate-400">Đang tải cấu hình...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Banner */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🏠</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Tro<span className="gradient-text bg-gradient-to-r from-indigo-400 to-violet-400">Fit</span>
            </h1>
            <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Bản MVP
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-2xl">
            Tìm phòng trọ khớp với bạn, không chỉ khớp với ví tiền. Cá nhân hóa việc chấm điểm và so sánh phòng trọ bằng dữ liệu khoa học.
          </p>
        </div>

        {/* Nút Import/Export dữ liệu */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold cursor-pointer transition-all">
            <Upload className="w-4 h-4 text-indigo-400" />
            Nhập JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-slate-200 hover:border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Xuất JSON
          </button>
        </div>
      </header>

      {/* Thông báo nhập dữ liệu */}
      {importMessage.text && (
        <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
          importMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {importMessage.text}
        </div>
      )}

      {/* Quick Stats Panel */}
      {totalRoomsCount > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phòng đã khảo sát</div>
              <div className="text-2xl font-black text-slate-100 mt-0.5">{totalRoomsCount} phòng</div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phòng tốt nhất</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5 truncate max-w-[200px]" title={bestRoom.ten}>
                {bestRoom.ten} ({bestRoom.diemTong}đ)
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Giá thuê trung bình</div>
              <div className="text-2xl font-black text-slate-100 mt-0.5">{avgRent.toLocaleString()}đ</div>
            </div>
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <nav className="flex border-b border-slate-900 gap-1.5 mb-8 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('survey'); setEditingRoom(null); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'survey'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/25'
          }`}
        >
          <Building className="w-4 h-4" />
          {editingRoom ? 'Sửa thông tin phòng' : 'Khảo sát phòng mới'}
        </button>

        <button
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'compare'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/25'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Danh sách & So sánh
          {rooms.length > 0 && (
            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/35 font-bold">
              {rooms.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/25'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Trọng số & Tư vấn AI
        </button>
      </nav>

      {/* Main Tab Panels */}
      <main>
        {/* Tab 1: Khảo sát phòng */}
        {activeTab === 'survey' && (
          <div className="animate-fade-in">
            <RoomForm 
              config={config} 
              onSaveRoom={handleSaveRoom} 
              editingRoom={editingRoom}
              onCancelEdit={() => setEditingRoom(null)}
            />
          </div>
        )}

        {/* Tab 2: Danh sách & So sánh */}
        {activeTab === 'compare' && (
          <div className="space-y-8 animate-fade-in">
            {totalRoomsCount === 0 ? (
              <div className="glass-panel p-12 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-950/50 border border-slate-900 text-slate-500 rounded-full">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-300">Chưa có phòng trọ nào</h3>
                  <p className="text-slate-500 text-xs mt-1">Vui lòng quay lại tab "Khảo sát phòng mới" để ghi nhận thông tin phòng trọ bạn đã xem.</p>
                </div>
                <button
                  onClick={() => setActiveTab('survey')}
                  className="gradient-btn bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs mt-2"
                >
                  Khảo sát phòng đầu tiên
                </button>
              </div>
            ) : (
              <>
                {/* Section 1: Dashboard Biểu đồ Radar */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cột 1 & 2: Biểu đồ Radar */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <h3 className="text-lg font-bold">Biểu Đồ Radar So Sánh</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Hiển thị trực quan điểm mạnh/yếu của các phòng trọ (Tối đa 5 phòng)</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Đang chọn: {selectedRoomIds.length} / 5 phòng
                      </span>
                    </div>

                    <CompareChart selectedRooms={selectedRoomsList} />
                  </div>

                  {/* Cột 3: Danh sách check-box chọn phòng để vẽ Radar */}
                  <div className="glass-panel p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-200 border-b border-slate-900 pb-3">
                      Chọn phòng muốn đối chiếu:
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {rooms.map((room) => {
                        const isChecked = selectedRoomIds.includes(room.id);
                        return (
                          <div
                            key={room.id}
                            onClick={() => handleCheckboxToggle(room.id)}
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
                                onChange={() => {}} // Handle on parent div click
                                className="glass-checkbox pointer-events-none"
                              />
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-slate-100 max-w-[140px] truncate" title={room.ten}>
                                  {room.ten}
                                </h4>
                                <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                                    {(Number(room.giaThue) || 0).toLocaleString()}đ
                                  </span>
                                  {room.thoiGianDenCongTy && (
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5" />
                                      {room.thoiGianDenCongTy}'
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/15">
                                {room.diemTong}đ
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }}
                                className="p-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition-all"
                                title="Sửa"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteRoom(room.id, e)}
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
                      💡 Click vào các thẻ phòng để thêm/bớt khỏi biểu đồ so sánh. Nhấp icon bút chì để sửa thông số khảo sát.
                    </div>
                  </div>
                </section>

                {/* Section 2: Bảng so sánh số liệu thô */}
                {selectedRoomIds.length > 0 && (
                  <section className="animate-fade-in">
                    <CompareTable selectedRooms={selectedRoomsList} />
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Cài đặt và AI */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            {/* Cấu hình chấm điểm */}
            <ConfigSettings config={config} onSaveConfig={handleSaveConfig} />

            {/* Hỗ trợ AI */}
            <PromptHelper selectedRooms={selectedRoomsList} config={config} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-xs text-slate-600">
        TroFit 🏠 - Tìm phòng trọ khớp với bạn, không chỉ khớp với ví tiền • Built for speed, offline-first.
      </footer>
    </div>
  );
}
