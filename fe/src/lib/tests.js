/**
 * Unit Tests tự động in kết quả ra Console ở chế độ Development.
 * Đảm bảo các logic tính toán tài chính, chấm điểm và cân bằng trọng số hoạt động đúng.
 */

import { calculateAxisScores, calculateTotalScore, scoreRoom } from './scoring';
import { calculateRecommendedBudget, getFinancialAdvice } from './budgetRules';
import { reBalance, normalizeToHundred } from './weightBalancer';

export const runAllTests = () => {
  if (!import.meta.env.DEV) return;

  console.group('%c🧪 TroFit Self-Testing Engine', 'color: #6366f1; font-weight: bold; font-size: 13px;');
  
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`%c[OK] %c${message}`, 'color: #10b981; font-weight: bold;', 'color: #94a3b8;');
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  };

  // Test 1: Chấm điểm Vị trí
  try {
    const config = { nganSachGiaThue: 4000000 };
    const roomFast = { thoiGianDenCongTy: 5, giaThue: 3000000 };
    const roomSlow = { thoiGianDenCongTy: 50, giaThue: 3000000 };
    
    const scoresFast = calculateAxisScores(roomFast, config);
    const scoresSlow = calculateAxisScores(roomSlow, config);
    
    assert(scoresFast.viTri === 10, 'Vị trí <=10 phút phải được 10 điểm');
    assert(scoresSlow.viTri === 2, 'Vị trí >45 phút phải bị 2 điểm');
  } catch (e) {
    console.error('Test 1 failed with error:', e);
    failedCount++;
  }

  // Test 2: Chấm điểm Chi phí (Tài chính)
  try {
    const config = { nganSachGiaThue: 4000000 };
    const profile = { thuNhap: 10000000, percentNganSach: 30 }; // Ngân sách đề xuất: 3M
    
    // Tiền thuê trọn gói rẻ hơn nhiều ngân sách tối ưu (3M * 0.7 = 2.1M)
    const cheapRoom = { giaThue: 1500000, chiPhiKhac: { dien: 100000, nuoc: 50000 } }; // tổng 1.65M <= 2.1M -> 10đ
    const expensiveRoom = { giaThue: 5000000, chiPhiKhac: { dien: 300000 } }; // tổng 5.3M >= 4.5M -> 1đ
    
    const scoresCheap = calculateAxisScores(cheapRoom, config, profile);
    const scoresExpensive = calculateAxisScores(expensiveRoom, config, profile);
    
    assert(scoresCheap.chiPhi === 10, 'Tổng chi phí dưới ngưỡng tối ưu phải được 10 điểm');
    assert(scoresExpensive.chiPhi === 1, 'Tổng chi phí vượt ngưỡng trần phải bị 1 điểm');
  } catch (e) {
    console.error('Test 2 failed with error:', e);
    failedCount++;
  }

  // Test 3: Chấm điểm Phù hợp cá nhân
  try {
    const config = { nganSachGiaThue: 4000000 };
    const profile = { mandatoryTags: ['an_ninh_tot', 'toilet_rieng'], optionalTags: ['co_thang_may'] };
    
    const goodRoom = { tags: ['an_ninh_tot', 'toilet_rieng', 'co_thang_may'] }; // Đạt đủ 2 bắt buộc, 1 tùy chọn -> 10đ
    const badRoom = { tags: ['toilet_rieng'] }; // Thiếu 'an_ninh_tot' -> Phạt nặng
    
    const scoreGood = calculateAxisScores(goodRoom, config, profile);
    const scoreBad = calculateAxisScores(badRoom, config, profile);
    
    assert(scoreGood.phuHopCaNhan === 10, 'Đầy đủ tag bắt buộc và tùy chọn phải được 10 điểm');
    assert(scoreBad.phuHopCaNhan < 7.0, 'Thiếu tag bắt buộc phải bị phạt nặng (< 7 điểm)');
    assert(scoreBad._thieuBatBuoc === true, 'Thiếu tag bắt buộc phải có cờ cảnh báo _thieuBatBuoc');
  } catch (e) {
    console.error('Test 3 failed with error:', e);
    failedCount++;
  }

  // Test 4: Cân bằng trọng số Locked-sum
  try {
    const initialWeights = {
      viTri: 0.15,
      chiPhi: 0.20,
      tienIch: 0.15,
      dienTich: 0.15,
      camQuan: 0.15,
      doThoang: 0.10,
      phuHopCaNhan: 0.10
    };
    
    const updated = reBalance(initialWeights, 'chiPhi', 0.50); // Tăng chi phí từ 20% lên 50%
    const sum = Object.values(updated).reduce((s, v) => s + v, 0);
    
    assert(Math.abs(sum - 1.0) < 0.0001, 'Tổng trọng số sau khi cân bằng lại phải luôn bằng chính xác 100%');
    assert(updated.chiPhi === 0.50, 'Trọng số thay đổi phải nhận đúng giá trị mới');
    assert(updated.viTri < initialWeights.viTri, 'Các tiêu chí khác phải tự động giảm đi');
  } catch (e) {
    console.error('Test 4 failed with error:', e);
    failedCount++;
  }

  console.log(`%c📊 Tổng kết kiểm thử: ${passedCount} ĐẠT, ${failedCount} LỖI`, `color: ${failedCount > 0 ? '#f43f5e' : '#10b981'}; font-weight: bold;`);
  console.groupEnd();
};
