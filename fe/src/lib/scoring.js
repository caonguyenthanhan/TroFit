export const calculateAxisScores = (room, config, profile = null) => {
  const {
    nganSachGiaThue = 4000000,
    thoiGianLyTuong = 20,
    dienTichRange = [15, 35]
  } = config;

  // 1. Vị trí (Location Score)
  const t = Number(room.thoiGianDenCongTy || 0);
  let viTriScore = 2;
  if (t <= 10) viTriScore = 10;
  else if (t <= 20) viTriScore = 8;
  else if (t <= 30) viTriScore = 6;
  else if (t <= 45) viTriScore = 4;
  else viTriScore = 2;

  // 2. Chi phí (Cost Score)
  const estDien = Number(room.chiPhiKhac?.dien || 0) < 10000 
    ? Number(room.chiPhiKhac?.dien || 0) * 100  // Giả định 100 kWh
    : Number(room.chiPhiKhac?.dien || 0);
    
  const estNuoc = Number(room.chiPhiKhac?.nuoc || 0) < 5000 
    ? Number(room.chiPhiKhac?.nuoc || 0) * 10   // Giả định 10 khối
    : Number(room.chiPhiKhac?.nuoc || 0);

  const tongChiPhi = Number(room.giaThue || 0) +
    estDien +
    estNuoc +
    Number(room.chiPhiKhac?.xe || 0) +
    Number(room.chiPhiKhac?.dichVu || 0) +
    Number(room.chiPhiKhac?.wifi || 0);

  // So sánh với ngân sách của cấu hình (hoặc từ profile nếu có)
  const targetBudget = profile?.thuNhap 
    ? (Number(profile.thuNhap) * (profile.percentNganSach || 30) / 100)
    : nganSachGiaThue;

  const nguongThap = targetBudget * 0.7; 
  const nguongCao = targetBudget * 1.5;  
  
  let chiPhiScore = 1;
  if (tongChiPhi <= nguongThap) {
    chiPhiScore = 10;
  } else if (tongChiPhi >= nguongCao) {
    chiPhiScore = 1;
  } else {
    const rawScore = 10 - ((tongChiPhi - nguongThap) / (nguongCao - nguongThap)) * 9;
    chiPhiScore = Math.round(rawScore * 10) / 10;
  }

  // 3. Tiện ích (Amenities Score)
  let tienIchScore = 6;
  if (room.khongGianXungQuanh === 'thuan_tien') tienIchScore = 10;
  else if (room.khongGianXungQuanh === 'binh_thuong') tienIchScore = 6;
  else if (room.khongGianXungQuanh === 'khong_thuan_tien') tienIchScore = 2;

  // 4. Diện tích (Area Score)
  let dienTichScore = 6;
  const minM2 = dienTichRange[0] || 15;
  const maxM2 = dienTichRange[1] || 35;
  
  if (room.dienTichM2 && Number(room.dienTichM2) > 0) {
    const m2 = Number(room.dienTichM2);
    if (m2 <= minM2) {
      dienTichScore = 3;
    } else if (m2 >= maxM2) {
      dienTichScore = 10;
    } else {
      const rawScore = 3 + ((m2 - minM2) / (maxM2 - minM2)) * 7;
      dienTichScore = Math.round(rawScore * 10) / 10;
    }
  } else {
    if (room.doRong === 'lon') dienTichScore = 10;
    else if (room.doRong === 'vua') dienTichScore = 7;
    else if (room.doRong === 'nho') dienTichScore = 4;
  }

  // 5. Cảm quan (Aesthetic Score)
  const camQuanInput = Number(room.diemCamQuan || 3);
  const camQuanScore = camQuanInput * 2;

  // 6. Độ thoáng (Ventilation Score)
  let checkCount = 0;
  if (room.doThoang?.mayLanh) checkCount++;
  if (room.doThoang?.banCong) checkCount++;
  if (room.doThoang?.cuaSoTroi) checkCount++;
  if (room.doThoang?.cuaSo) checkCount++;
  const doThoangScore = checkCount * 2.5;

  // 7. Phù hợp cá nhân (Personal Match Score) - Trục mới
  const mandatoryTags = profile?.mandatoryTags || [];
  const optionalTags = profile?.optionalTags || [];
  const roomTags = room.tags || [];

  const missingMandatory = mandatoryTags.filter(t => !roomTags.includes(t));
  const matchedOptional = optionalTags.filter(t => roomTags.includes(t));

  let phuHopScore = 10;
  if (mandatoryTags.length > 0) {
    if (missingMandatory.length > 0) {
      // Phạt nặng: Trừ 3.5 điểm cho mỗi yêu cầu bắt buộc bị thiếu
      phuHopScore = Math.max(1, 10 - missingMandatory.length * 3.5);
    } else {
      // Nếu đáp ứng đủ bắt buộc, tính thêm điểm cộng từ tùy chọn
      if (optionalTags.length > 0) {
        const ratio = matchedOptional.length / optionalTags.length;
        phuHopScore = 6 + ratio * 4; // Bắt đầu từ 6.0đ, tối đa 10đ
      } else {
        phuHopScore = 10;
      }
    }
  } else {
    // Nếu không có yêu cầu bắt buộc, tính dựa trên yêu cầu tùy chọn
    if (optionalTags.length > 0) {
      const ratio = matchedOptional.length / optionalTags.length;
      phuHopScore = 5 + ratio * 5; // Bắt đầu từ 5.0đ, tối đa 10đ
    } else {
      phuHopScore = 10; // Không yêu cầu gì = 10đ
    }
  }

  phuHopScore = Math.round(phuHopScore * 10) / 10;

  return {
    viTri: viTriScore,
    chiPhi: chiPhiScore,
    tienIch: tienIchScore,
    dienTich: dienTichScore,
    camQuan: camQuanScore,
    doThoang: doThoangScore,
    phuHopCaNhan: phuHopScore,
    _tongChiPhi: tongChiPhi,
    _thieuBatBuoc: missingMandatory.length > 0,
    _danhSachThieuBatBuoc: missingMandatory
  };
};

export const calculateTotalScore = (axisScores, config) => {
  const weights = config.weights || {
    viTri: 0.15,
    chiPhi: 0.20,
    tienIch: 0.15,
    dienTich: 0.15,
    camQuan: 0.15,
    doThoang: 0.10,
    phuHopCaNhan: 0.10
  };

  const score = (axisScores.viTri * (weights.viTri ?? 0.15)) +
    (axisScores.chiPhi * (weights.chiPhi ?? 0.20)) +
    (axisScores.tienIch * (weights.tienIch ?? 0.15)) +
    (axisScores.dienTich * (weights.dienTich ?? 0.15)) +
    (axisScores.camQuan * (weights.camQuan ?? 0.15)) +
    (axisScores.doThoang * (weights.doThoang ?? 0.10)) +
    (axisScores.phuHopCaNhan * (weights.phuHopCaNhan ?? 0.10));

  return Math.round(score * 10) / 10;
};

export const scoreRoom = (room, config, profile = null) => {
  const scores = calculateAxisScores(room, config, profile);
  
  const { 
    _tongChiPhi, 
    _thieuBatBuoc, 
    _danhSachThieuBatBuoc, 
    ...pureAxisScores 
  } = scores;

  const diemTong = calculateTotalScore(pureAxisScores, config);
  
  return {
    ...room,
    diemTong,
    diemTheoTruc: pureAxisScores,
    tongChiPhiTho: _tongChiPhi,
    thieuBatBuoc: _thieuBatBuoc,
    danhSachThieuBatBuoc: _danhSachThieuBatBuoc
  };
};

export const analyzeSensitivity = (roomsList, config, profile) => {
  if (!roomsList || roomsList.length <= 1) return { isSensitive: false, changedBestRoomName: null };
  
  // Sắp xếp danh sách gốc
  const sortedOriginal = [...roomsList].sort((a, b) => b.diemTong - a.diemTong);
  const originalBest = sortedOriginal[0];
  
  const keys = Object.keys(config.weights || {});
  let isSensitive = false;
  let changedBestRoomName = null;
  
  for (const key of keys) {
    const keyVal = config.weights[key] || 0;
    const delta = 0.10; // Thay đổi trọng số +/- 10%
    
    if (keyVal + delta > 1.0) continue;
    
    const plusWeights = {};
    const otherKeys = keys.filter(k => k !== key);
    const otherSum = otherKeys.reduce((s, k) => s + (config.weights[k] || 0), 0);
    
    plusWeights[key] = keyVal + delta;
    otherKeys.forEach(k => {
      if (otherSum === 0) {
        plusWeights[k] = 0;
      } else {
        plusWeights[k] = Math.max(0, (config.weights[k] || 0) - delta * ((config.weights[k] || 0) / otherSum));
      }
    });
    
    // Tính lại điểm tổng hợp cho tất cả các phòng với trọng số mới
    const perturbedRooms = roomsList.map(r => {
      const scoreMap = r.diemTheoTruc || {};
      let diemTong = 0;
      Object.entries(plusWeights).forEach(([axis, weight]) => {
        diemTong += (scoreMap[axis] || 0) * weight;
      });
      return { name: r.ten, diemTong: Number(diemTong.toFixed(1)) };
    });
    
    perturbedRooms.sort((a, b) => b.diemTong - a.diemTong);
    
    if (perturbedRooms[0] && perturbedRooms[0].name !== originalBest.ten) {
      isSensitive = true;
      changedBestRoomName = perturbedRooms[0].name;
      break;
    }
  }
  
  return { isSensitive, changedBestRoomName };
};
