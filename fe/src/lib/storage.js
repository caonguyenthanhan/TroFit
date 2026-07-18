export const DEFAULT_CONFIG = {
  nganSachGiaThue: 4000000,
  thoiGianLyTuong: 20,
  dienTichRange: [15, 35],
  weights: {
    viTri: 0.20,
    chiPhi: 0.25,
    tienIch: 0.15,
    dienTich: 0.15,
    camQuan: 0.15,
    doThoang: 0.10
  }
};

const STORAGE_KEYS = {
  ROOMS: 'tro-list',
  CONFIG: 'tro-config'
};

export const getConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    // Ensure nested weights exist
    if (!parsed.weights) {
      parsed.weights = DEFAULT_CONFIG.weights;
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
  return {
    exportedAt: new Date().toISOString(),
    config,
    danhSachPhong: rooms
  };
};

export const importData = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    if (!data || typeof data !== 'object') {
      throw new Error('Dữ liệu không đúng định dạng JSON');
    }
    
    // Simple validation
    if (data.config) {
      saveConfig(data.config);
    }
    if (Array.isArray(data.danhSachPhong)) {
      saveRoomsList(data.danhSachPhong);
    } else if (Array.isArray(data)) {
      // In case they just upload an array of rooms
      saveRoomsList(data);
    }
    return true;
  } catch (error) {
    console.error('Error importing JSON data', error);
    throw error;
  }
};
