# Cấu Trúc Dự Án (Project Structure)

Dự án tuân theo chuẩn phân tách layer/tier để dễ dàng bảo trì và mở rộng.

```text
/d:/tro
  ├── .agents/                    # Quản lý rule và cấu hình AI Agent
  ├── docs/                       # Tài liệu thiết kế và quy trình
  ├── scripts/                    # Scripts vận hành nhanh (.bat) trên Windows
  ├── fe/                         # Mã nguồn Frontend (React + Vite + TailwindCSS)
  │    ├── src/
  │    │    ├── assets/           # Ảnh, icon tĩnh
  │    │    ├── components/       # Các components giao diện tái sử dụng
  │    │    ├── lib/              # Logic tiện ích (Storage, Chấm điểm)
  │    │    ├── App.jsx           # Điểm vào chính của giao diện
  │    │    ├── index.css         # CSS chính và cấu hình Tailwind
  │    │    └── main.jsx          # Entrypoint của React
  │    ├── package.json
  │    ├── tailwind.config.js
  │    └── vite.config.js
  ├── changed_files.md            # Nhật ký thay đổi file
  └── README.md                   # Tài liệu hướng dẫn sử dụng tổng quan
```

## Ranh giới trách nhiệm (Tier Boundaries)
- **FE (fe/)**: Chịu trách nhiệm hiển thị UI, quản lý state và tương tác của người dùng. Mọi tính toán điểm số được thực hiện trực tiếp trên client để tối ưu độ phản hồi.
- **DATA (fe/src/lib/)**: Quản lý định dạng dữ liệu (JSON schema) và cách lưu trữ (`localStorage`), đảm bảo tính nhất quán của dữ liệu xuất/nhập.
- **SCRIPTS (scripts/)**: Đóng gói các lệnh chạy để người phát triển không cần nhớ các cú pháp dòng lệnh dài dòng.
