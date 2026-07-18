/**
 * Logic Geocoding: Chuyển đổi địa chỉ sang tọa độ {lat, lng}
 * Tích hợp Mapbox Geocoding API + OSM Nominatim Fallback
 * Hỗ trợ Cache cục bộ tránh gọi trùng lặp & Usage Tracker
 */

const CACHE_KEY = 'tro-geocode-cache';
const USAGE_KEY = 'tro-api-usage';

// Đọc cache từ localStorage
const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// Ghi cache vào localStorage
const setCache = (address, coords) => {
  try {
    const cache = getCache();
    const cleanAddress = address.trim().toLowerCase();
    cache[cleanAddress] = coords;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Error writing geocode cache', e);
  }
};

// Đọc/Ghi Usage Tracker cho Mapbox
export const getApiUsage = () => {
  const currentMonth = new Date().toISOString().slice(0, 7); // VD: "2026-07"
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const usage = raw ? JSON.parse(raw) : { month: currentMonth, count: 0 };
    
    if (usage.month !== currentMonth) {
      usage.month = currentMonth;
      usage.count = 0;
      localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    }
    return usage;
  } catch (e) {
    return { month: currentMonth, count: 0 };
  }
};

const incrementApiUsage = () => {
  try {
    const usage = getApiUsage();
    usage.count += 1;
    localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch (e) {
    console.error('Error incrementing usage', e);
  }
};

export const geocodeAddress = async (address) => {
  if (!address || !address.trim()) return null;
  const cleanAddress = address.trim();
  const addressKey = cleanAddress.toLowerCase();

  // 1. Kiểm tra Cache trước
  const cache = getCache();
  if (cache[addressKey]) {
    console.log('[Geocoding] Cache Hit:', cleanAddress);
    return cache[addressKey];
  }

  // Lấy Mapbox token từ biến môi trường
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // 2. Thử gọi Mapbox Geocoding API nếu có Token
  if (mapboxToken && mapboxToken.trim()) {
    try {
      console.log('[Geocoding] Calling Mapbox:', cleanAddress);
      const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(cleanAddress)}&country=vn&limit=1&access_token=${mapboxToken}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        incrementApiUsage();
        
        const feature = data.features?.[0];
        if (feature && feature.geometry?.coordinates) {
          const [lng, lat] = feature.geometry.coordinates;
          const coords = { lat, lng };
          setCache(cleanAddress, coords);
          return coords;
        }
      }
    } catch (e) {
      console.warn('[Geocoding] Mapbox API error, falling back to Nominatim', e);
    }
  }

  // 3. Fallback sang OpenStreetMap Nominatim
  try {
    console.log('[Geocoding] Calling Nominatim Fallback:', cleanAddress);
    // Nominatim yêu cầu thêm User-Agent/Referer thân thiện để tránh bị chặn
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1&countrycodes=vn`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'vi,en'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const coords = {
          lat: Number(result.lat),
          lng: Number(result.lon)
        };
        setCache(cleanAddress, coords);
        return coords;
      }
    }
  } catch (e) {
    console.error('[Geocoding] Nominatim Fallback error', e);
  }

  return null;
};
