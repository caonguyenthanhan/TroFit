export const calculateAxisScores = (room, config) => {
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
  // Ước tính chi phí điện nước hàng tháng nếu người dùng nhập đơn giá điện (VD: 3.5k/kWh) hoặc nước (VD: 20k/khối)
  const estDien = Number(room.chiPhiKhac?.dien || 0) < 10000 
    ? Number(room.chiPhiKhac?.dien || 0) * 100  // Giả định dùng ~100 kWh/tháng
    : Number(room.chiPhiKhac?.dien || 0);
    
  const estNuoc = Number(room.chiPhiKhac?.nuoc || 0) < 5000 
    ? Number(room.chiPhiKhac?.nuoc || 0) * 10   // Giả định dùng ~10 khối/tháng hoặc 100k/người
    : Number(room.chiPhiKhac?.nuoc || 0);

  const tongChiPhi = Number(room.giaThue || 0) +
    estDien +
    estNuoc +
    Number(room.chiPhiKhac?.xe || 0) +
    Number(room.chiPhiKhac?.dichVu || 0) +
    Number(room.chiPhiKhac?.wifi || 0);

  // Ngưỡng thấp (chi phí tối ưu) và Ngưỡng cao (chi phí trần)
  const nguongThap = nganSachGiaThue * 0.7; // Ví dụ ngân sách 4tr thì thấp hơn 2.8tr được 10 điểm
  const nguongCao = nganSachGiaThue * 1.5;  // Ngưỡng trần chi phí tối đa (6tr)
  
  let chiPhiScore = 1;
  if (tongChiPhi <= nguongThap) {
    chiPhiScore = 10;
  } else if (tongChiPhi >= nguongCao) {
    chiPhiScore = 1;
  } else {
    // Nội suy tuyến tính từ 10 xuống 1
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
      // Nội suy từ 3 đến 10
      const rawScore = 3 + ((m2 - minM2) / (maxM2 - minM2)) * 7;
      dienTichScore = Math.round(rawScore * 10) / 10;
    }
  } else {
    // Nếu không nhập m2 thì quy đổi theo doRong (nho, vua, lon)
    if (room.doRong === 'lon') dienTichScore = 10;
    else if (room.doRong === 'vua') dienTichScore = 7;
    else if (room.doRong === 'nho') dienTichScore = 4;
  }

  // 5. Cảm quan (Aesthetic Score)
  const camQuanInput = Number(room.diemCamQuan || 3); // mặc định 3 nếu không chọn
  const camQuanScore = camQuanInput * 2; // thang 1-5 nhân đôi thành 2-10

  // 6. Độ thoáng (Ventilation Score)
  let checkCount = 0;
  if (room.doThoang?.mayLanh) checkCount++;
  if (room.doThoang?.banCong) checkCount++;
  if (room.doThoang?.cuaSoTroi) checkCount++;
  if (room.doThoang?.cuaSo) checkCount++;
  const doThoangScore = checkCount * 2.5; // tối đa 10đ

  return {
    viTri: viTriScore,
    chiPhi: chiPhiScore,
    tienIch: tienIchScore,
    dienTich: dienTichScore,
    camQuan: camQuanScore,
    doThoang: doThoangScore,
    _tongChiPhi: tongChiPhi // Trả thêm tổng chi phí thô để tiện hiển thị
  };
};

export const calculateTotalScore = (axisScores, config) => {
  const weights = config.weights || {
    viTri: 0.20,
    chiPhi: 0.25,
    tienIch: 0.15,
    dienTich: 0.15,
    camQuan: 0.15,
    doThoang: 0.10
  };

  const score = (axisScores.viTri * weights.viTri) +
    (axisScores.chiPhi * weights.chiPhi) +
    (axisScores.tienIch * weights.tienIch) +
    (axisScores.dienTich * weights.dienTich) +
    (axisScores.camQuan * weights.camQuan) +
    (axisScores.doThoang * weights.doThoang);

  return Math.round(score * 10) / 10;
};

// Hàm đầy đủ nhận vào đối tượng phòng và trả về đối tượng phòng đã được chấm điểm hoàn chỉnh
export const scoreRoom = (room, config) => {
  const diemTheoTruc = calculateAxisScores(room, config);
  const diemTong = calculateTotalScore(diemTheoTruc, config);
  
  // Trích xuất tổng chi phí thô và loại bỏ nó khỏi trường diemTheoTruc
  const { _tongChiPhi, ...pureAxisScores } = diemTheoTruc;

  return {
    ...room,
    diemTong,
    diemTheoTruc: pureAxisScores,
    tongChiPhiTho: _tongChiPhi
  };
};
