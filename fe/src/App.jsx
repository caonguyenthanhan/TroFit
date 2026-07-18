import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Settings2, 
  BarChart3, 
  User, 
  Building,
  DollarSign
} from 'lucide-react';

import ProfilePage from './pages/ProfilePage';
import RoomFormPage from './pages/RoomFormPage';
import ComparePage from './pages/ComparePage';
import ConfigSettings from './components/ConfigSettings';

import { 
  getRooms, 
  getConfig, 
  getProfile,
  saveConfig as saveConfigToStorage
} from './lib/storage';
import { scoreRoom } from './lib/scoring';
import { getSupabaseClient } from './lib/supabase';


export default function App() {
  const [config, setConfig] = useState(null);
  const [profile, setProfile] = useState(null);
  const [rooms, setRooms] = useState([]);

  const [cloudUser, setCloudUser] = useState(null);

  // Initial load of global settings
  useEffect(() => {
    const loadedConfig = getConfig();
    const loadedProfile = getProfile();
    const loadedRooms = getRooms();

    setConfig(loadedConfig);
    setProfile(loadedProfile);
    setRooms(loadedRooms.map(r => scoreRoom(r, loadedConfig, loadedProfile)));

    let subscription = null;
    
    const setupListener = () => {
      const supabase = getSupabaseClient();
      if (supabase && !subscription) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setCloudUser(session?.user || null);
        });
        
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          setCloudUser(session?.user || null);
          // Reload local cached data
          const currentConfig = getConfig();
          const currentProfile = getProfile();
          const currentRooms = getRooms();
          setConfig(currentConfig);
          setProfile(currentProfile);
          setRooms(currentRooms.map(r => scoreRoom(r, currentConfig, currentProfile)));
        });
        subscription = data.subscription;
      }
    };

    setupListener();
    const interval = setInterval(setupListener, 1500); // Check for config update periodically

    return () => {
      clearInterval(interval);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSaveConfig = (newConfig) => {
    const success = saveConfigToStorage(newConfig);
    if (success) {
      setConfig(newConfig);
      // Reload rooms with new config
      const loadedRooms = getRooms();
      const loadedProfile = getProfile();
      setRooms(loadedRooms.map(r => scoreRoom(r, newConfig, loadedProfile)));
    }
  };

  // Helper route to redirect based on localStorage status
  const RedirectRoute = () => {
    const loadedRooms = getRooms();
    const loadedProfile = getProfile();
    
    if (loadedRooms.length > 0) {
      return <Navigate to="/so-sanh" replace />;
    }
    if (loadedProfile.thuNhap) {
      return <Navigate to="/nhap" replace />;
    }
    return <Navigate to="/ho-so" replace />;
  };

  if (!config) return <div className="text-center p-12 text-slate-400">Đang tải cấu hình...</div>;

  const totalRoomsCount = rooms.length;
  const avgRent = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + Number(r.giaThue || 0), 0) / rooms.length)
    : 0;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition-all ${
      isActive
        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
        : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-900/25'
    }`;

  return (
    <BrowserRouter>
      <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen flex flex-col justify-between">
        <div>
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

            {/* Trạng thái Đồng Bộ Đám Mây */}
            <div className="flex items-center gap-2 text-xs">
              {cloudUser ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ☁️ Đã đồng bộ ({cloudUser.email})
                </div>
              ) : getSupabaseClient() ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/5 text-amber-400 font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  💾 Chế độ Local (Chưa đăng nhập)
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  🌐 Lưu Trữ Trình Duyệt (Ngoại tuyến)
                </div>
              )}
            </div>
          </header>

          {/* Navigation links using NavLink */}
          <nav className="flex border-b border-slate-900 gap-1.5 mb-8 overflow-x-auto">
            <NavLink to="/ho-so" className={navLinkClass}>
              <User className="w-4 h-4" />
              Hồ sơ cá nhân
            </NavLink>

            <NavLink to="/nhap" className={navLinkClass} end>
              <Building className="w-4 h-4" />
              Khảo sát phòng mới
            </NavLink>

            <NavLink to="/so-sanh" className={navLinkClass}>
              <BarChart3 className="w-4 h-4" />
              Danh sách & So sánh
              {rooms.length > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/35 font-bold ml-1">
                  {rooms.length}
                </span>
              )}
            </NavLink>

            <NavLink to="/cai-dat" className={navLinkClass}>
              <Settings2 className="w-4 h-4" />
              Cấu hình trọng số
            </NavLink>
          </nav>

          {/* Routes configuration */}
          <main>
            <Routes>
              <Route path="/" element={<RedirectRoute />} />
              <Route path="/ho-so" element={<ProfilePage />} />
              <Route path="/nhap" element={<RoomFormPage />} />
              <Route path="/nhap/:id" element={<RoomFormPage />} />
              <Route path="/so-sanh" element={<ComparePage />} />
              <Route path="/cai-dat" element={<ConfigSettings config={config} onSaveConfig={handleSaveConfig} />} />
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-xs text-slate-600">
          TroFit 🏠 - Tìm phòng trọ khớp với bạn, không chỉ khớp với ví tiền • Built for speed, offline-first.
        </footer>
      </div>
    </BrowserRouter>
  );
}
