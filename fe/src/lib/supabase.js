import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

// Lấy thông tin cấu hình từ localStorage hoặc Env
export const getSupabaseConfig = () => {
  let url = '';
  let key = '';

  try {
    const raw = localStorage.getItem('tro-supabase-config');
    if (raw) {
      const parsed = JSON.parse(raw);
      url = parsed.url || '';
      key = parsed.key || '';
    }
  } catch (e) {
    console.error('Error reading Supabase config from localStorage', e);
  }

  // Fallback sang Env vars
  if (!url || !key) {
    url = import.meta.env.VITE_SUPABASE_URL || '';
    key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  return { url: url.trim(), key: key.trim() };
};

// Khởi tạo dynamic Supabase client
export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client', e);
      return null;
    }
  }

  return null;
};

// Reset instance khi người dùng đổi credentials
export const resetSupabaseClient = () => {
  supabaseInstance = null;
  return getSupabaseClient();
};
