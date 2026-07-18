/**
 * Logic Directions: Tính toán thời gian di chuyển giữa 2 tọa độ {lat, lng}
 * Tích hợp Mapbox Directions API
 * Có Cache tránh gọi trùng lặp & Usage Tracker
 */

import { getApiUsage } from './geocoding';

const CACHE_KEY = 'tro-directions-cache';

const getCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const setCache = (key, durationMinutes) => {
  try {
    const cache = getCache();
    cache[key] = durationMinutes;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Error writing directions cache', e);
  }
};

const incrementApiUsage = () => {
  try {
    const raw = localStorage.getItem('tro-api-usage');
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = raw ? JSON.parse(raw) : { month: currentMonth, count: 0 };
    usage.count += 1;
    localStorage.setItem('tro-api-usage', JSON.stringify(usage));
  } catch (e) {
    console.error(e);
  }
};

export const getTravelTime = async (origin, destination, mode = 'driving') => {
  if (!origin || !destination) return null;
  if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) return null;

  // Làm tròn tọa độ 4 chữ số thập phân (~11m độ phân giải) để tăng tỉ lệ hit cache
  const lat1 = Number(origin.lat).toFixed(4);
  const lng1 = Number(origin.lng).toFixed(4);
  const lat2 = Number(destination.lat).toFixed(4);
  const lng2 = Number(destination.lng).toFixed(4);

  const cacheKey = `${lat1},${lng1}_to_${lat2},${lng2}_${mode}`;
  const cache = getCache();

  if (cache[cacheKey] !== undefined) {
    console.log('[Directions] Cache Hit:', cacheKey);
    return cache[cacheKey];
  }

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  if (mapboxToken && mapboxToken.trim()) {
    try {
      console.log('[Directions] Calling Mapbox:', cacheKey);
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${lng1},${lat1};${lng2},${lat2}?access_token=${mapboxToken}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        incrementApiUsage();
        
        const route = data.routes?.[0];
        if (route && route.duration !== undefined) {
          // Mapbox trả về thời gian dạng giây, chia 60 lấy số phút
          const durationMinutes = Math.round(route.duration / 60);
          setCache(cacheKey, durationMinutes);
          return durationMinutes;
        }
      }
    } catch (e) {
      console.error('[Directions] Mapbox Directions API error', e);
    }
  }

  // Fallback heuristic: tính khoảng cách chim bay theo công thức Haversine 
  // và giả định tốc độ xe máy trung bình 30 km/h ở VN (kèm hệ số uốn lượn đường đi ~1.3)
  try {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c; // Khoảng cách chim bay
    
    // Giả định tốc độ: Xe máy = 25km/h, Đi bộ = 5km/h
    const speedKmh = mode === 'walking' ? 5 : 25;
    const pathFactor = 1.35; // Hệ số uốn lượn thực tế
    
    const estimatedHours = (distanceKm * pathFactor) / speedKmh;
    const estimatedMinutes = Math.max(2, Math.round(estimatedHours * 60)); // tối thiểu 2 phút
    
    console.log('[Directions] Heuristic Fallback:', distanceKm.toFixed(2), 'km ->', estimatedMinutes, 'mins');
    setCache(cacheKey, estimatedMinutes);
    return estimatedMinutes;
  } catch (e) {
    console.error('[Directions] Heuristic calculation error', e);
  }

  return null;
};
