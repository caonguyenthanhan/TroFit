# Project Rules - TroScorer

Chào mừng đến với dự án **TroScorer** - Ứng dụng điền và chấm điểm phòng trọ. Đây là các quy tắc dành riêng cho dự án này.

## Quy định chung
- **Frontend-only**: Không dùng backend/database cho MVP. Mọi dữ liệu phải lưu trong `localStorage`.
- **Key LocalStorage**:
  - Danh sách phòng trọ: `tro-list` (mảng các Object phòng trọ).
  - Cấu hình chấm điểm & trọng số: `tro-config`.
- **Độ chuẩn hóa (Normalized Scores)**: Tất cả các tiêu chí con (Vị trí, Chi phí, Tiện ích, Diện tích, Cảm quan, Độ thoáng) phải được chuẩn hóa về thang điểm **1 đến 10** trước khi vẽ biểu đồ Radar hoặc tính điểm tổng.
- **Tính toán điểm tổng**: Phải sử dụng công thức trung bình có trọng số (weighted average). Tổng các trọng số phải bằng 1 (hoặc 100% trong giao diện cấu hình).

## Quy chuẩn giao diện (TailwindCSS)
- Sử dụng bảng màu cao cấp: Slate, Violet, Indigo, Emerald (cho các điểm cao/nút tích cực).
- Hỗ trợ Responsive hoàn hảo trên thiết bị di động (vì người dùng đi xem phòng trọ sẽ dùng điện thoại là chủ yếu).
- Hiển thị trực quan: Các nút sao chép (copy), tải xuống (export), tải lên (import) rõ ràng, thân thiện.
