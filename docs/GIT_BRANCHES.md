# Quy Quy Trình Quản Lý Nhánh Git (Git Branches & Workflow)

Dự án sử dụng quy trình Git Flow rút gọn phù hợp với dự án nhỏ và phát triển nhanh.

## Các nhánh chính
- `main` / `master`: Nhánh production ổn định. Mỗi commit trên nhánh này đại diện cho một bản phát hành chính thức.
- `develop`: Nhánh tích hợp các tính năng mới đang phát triển.

## Quy ước đặt tên nhánh tính năng (Feature branches)
Khi phát triển tính năng mới hoặc sửa lỗi, tạo nhánh từ `develop`:
- Tính năng mới: `feature/ten-tinh-nang` (ví dụ: `feature/radar-chart`, `feature/export-json`)
- Sửa lỗi: `bugfix/ten-loi` (ví dụ: `bugfix/local-storage-sync`)
- Tài liệu/Dọn dẹp: `chore/ten-task` (ví dụ: `chore/update-readme`)

## Quy trình tích hợp
1. Tạo nhánh từ `develop`.
2. Code và test trên nhánh cục bộ.
3. Tạo Pull Request (PR) vào `develop`.
4. Review code, merge PR vào `develop`.
5. Khi ổn định, tạo PR từ `develop` vào `main`.
