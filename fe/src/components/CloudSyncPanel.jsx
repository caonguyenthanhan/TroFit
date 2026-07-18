import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  CloudLightning, 
  Key, 
  Database, 
  Copy, 
  Check, 
  LogIn, 
  UserPlus, 
  LogOut, 
  RefreshCw, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { getSupabaseClient, getSupabaseConfig, resetSupabaseClient } from '../lib/supabase';
import { signInUser, signUpUser, signOutUser, syncAllData, getCurrentSessionUser } from '../lib/sync';

export default function CloudSyncPanel({ onSyncCompleted }) {
  const [config, setConfig] = useState({ url: '', key: '' });
  const [isClientInit, setIsClientInit] = useState(false);
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Load configs & initial session
  useEffect(() => {
    const activeConfig = getSupabaseConfig();
    setConfig(activeConfig);
    
    const client = getSupabaseClient();
    setIsClientInit(!!client);

    const checkUser = async () => {
      if (client) {
        const currentUser = await getCurrentSessionUser();
        setUser(currentUser);
      }
    };
    checkUser();
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('tro-supabase-config', JSON.stringify(config));
      const client = resetSupabaseClient();
      setIsClientInit(!!client);
      setSuccessMsg('Đã lưu cấu hình Supabase Client.');
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Check auth after updating client
      if (client) {
        getCurrentSessionUser().then(setUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setErrorMsg('Lỗi lưu cấu hình.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (authTab === 'login') {
        const loggedUser = await signInUser(email, password);
        setUser(loggedUser);
        setSuccessMsg('Đăng nhập thành công! Bắt đầu đồng bộ...');
        
        // Chạy merge và pull dữ liệu
        await syncAllData(loggedUser.id);
        setSuccessMsg('Đã đăng nhập & Đồng bộ dữ liệu thành công!');
        if (onSyncCompleted) onSyncCompleted();
      } else {
        const registeredUser = await signUpUser(email, password);
        setSuccessMsg('Đăng ký thành công! Hãy kiểm tra hòm thư xác nhận (nếu có bật) hoặc thử đăng nhập.');
        setAuthTab('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Thao tác thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setSuccessMsg('Đã đăng xuất tài khoản đám mây.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Lỗi khi đăng xuất.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await syncAllData(user.id);
      setSuccessMsg('Đã đồng bộ dữ liệu hoàn tất!');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onSyncCompleted) onSyncCompleted();
    } catch (err) {
      setErrorMsg('Lỗi đồng bộ đám mây.');
    } finally {
      setLoading(false);
    }
  };

  const sqlSchema = `-- Bảng profiles lưu hồ sơ cá nhân
create table if not exists public.profiles (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bảng rooms lưu danh sách phòng trọ 
create table if not exists public.rooms (
  id uuid primary key,
  user_id uuid references auth.users on delete cascade not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.rooms enable row level security;
create policy "Users manage own rooms" on public.rooms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bảng configs lưu cấu hình trọng số
create table if not exists public.configs (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.configs enable row level security;
create policy "Users manage own config" on public.configs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Cài đặt Supabase Client Keys */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          Cấu Hình Kết Nối Đám Mây (Supabase)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          TroFit hỗ trợ đồng bộ serverless cá nhân. Bạn hãy tự tạo 1 project Supabase miễn phí, điền các tham số kết nối dưới đây để bật tính năng xác thực và đồng bộ dữ liệu. Dữ liệu của bạn được lưu an toàn trực tiếp trên tài khoản Supabase của riêng bạn!
        </p>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Supabase Project URL</span>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://your-project-id.supabase.co"
              className="glass-input text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-semibold">Supabase Anon Public API Key</span>
            <input
              type="password"
              value={config.key}
              onChange={(e) => setConfig(prev => ({ ...prev, key: e.target.value }))}
              placeholder="eyJhbGciOi..."
              className="glass-input text-xs"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              Lưu & Khởi tạo kết nối
            </button>
          </div>
        </form>
      </div>

      {/* Cảnh báo free tier */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5 max-w-4xl mx-auto">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <span className="font-bold">Lưu ý quan trọng về Supabase Free Tier:</span>
          <p>
            Dự án Supabase miễn phí sẽ **tự động tạm dừng (pause) sau 7 ngày** nếu không phát sinh lượt truy cập. Nếu gặp tình trạng đăng nhập bị treo hoặc báo lỗi kết nối sau thời gian dài không dùng, vui lòng vào Dashboard Supabase của bạn và bấm **Resume** để đánh thức dự án.
          </p>
        </div>
      </div>

      {/* Trạng thái / Đăng ký Đăng nhập */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-indigo-400" />
          Đồng Bộ Dữ Liệu Lên Đám Mây
        </h3>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-fade-in">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-fade-in">
            {successMsg}
          </div>
        )}

        {!isClientInit ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl text-center gap-2">
            <CloudOff className="w-8 h-8 text-slate-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400">Dịch vụ đám mây chưa được kích hoạt</span>
            <span className="text-[10px] text-slate-500 max-w-[320px]">
              Vui lòng điền và lưu cấu hình URL & Anon Key ở mục trên để kích hoạt Đăng nhập/Đồng bộ.
            </span>
          </div>
        ) : user ? (
          /* Đã đăng nhập */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <CloudLightning className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Đã đồng bộ đám mây</div>
                  <div className="text-xs font-bold text-slate-200">{user.email}</div>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleManualSync}
                  disabled={loading}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Đồng bộ thủ công
                </button>
                
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              * Hệ thống hoạt động ở chế độ Dual-Write: mọi thay đổi của bạn trên app (khảo sát mới, chỉnh trọng số, thay đổi profile) sẽ tự động lưu song song ở bộ nhớ trình duyệt và backup đồng bộ đồng thời lên Supabase khi có kết nối internet.
            </p>
          </div>
        ) : (
          /* Chưa đăng nhập */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Form Auth */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="flex border-b border-slate-900 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition-all ${
                    authTab === 'login' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 text-center py-2 text-xs font-bold border-b-2 transition-all ${
                    authTab === 'register' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
                  }`}
                >
                  Tạo Tài Khoản
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Email đăng nhập</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VD: caonguyenthanhan@gmail.com"
                  className="glass-input text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gradient-btn w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-center items-center gap-1.5 py-2.5 text-xs shadow-indigo-600/10"
              >
                {authTab === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Đăng nhập & Đồng bộ
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Đăng ký tài khoản mới
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-900 text-[11px] text-slate-400 space-y-2.5 leading-relaxed">
              <span className="font-bold text-indigo-400 block">💡 Merge & Sync Policy:</span>
              <p>
                1. Khi đăng nhập lần đầu tiên, **dữ liệu trọ bạn đang nhập dở ở trình duyệt này** sẽ tự động được đồng bộ lên tài khoản Supabase mới.
              </p>
              <p>
                2. Các lần đăng nhập sau trên máy khác sẽ tự động tải dữ liệu đám mây về đè đệm cục bộ giúp bạn làm việc nối tiếp.
              </p>
              <p>
                3. Đảm bảo bạn đã chạy script tạo cấu trúc bảng (SQL) ở tab bên phải để Supabase nhận dữ liệu đồng bộ chính xác.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SQL Script Guide */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          Script Khởi Tạo Database (SQL Migration Schema)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Hãy sao chép đoạn script SQL dưới đây và dán vào mục **SQL Editor** trong trang quản trị dự án Supabase của bạn, rồi bấm **Run** để khởi tạo các bảng phòng trọ, hồ sơ và cấu hình tự động phân quyền bảo mật RLS:
        </p>

        <div className="relative bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-[10px] text-slate-500 overflow-x-auto leading-relaxed max-h-[220px]">
          <button
            onClick={copySql}
            className="absolute top-2 right-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all hover:bg-slate-800"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <pre>{sqlSchema}</pre>
        </div>
      </div>
    </div>
  );
}
