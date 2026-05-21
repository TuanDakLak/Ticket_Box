## 📅 SPRINT 1: SETUP DỰ ÁN, KẾT NỐI CLOUD & CORE API (NGÀY 1 - NGÀY 7)

### 📌 Epic 1: Thiết kế hệ thống & Thiết lập Hạ tầng (DevOps + Lead)

#### 🎫 Issue 1.1: Hoàn thiện Tài liệu Thiết kế Kiến trúc (Blueprint)

* **Sub-issue 1.1.1: Viết đề xuất dự án (`proposal.md`)**
* *Mô tả:* Tổng hợp bối cảnh các concert tại Việt Nam, nêu rõ mục tiêu chịu tải 80.000 user/5 phút, định vị phạm vi và rủi ro.
* *Yêu cầu hoàn thành:* Hoàn thành file markdown, văn phong mạch lạc, đúng template OpenSpec.


* **Sub-issue 1.1.2: Vẽ sơ đồ C4 Diagram Level 1 & 2**
* *Mô tả:* Vẽ sơ đồ phân rã hệ thống. Level 2 phải thể hiện rõ các Container (Vercel, Railway App, Railway PostgreSQL, Railway Redis, AI API).
* *Yêu cầu hoàn thành:* Xuất ảnh định dạng PNG độ nét cao, nhúng trực tiếp vào tài liệu `design.md`.



#### 🎫 Issue 1.2: Thiết lập môi trường Cloud & CI Pipeline

* **Sub-issue 1.2.1: Khởi tạo Project Monorepo & Cấu hình GitHub Actions**
* *Mô tả:* Cấu hình cây thư mục chuẩn (`blueprint/`, `backend/`, `frontend/`). Viết file `.github/workflows/ci.yml`.
* *Yêu cầu hoàn thành:* Mỗi khi tạo Pull Request, GitHub Actions phải tự động chạy lệnh kiểm tra lỗi cú pháp (Lint) và build thử nghiệm thành công.


* **Sub-issue 1.2.2: Cấu hình Môi trường Live trên Vercel & Railway**
* *Mô tả:* Khởi tạo DB PostgreSQL và Redis trên Railway. Kết nối tự động deploy branch `main`: Backend lên Railway, Frontend lên Vercel.
* *Yêu cầu hoàn thành:* Có link domain live dạng *.vercel.app và *.railway.app hoạt động, kết nối được biến môi trường (`ENV`) giữa hai bên mà không lộ mật khẩu.



---

### 📌 Epic 2: Quản lý Định danh & Phân quyền (RBAC)

#### 🎫 Issue 2.1: Phát triển module Authentication phía Backend

* **Sub-issue 2.1.1: Thiết kế Schema bảng User và Role**
* *Mô tả:* Tạo migration định nghĩa thực thể User, Password (bắt buộc băm bằng bcrypt/argon2), và liên kết phân quyền với 3 Roles: `Khán giả`, `Ban tổ chức`, `Nhân sự soát vé`.
* *Yêu cầu hoàn thành:* Script chạy migration thành công trên DB PostgreSQL mà không lỗi ràng buộc.


* **Sub-issue 2.1.2: Viết API Đăng nhập và Middleware RBAC**
* *Mô tả:* Viết API `/api/v1/auth/login` cấp mã bảo mật JWT (chứa thông tin Role). Viết Middleware kiểm tra quyền truy cập ở các Endpoint.
* *Yêu cầu hoàn thành:* Trả về JWT hợp lệ. Chặn các request không đúng quyền bằng mã lỗi HTTP `403 Forbidden`.



#### 🎫 Issue 2.2: Xây dựng Giao diện Xác thực phía Frontend

* **Sub-issue 2.2.1: Phát triển Form Đăng nhập & Đăng ký**
* *Mô tả:* Xây dựng UI form sử dụng Tailwind CSS mượt mà tại thư mục `frontend/src/features/auth`.
* *Yêu cầu hoàn thành:* Validate dữ liệu ở Client (định dạng email, độ dài mật khẩu), lưu mã JWT vào LocalStorage/Cookie sau khi đăng nhập thành công.



---

### 📌 Epic 3: Danh mục Concert công khai

#### 🎫 Issue 3.1: API hiển thị thông tin sự kiện

* **Sub-issue 3.1.1: Xây dựng API lấy danh sách và chi tiết Concert**
* *Mô tả:* Viết API công khai `/api/v1/concerts` và `/api/v1/concerts/:id`.
* *Yêu cầu hoàn thành:* Trả về JSON đầy đủ thông tin: Tên concert, nghệ sĩ, thời gian, địa điểm và danh sách các loại vé hiện có kèm giá bán.



#### 🎫 Issue 3.2: Giao diện hiển thị phía Khán giả

* **Sub-issue 3.2.1: Thiết kế giao diện Trang chủ & Trang chi tiết Concert**
* *Mô tả:* Xây dựng giao diện hiển thị dạng Grid/Card cho trang chủ và layout chi tiết cho trang con theo cấu trúc *feature-based*.
* *Yêu cầu hoàn thành:* Gọi API từ Railway thành công, render dữ liệu động mượt mà, giao diện Responsive trên cả điện thoại và máy tính.



---

## 🚀 SPRINT 2: LUỒNG MUA VÉ, CHỊU TẢI CAO & BẢO VỆ HỆ THỐNG (NGÀY 8 - NGÀY 14)

### 📌 Epic 4: Thiết kế Sơ đồ chỗ ngồi tương tác (SVG)

#### 🎫 Issue 4.1: Tích hợp sơ đồ ghế thông minh

* **Sub-issue 4.1.1: Xử lý và hiển thị file SVG động trên Frontend**
* *Mô tả:* Nhúng sơ đồ SVG các khu vực GA, VIP, SVIP... vào trang đặt vé. Đính kèm sự kiện click vào từng vùng ghế dựa trên mã định danh ID.
* *Yêu cầu hoàn thành:* Thay đổi màu sắc khu vực theo trạng thái (Ví dụ: Đỏ = Hết vé, Xanh = Còn vé). Khi hover hiển thị thông tin loại vé và giá tiền.



---

### 📌 Epic 5: Xử lý Đặt vé dưới tải cao (High-Load Booking Core)

#### 🎫 Issue 5.1: Xử lý tranh chấp đặt vé (Ngăn chặn Overbooking)

* **Sub-issue 5.1.1: Cài đặt Cơ chế Giới hạn số lượng vé Per-User bằng Redis**
* *Mô tả:* Trước khi cho phép tạo đơn hàng, hệ thống phải kiểm tra tổng số vé user đó đã mua trên Redis xem có vượt quá cấu hình tối đa (Ví dụ: tối đa 2 vé SVIP) hay không.
* *Yêu cầu hoàn thành:* Đảm bảo kiểm tra nhanh gọn, không bị lách luật kể cả khi người dùng dùng bot cố tình gửi nhiều request đồng thời cùng một miligiây.


* **Sub-issue 5.1.2: Triển khai Redis Distributed Lock hoặc Lua Script để giữ chỗ**
* *Mô tả:* Khi user bấm đặt vé, Backend dùng Redis Lock hoặc vận hành Lua Script trừ số lượng vé khả dụng tạm thời trong bộ nhớ cache để đảm bảo tính nguyên tử (Atomicity).
* *Yêu cầu hoàn thành:* Tuyệt đối không để xảy ra tình trạng 2 người dùng mua cùng một tấm vé cuối cùng (Race Condition). Trả về mã lỗi ngay nếu vé đã bị người khác khóa giữ chỗ.



---

### 📌 Epic 6: Tích hợp cổng thanh toán an toàn

#### 🎫 Issue 6.1: Hiện thực hóa luồng thanh toán không trùng lặp

* **Sub-issue 6.1.1: Xây dựng cơ chế Idempotency Key**
* *Mô tả:* Frontend tự động sinh một mã Unique Key (UUID) cho mỗi phiên bấm nút đặt vé. Backend lưu mã này vào Redis với thời gian hết hạn (TTL) nhất định.
* *Yêu cầu hoàn thành:* Nếu nhận được request trùng Idempotency Key, Backend trả về ngay kết quả xử lý của request trước đó, không tạo thêm hóa đơn mới trong DB, tránh trừ tiền 2 lần.


* **Sub-issue 6.1.2: Giả lập Cổng thanh toán kết hợp Circuit Breaker**
* *Mô tả:* Viết luồng giả lập Webhook gọi sang VNPAY/MoMo. Cài đặt cơ chế Circuit Breaker (sử dụng thư viện hoặc viết middleware).
* *Yêu cầu hoàn thành:* Nếu cổng thanh toán lỗi liên tục vượt ngưỡng cấu hình, mạch sẽ chuyển sang trạng thái **Open**, hệ thống tự động từ chối luồng thanh toán ngay lập tức để bảo vệ tài nguyên backend (Graceful Degradation) mà không làm sập các tính năng xem thông tin concert.



---

### 📌 Epic 7: Tối ưu Caching hệ thống

#### 🎫 Issue 7.1: Chiến lược Cache-aside giảm tải Database

* **Sub-issue 7.1.1: Triển khai Cache cho API thông tin sự kiện**
* *Mô tả:* Lưu thông tin ít thay đổi (Mô tả concert, sơ đồ khu vực) vào Redis với TTL dài (ví dụ: 1 tiếng).
* *Yêu cầu hoàn thành:* Request đọc thông tin không truy vấn trực tiếp vào PostgreSQL, giảm tải tối đa cho DB.


* **Sub-issue 7.1.2: Đồng bộ dữ liệu số vé còn lại theo thời gian thực**
* *Mô tả:* Lưu số lượng vé khả dụng vào Redis với TTL ngắn hoặc cấu hình cơ chế chủ động xóa cache (Invalidate) ngay khi có giao dịch mua vé thành công.
* *Yêu cầu hoàn thành:* Số lượng vé hiển thị trên giao diện của khán giả phản ánh khớp chính xác tương đối với thực tế trong DB.



---

## 🏁 SPRINT 3: SOÁT VÉ OFFLINE, AI ARTIST, CSV SYNCHRONIZATION & NGHIỆM THU (NGÀY 15 - NGÀY 21)

### 📌 Epic 8: Ứng dụng soát vé tại sự kiện (Check-in Module)

#### 🎫 Issue 8.1: Xây dựng tính năng quét mã QR & Chế độ Offline

* **Sub-issue 8.1.1: Phát triển giao diện Web/Mobile App dành cho nhân sự soát vé**
* *Mô tả:* Xây dựng trang riêng cho Role `Nhân sự soát vé`, tích hợp thư viện quét camera đọc mã QR code từ e-ticket của khán giả.
* *Yêu cầu hoàn thành:* Nhận diện mã nhanh, hiển thị trạng thái Vé hợp lệ / Vé không hợp lệ / Vé đã sử dụng.


* **Sub-issue 8.1.2: Triển khai Lưu trữ cục bộ & Cơ chế đồng bộ Offline (Sync)**
* *Mô tả:* Khi mất mạng, app soát vé tự động chuyển sang Offline mode, lưu vết lịch sử quét kèm dấu mốc thời gian (`scanned_at`) vào LocalStorage hoặc IndexedDB. Khi mạng khôi phục, tự động đẩy dữ liệu lên đồng bộ với Server.
* *Yêu cầu hoàn thành:* Server xử lý đối soát chặt chẽ. Nếu một vé bị quét hai lần ở trạng thái offline tại hai máy khác nhau, server chỉ chấp nhận bản ghi có timestamp quét sớm nhất, hủy bỏ các lượt quét sau để ngăn chặn hành vi gian lận.



---

### 📌 Epic 9: Tích hợp thông minh AI & Đồng bộ Dữ liệu một chiều

#### 🎫 Issue 9.1: Xử lý hồ sơ nghệ sĩ bằng AI (AI Artist Bio)

* **Sub-issue 9.1.1: Viết module xử lý File PDF và tích hợp mô hình AI**
* *Mô tả:* Ban tổ chức tải lên file PDF (Press kit nghệ sĩ). Backend tiếp nhận, trích xuất văn bản thô, làm sạch và gửi payload sang API của Gemini/OpenAI với prompt yêu cầu tóm tắt ngắn gọn.
* *Yêu cầu hoàn thành:* Kết quả tóm tắt trả về được lưu vào DB và hiển thị mượt mà trên trang thông tin chi tiết concert.



#### 🎫 Issue 9.2: Đồng bộ danh sách khách mời VIP từ file CSV

* **Sub-issue 9.2.1: Viết Background Job xử lý import file CSV**
* *Mô tả:* Phát triển tính năng upload file CSV danh sách khách mời. Backend sử dụng cơ chế xử lý luồng (Stream) hoặc Background Worker để xử lý file lớn mà không nghẽn luồng chính.
* *Yêu cầu hoàn thành:* Tự động lọc bỏ các dòng dữ liệu lỗi định dạng, bỏ qua bản ghi trùng lặp, cập nhật danh sách vào bảng Guest List trong DB để phục vụ soát vé tại cổng VIP.



---

### 📌 Epic 10: Đóng gói dữ liệu mẫu, Quay Video Demo & Nộp bài

#### 🎫 Issue 10.1: Chuẩn bị Dữ liệu mẫu & Tài liệu chuyển giao

* **Sub-issue 10.1.1: Viết script Seed Data hoàn chỉnh**
* *Mô tả:* Viết script tạo sẵn cấu trúc dữ liệu cho 4 concert chuẩn đề bài yêu cầu: *Anh Trai Say Hi, Anh Trai Vượt Ngàn Chông Gai, Em Xinh Say Hi, Chị Đẹp Đạp Gió Rẽ Sóng* với đầy đủ các phân khu vé (SVIP, VIP, GA...).
* *Yêu cầu hoàn thành:* Chạy lệnh seed dữ liệu thành công trên Cloud Railway, hiển thị đầy đủ ngay sau khi khởi chạy.


* **Sub-issue 10.1.2: Viết tài liệu `README.md` & Đóng gói Blueprint**
* *Mô tả:* Viết tài liệu hướng dẫn chấm bài chi tiết: kèm link deploy live trên Vercel/Railway, tài khoản demo cho 3 nhóm quyền, hướng dẫn test cục bộ bằng lệnh `docker-compose up`. Tổ chức gọn gàng thư mục `blueprint/`.
* *Yêu cầu hoàn thành:* Giảng viên có thể truy cập link live thao tác kiểm tra được ngay mà không cần cấu hình gì thêm.



#### 🎫 Issue 10.2: Sản xuất Video Clip kỹ thuật (Nghiệm thu)

* **Sub-issue 10.2.1: Quay màn hình demo tính năng & Giải trình Code**
* *Mô tả:* Quay clip thời lượng ngắn gọn, tập trung chứng minh các giải pháp chịu tải cao hoạt động thực tế (vị trí code viết Redis Lock, logic Idempotency Key, quét QR offline, tích hợp AI).
* *Yêu cầu hoàn thành:* Video xuất ra đúng chuẩn kỹ thuật của giảng viên: Độ phân giải FullHD (1080p), định dạng file MP4, bitrate duy trì khoảng 720 kbps, hiển thị rõ khung hình camera của thành viên thuyết trình.