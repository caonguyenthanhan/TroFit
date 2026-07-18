export const DEFAULT_CONFIG = {
  nganSachGiaThue: 4000000,
  thoiGianLyTuong: 20,
  dienTichRange: [15, 35],
  weights: {
    viTri: 0.15,
    chiPhi: 0.20,
    tienIch: 0.15,
    dienTich: 0.15,
    camQuan: 0.15,
    doThoang: 0.10,
    phuHopCaNhan: 0.10 // Trục thứ 7
  }
};

export const DEFAULT_PROFILE = {
  thuNhap: '',
  diaChiCongTy: '',
  thoiGianDenCongTy: 20,
  tinhChatCongViec: 'van_phong', // van_phong | linh_hoat | di_bo
  coSongGhep: false,
  mandatoryTags: [], // Yêu cầu bắt buộc
  optionalTags: [],  // Yêu cầu tùy chọn
  percentNganSach: 30
};

const STORAGE_KEYS = {
  ROOMS: 'tro-list',
  CONFIG: 'tro-config',
  PROFILE: 'tro-profile'
};

export const getConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure all 7 weights exist, otherwise merge with defaults
    if (!parsed.weights) {
      parsed.weights = DEFAULT_CONFIG.weights;
    } else {
      // Check if phuHopCaNhan weight is present, if not, adjust and add it
      if (parsed.weights.phuHopCaNhan === undefined) {
        parsed.weights.phuHopCaNhan = 0.10;
        // Normalize other weights to fit 0.90 total
        const keys = ['viTri', 'chiPhi', 'tienIch', 'dienTich', 'camQuan', 'doThoang'];
        const sum = keys.reduce((s, k) => s + (parsed.weights[k] || 0), 0);
        keys.forEach(k => {
          parsed.weights[k] = Math.round(((parsed.weights[k] || 0) / sum * 0.90) * 100) / 100;
        });
      }
    }
    return parsed;
  } catch (error) {
    console.error('Error reading config from localStorage', error);
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving config to localStorage', error);
    return false;
  }
};

export const getProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading profile', e);
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('Error saving profile', e);
    return false;
  }
};

export const getRooms = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading rooms from localStorage', error);
    return [];
  }
};

export const saveRoomsList = (rooms) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return true;
  } catch (error) {
    console.error('Error saving rooms list to localStorage', error);
    return false;
  }
};

export const saveRoom = (room) => {
  try {
    const rooms = getRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    saveRoomsList(rooms);
    return rooms;
  } catch (error) {
    console.error('Error saving room', error);
    return null;
  }
};

export const deleteRoom = (id) => {
  try {
    const rooms = getRooms();
    const filtered = rooms.filter(r => r.id !== id);
    saveRoomsList(filtered);
    return filtered;
  } catch (error) {
    console.error('Error deleting room', error);
    return null;
  }
};

export const exportData = () => {
  const config = getConfig();
  const rooms = getRooms();
  const profile = getProfile();
  return {
    exportedAt: new Date().toISOString(),
    config,
    profile,
    danhSachPhong: rooms
  };
};

export const importData = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (!data || typeof data !== 'object') {
      throw new Error('Dữ liệu không đúng định dạng JSON');
    }
    
    if (data.config) {
      saveConfig(data.config);
    }
    if (data.profile) {
      saveProfile(data.profile);
    }
    if (Array.isArray(data.danhSachPhong)) {
      saveRoomsList(data.danhSachPhong);
    } else if (Array.isArray(data)) {
      saveRoomsList(data);
    }
    return true;
  } catch (error) {
    console.error('Error importing JSON data', error);
    throw error;
  }
};
