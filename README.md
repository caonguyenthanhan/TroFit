# TroFit 🏠

### *"Tìm phòng trọ khớp với bạn, không chỉ khớp với ví tiền."*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwindcss)](https://tailwindcss.com/)

Hầu hết quyết định thuê phòng trọ hiện nay thường bị chi phối bởi các yếu tố cảm tính nhất thời (anchoring bias - hiệu ứng mỏ neo, ấn tượng ban đầu lúc mới bước vào phòng) hơn là các dữ liệu thực tế và tài chính khách quan. Điều này dẫn đến việc người đi thuê dễ chọn sai phòng trọ vượt quá ngân sách thật, quá xa nơi làm việc, hoặc thiếu đi các tiện nghi cốt lõi. 

**TroFit** ra đời như một web app cá nhân hóa việc chấm điểm và so sánh phòng trọ, kết hợp chặt chẽ giữa tâm lý học hành vi, kinh tế học tài chính cá nhân và mô hình quyết định đa tiêu chí (MCDA).

---

## 🌟 Tại Sao TroFit Khác Biệt?

TroFit không chỉ là một bảng nhập liệu thông thường, ứng dụng áp dụng 3 lớp phương pháp luận khoa học:

1. **Tâm lý học hành vi:** Tích hợp nguyên lý *loss aversion* (hướng tổn thất) bằng cách thiết lập cảnh báo nghiêm trọng khi phòng trọ thiếu đi các yêu cầu bắt buộc, thay vì chỉ cộng/trừ điểm tuyến tính thông thường. Đồng thời, hiển thị trực quan ngân sách mục tiêu như một "mỏ neo khách quan" để triệt tiêu các tác động cảm tính từ chủ nhà.
2. **Kinh tế học tài chính cá nhân:** Áp dụng nguyên lý phân bổ 50/30/20 với khuyến nghị ngân sách thuê nhà tối ưu trong khoảng 15-30% thu nhập hàng tháng. Đồng thời quy đổi thời gian di chuyển (minutes of commute) ra chi phí cơ hội bằng tiền để phản ánh chính xác điểm số Vị trí của phòng trọ.
3. **Mô hình quyết định đa tiêu chí (MCDA):** Ứng dụng mô hình tổng có trọng số (Weighted Sum Model) kết hợp chuẩn hóa động (dynamic normalization) các trục dữ liệu có đơn vị khác nhau (tiền thuê, diện tích m², phút đi xe, boolean...) về cùng thang điểm 1-10 để vẽ biểu đồ so sánh trực quan.

---

## 🚀 Tính Năng Chính

- ⚙️ **Cài đặt trọng số tiêu chí:** Tự do tùy biến trọng số phần trăm của 6 trục chấm điểm sao cho tổng bằng 100% phù hợp với nhu cầu cá nhân.
- 📝 **Khảo sát phòng trực quan:** Form nhập liệu hai cột nhanh chóng ghi nhận đầy đủ chi tiết: giá thuê, khoảng cách di chuyển, phụ phí (điện, nước, gửi xe, dịch vụ, internet), độ rộng, độ thoáng và cảm quan.
- ⚡ **Chấm điểm Live Preview:** Điểm số tổng và điểm 6 trục thành phần được tính toán động và hiển thị ngay lập tức khi bạn thay đổi các giá trị đầu vào.
- 📊 **So sánh biểu đồ Radar:** So sánh trực quan điểm mạnh/yếu của tối đa 5 phòng cùng lúc trên biểu đồ Spider (Radar) nhiều lớp màu.
- 📋 **Bảng đối chiếu thông số thô:** Bảng so sánh chi tiết giúp đối chiếu các khoản phụ phí thô (tiền điện, nước, dịch vụ...) để đưa ra quyết định đàm phán tối ưu.
- 🤖 **Trợ lý AI phân tích:** Xuất dữ liệu JSON kèm prompt viết sẵn để dán trực tiếp vào Claude/ChatGPT/Gemini nhận phân tích ưu/nhược điểm và hướng dẫn thương lượng giá cọc.

---

## 📸 Demo ứng dụng

![Demo](./docs/screenshot.png)
*(Lưu ý cho người dùng: Vui lòng tự chụp màn hình ứng dụng sau khi khởi chạy thành công và lưu vào thư mục `docs/screenshot.png` để hiển thị ở đây).*

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Tầng | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite 8 | Tối ưu hóa hiệu năng render, khởi động nhanh chóng |
| **Styling (CSS)** | TailwindCSS v4 | Giao diện tối màu (dark theme) hiện đại, bo góc mềm mại, glassmorphic |
| **Charting Library** | Recharts | Vẽ biểu đồ Radar động mượt mà và trực quan |
| **Icon Library** | Lucide React | Hệ thống icon tối giản, hiện đại |
| **Storage** | LocalStorage | Lưu trữ dữ liệu hoàn toàn offline trên trình duyệt của người dùng |

---

## 📦 Cài Đặt & Chạy Local

Để chạy ứng dụng TroFit trên máy tính cá nhân, hãy thực hiện theo các lệnh dưới đây:

```bash
# 1. Clone repository từ GitHub
git clone https://github.com/caonguyenthanhan/TroFit.git

# 2. Di chuyển vào thư mục chứa mã nguồn Frontend
cd TroFit/fe

# 3. Cài đặt các gói thư viện dependencies
npm install

# 4. Khởi chạy dev server cục bộ
npm run dev
```

Sau khi khởi chạy, truy cập đường dẫn mặc định [http://localhost:5173](http://localhost:5173) trên trình duyệt. Bạn cũng có thể nhấp đúp trực tiếp vào tệp `scripts/run_fe_dev.bat` để chạy nhanh ứng dụng trên hệ điều hành Windows.

---

## 📂 Cấu Trúc Thư Mục

Mã nguồn được tổ chức theo chuẩn phân tách layer rõ ràng:

```text
TroFit/
  ├── .agents/                    # Cấu hình quy tắc của AI Agent
  │    ├── rules/
  │    │    └── link-ecosystem.md # Tham chiếu hệ sinh thái quy tắc
  │    └── AGENTS.md              # Quy tắc phát triển riêng của dự án
  ├── docs/                       # Tài liệu thiết kế & phân tích
  │    ├── STRUCTURE.md           # Chi tiết cấu trúc thư mục
  │    └── GIT_BRANCHES.md        # Hướng dẫn quy trình nhánh Git
  ├── scripts/                    # Scripts vận hành nhanh trên Windows
  │    └── run_fe_dev.bat         # Script kích hoạt nhanh dev server
  ├── fe/                         # Thư mục mã nguồn Frontend (React + Vite)
  │    ├── public/                # Static assets công khai
  │    ├── src/
  │    │    ├── assets/           # CSS tĩnh, hình ảnh nội bộ
  │    │    ├── components/       # Các components giao diện (Form, Chart, Table...)
  │    │    │    ├── ConfigSettings.jsx
  │    │    │    ├── RoomForm.jsx
  │    │    │    ├── CompareChart.jsx
  │    │    │    ├── CompareTable.jsx
  │    │    │    └── PromptHelper.jsx
  │    │    ├── lib/              # Logic tiện ích cốt lõi (storage, scoring)
  │    │    │    ├── storage.js
  │    │    │    └── scoring.js
  │    │    ├── App.jsx           # Component chính kết hợp các tab
  │    │    ├── index.css         # Điểm khai báo Tailwind CSS v4 & theme
  │    │    └── main.jsx          # Entrypoint của React
  │    ├── package.json
  │    └── vite.config.js
  └── changed_files.md            # Nhật ký lịch sử thay đổi tệp tin
```

---

## 📐 Phương Pháp Luận Chấm Điểm (Methodology)

TroFit chuyển đổi các thuộc tính định lượng và định tính đa dạng về **Thang điểm 1-10** trước khi tính toán điểm tổng hợp:

| Trục chấm điểm | Nguồn dữ liệu | Cách thức tính toán và quy đổi |
| :--- | :--- | :--- |
| **Vị trí** | `thoiGianDenCongTy` | $\le10$ phút = 10đ; $10-20$ phút = 8đ; $20-30$ phút = 6đ; $30-45$ phút = 4đ; $>45$ phút = 2đ. |
| **Chi phí** | `giaThue` + Phụ phí | Tính tổng tiền thực tế hàng tháng. So sánh với ngân sách `nganSachGiaThue` (T) được đặt. Nếu Tổng phí $\le 0.7T \rightarrow$ 10đ; nếu $\ge 1.5T \rightarrow$ 1đ. Ở giữa nội suy tuyến tính. |
| **Tiện ích** | `khongGianXungQuanh` | Thể hiện mức độ tiện nghi xung quanh phòng: `thuan_tien` = 10đ; `binh_thuong` = 6đ; `khong_thuan_tien` = 2đ. |
| **Diện tích** | `dienTichM2` / `doRong` | Nếu nhập m², đối chiếu theo khoảng kỳ vọng $[min, max]$ (mặc định $15-35$m²) để nội suy tuyến tính từ 3 đến 10đ. Nếu không có m², dùng `doRong`: Rộng = 10đ, Vừa = 7đ, Nhỏ = 4đ. |
| **Cảm quan** | `diemCamQuan` | Dựa trên thang điểm cảm quan 1-5 nhân đôi lên thành thang 2-10đ. |
| **Độ thoáng** | `doThoang` | 4 tiêu chí nhị phân (máy lạnh, ban công, giếng trời, cửa sổ). Mỗi tiêu chí được chọn cộng 2.5đ, tối đa 10đ. |

### Tính Điểm Tổng Hợp (`diemTong`):
$$\text{Điểm Tổng} = \sum_{i=1}^{6} (\text{Điểm Tiêu Chí}_i \times \text{Trọng Số}_i)$$
*Trong đó, tổng các trọng số thiết lập phải bằng 1.0 (hoặc 100% trên giao diện).*

---

## 🗺️ Lộ Trình Phát Triển (Roadmap)

- [ ] Tích hợp Google Maps Distance Matrix API để tự động tính toán chính xác thời gian di chuyển.
- [ ] Cho phép upload hình ảnh thực tế phòng trọ và lưu trữ dưới dạng Base64 hoặc IndexedDB.
- [ ] Phân tích độ nhạy (Sensitivity Analysis) nâng cao nhằm chỉ ra các trục điểm đang quyết định sự chênh lệch lớn giữa các lựa chọn.
- [ ] Nhúng trực tiếp API của OpenAI/Claude vào ứng dụng để nhận phân tích/tư vấn AI ngay trong UI thay vì copy JSON.
- [ ] Chia sẻ nhanh link so sánh phòng trọ bằng cách mã hóa trạng thái (encode state) vào URL.

---

## 🤝 Đóng Góp (Contributing)

Vì đây là dự án mã nguồn mở cá nhân nhằm giải quyết bài toán thực tế, mọi ý kiến đóng góp liên quan đến công thức chấm điểm, cải tiến UI/UX hoặc tích hợp AI luôn được chào đón nhiệt tình. Hãy tạo **Issue** hoặc gửi **Pull Request** nếu bạn có ý tưởng cải tiến!

---

## 📄 License

Dự án này được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại tệp [LICENSE](LICENSE) (nếu có).
