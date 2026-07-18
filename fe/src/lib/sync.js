import { getSupabaseClient } from './supabase';
import { 
  getRooms, 
  getProfile, 
  getConfig, 
  saveRoomsList, 
  saveProfile, 
  saveConfig 
} from './storage';

// Lấy thông tin session hiện tại
export const getCurrentSessionUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  } catch (e) {
    return null;
  }
};

// Đăng ký tài khoản
export const signUpUser = async (email, password) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data.user;
};

// Đăng nhập
export const signInUser = async (email, password) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase chưa được cấu hình.');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data.user;
};

// Đăng xuất
export const signOutUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Khi đăng xuất, không xóa localStorage để người dùng vẫn dùng offline bình thường
};

// Đẩy dữ liệu Local lên Cloud (Merge khi đăng nhập lần đầu)
export const pushLocalDataToCloud = async (userId) => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  console.log('[Sync] Pushing local data to Supabase...');

  // 1. Profile
  const localProfile = getProfile();
  if (localProfile) {
    await supabase.from('profiles').upsert({
      user_id: userId,
      data: localProfile,
      updated_at: new Date().toISOString()
    });
  }

  // 2. Config
  const localConfig = getConfig();
  if (localConfig) {
    await supabase.from('configs').upsert({
      user_id: userId,
      data: localConfig,
      updated_at: new Date().toISOString()
    });
  }

  // 3. Rooms
  const localRooms = getRooms();
  if (localRooms && localRooms.length > 0) {
    for (const room of localRooms) {
      await supabase.from('rooms').upsert({
        id: room.id,
        user_id: userId,
        data: room,
        updated_at: new Date().toISOString()
      });
    }
  }
  
  console.log('[Sync] Push completed!');
};

// Kéo dữ liệu từ Cloud về đè Local Cache
export const pullCloudDataToLocal = async (userId) => {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  console.log('[Sync] Pulling cloud data from Supabase...');

  // 1. Profile
  const { data: profileRes, error: pErr } = await supabase
    .from('profiles')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (!pErr && profileRes?.data) {
    saveProfile(profileRes.data);
  }

  // 2. Config
  const { data: configRes, error: cErr } = await supabase
    .from('configs')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();

  if (!cErr && configRes?.data) {
    saveConfig(configRes.data);
  }

  // 3. Rooms
  const { data: roomsRes, error: rErr } = await supabase
    .from('rooms')
    .select('data')
    .eq('user_id', userId);

  if (!rErr && roomsRes) {
    const pulledRooms = roomsRes.map(r => r.data);
    saveRoomsList(pulledRooms);
  }

  console.log('[Sync] Pull completed!');
};

// Full Sync: Đẩy local lên -> Kéo toàn bộ về (để lấy danh sách phòng gộp trên cloud)
export const syncAllData = async (userId) => {
  await pushLocalDataToCloud(userId);
  await pullCloudDataToLocal(userId);
};
