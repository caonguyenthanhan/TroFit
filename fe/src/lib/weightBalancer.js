/**
 * Thuật toán khóa tổng trọng số tự động (Locked-Sum Weight Balancer)
 * Đảm bảo tổng trọng số của 7 tiêu chí luôn bằng 100% (1.0).
 * Khi thay đổi 1 trọng số, các trọng số khác tự động tăng/giảm tỷ lệ theo giá trị hiện tại của chúng.
 */

export const normalizeToHundred = (weights) => {
  const keys = Object.keys(weights);
  const values = keys.map(k => Math.round((weights[k] || 0) * 100));
  
  const sum = values.reduce((s, v) => s + v, 0);
  let diff = 100 - sum;
  
  if (diff !== 0) {
    // Tìm index có giá trị lớn nhất để bù đắp sai số làm tròn
    let maxIdx = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[maxIdx]) {
        maxIdx = i;
      }
    }
    values[maxIdx] += diff;
  }
  
  const result = {};
  keys.forEach((k, idx) => {
    result[k] = values[idx] / 100;
  });
  return result;
};

export const reBalance = (weights, changedKey, newValueDecimal) => {
  const keys = Object.keys(weights);
  const otherKeys = keys.filter(k => k !== changedKey);
  
  // Chuyển đổi sang thang 0-100 để tính toán số nguyên
  const currentPct = {};
  keys.forEach(k => {
    currentPct[k] = Math.round((weights[k] || 0) * 100);
  });
  
  const newValPct = Math.round(newValueDecimal * 100);
  const delta = newValPct - currentPct[changedKey];
  
  const otherSum = otherKeys.reduce((s, k) => s + currentPct[k], 0);
  
  const nextPct = { ...currentPct, [changedKey]: newValPct };
  
  if (delta !== 0) {
    otherKeys.forEach(k => {
      if (otherSum === 0) {
        // Nếu các tiêu chí khác đều bằng 0, chia đều phần delta giảm
        const share = Math.round(delta / otherKeys.length);
        nextPct[k] = Math.max(0, currentPct[k] - share);
      } else {
        // Phân bổ tỷ lệ theo giá trị hiện tại của từng tiêu chí
        const proportion = currentPct[k] / otherSum;
        nextPct[k] = Math.max(0, currentPct[k] - Math.round(delta * proportion));
      }
    });
  }
  
  // Sửa sai số làm tròn sau phép nhân chia tỉ lệ để tổng luôn bằng chính xác 100
  let sum = keys.reduce((s, k) => s + nextPct[k], 0);
  let diff = 100 - sum;
  
  if (diff !== 0) {
    // Chỉ điều chỉnh các tiêu chí phụ (khác changedKey)
    // Nếu diff > 0 (thiếu điểm), cộng thêm vào các tiêu chí phụ. 
    // Nếu diff < 0 (thừa điểm), trừ bớt từ các tiêu chí phụ đang có điểm > 0.
    const adjustKeys = diff > 0 ? otherKeys : otherKeys.filter(k => nextPct[k] > 0);
    
    if (adjustKeys.length > 0) {
      let i = 0;
      while (diff !== 0) {
        const k = adjustKeys[i % adjustKeys.length];
        if (diff > 0) {
          nextPct[k] += 1;
          diff -= 1;
        } else if (nextPct[k] > 0) {
          nextPct[k] -= 1;
          diff += 1;
        }
        i++;
        if (i > 200) break; // Phòng tránh vòng lặp vô hạn
      }
    } else {
      // Fallback: Nếu không điều chỉnh được tiêu chí nào khác, ghi đè hiệu số vào changedKey
      nextPct[changedKey] += diff;
    }
  }
  
  // Chuyển đổi ngược lại về hệ số thập phân 0.0 - 1.0
  const result = {};
  keys.forEach(k => {
    result[k] = nextPct[k] / 100;
  });
  
  return result;
};
