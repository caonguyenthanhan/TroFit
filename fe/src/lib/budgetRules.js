/**
 * Kinh tế học tài chính cá nhân: Quy tắc 50/30/20 áp dụng cho tiền thuê nhà.
 * Khuyên dùng: Tiền nhà nên chiếm khoảng 15-30% thu nhập ròng hàng tháng.
 * Trần tối đa: 40% thu nhập ròng chỉ khi thỏa mãn một số điều kiện nới trần.
 */

export const calculateRecommendedBudget = (income, percentage = 30) => {
  const inc = Number(income) || 0;
  return {
    min: inc * 0.15,
    recommended: inc * (percentage / 100),
    maxAbsolute: inc * 0.40
  };
};

export const checkBudgetExtensionConditions = (profile) => {
  const conditions = [];
  let maxPercentage = 30;

  if (!profile) return { maxPercentage, conditions };

  // Điều kiện 1: Có người ở ghép chia sẻ chi phí
  if (profile.coSongGhep) {
    conditions.push({
      id: 'song_ghep',
      label: 'Có người ở ghép (chia sẻ chi phí điện nước, dịch vụ)',
      increase: 5
    });
    maxPercentage += 5;
  }

  // Điều kiện 2: Rất gần công ty (tiết kiệm xăng xe, thời gian di chuyển)
  if (Number(profile.thoiGianDenCongTy) <= 15 && Number(profile.thoiGianDenCongTy) > 0) {
    conditions.push({
      id: 'gan_cong_ty',
      label: 'Rất gần công ty (<= 15 phút, tiết kiệm tiền di chuyển)',
      increase: 5
    });
    maxPercentage += 5;
  }

  // Điều kiện 3: Có thể đi bộ đi làm (không mất tiền xăng xe)
  if (profile.tinhChatCongViec === 'di_bo') {
    conditions.push({
      id: 'di_bo_lam',
      label: 'Đi bộ đi làm (tiết kiệm 100% chi phí xăng xe)',
      increase: 5
    });
    maxPercentage += 5;
  }

  // Giới hạn trần tối đa là 40%
  maxPercentage = Math.min(40, maxPercentage);

  return {
    maxPercentage,
    conditions
  };
};

export const getFinancialAdvice = (income, rent, totalCost, profile) => {
  const inc = Number(income) || 0;
  if (inc <= 0) return null;

  const rentPercent = (rent / inc) * 100;
  const totalCostPercent = (totalCost / inc) * 100;

  const { maxPercentage } = checkBudgetExtensionConditions(profile);

  let status = 'safe'; // 'safe' | 'warning' | 'danger'
  let advice = '';

  if (totalCostPercent <= 20) {
    status = 'safe';
    advice = 'Mức chi trả cực kỳ an toàn! Bạn sẽ dư nhiều ngân sách cho tích lũy (20%) và các nhu cầu khác (30%).';
  } else if (totalCostPercent <= maxPercentage) {
    status = 'safe';
    advice = `Hợp lý. Chi phí nằm trong hạn mức cho phép của bạn (tối đa ${maxPercentage}% thu nhập).`;
  } else if (totalCostPercent <= 40) {
    status = 'warning';
    advice = `Cảnh báo: Chi phí chiếm ${totalCostPercent.toFixed(0)}% thu nhập, vượt ngưỡng khuyến nghị tối ưu (${maxPercentage}%). Hãy cân nhắc cắt bớt nhu cầu giải trí để tránh thâm hụt tài chính.`;
  } else {
    status = 'danger';
    advice = `Nguy hiểm! Chi phí chiếm ${totalCostPercent.toFixed(0)}% thu nhập. Bạn đang rơi vào trạng thái "house poor" (kẹt tiền vì nhà ở), không còn ngân sách cho tích lũy và phòng ngừa rủi ro.`;
  }

  return {
    rentPercent,
    totalCostPercent,
    status,
    advice,
    maxPercentage
  };
};
