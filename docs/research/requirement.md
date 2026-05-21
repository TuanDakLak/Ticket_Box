## KIẾN TRÚC TỔNG THỂ (HIGH-LEVEL ARCHITECTURE)

Với quy mô hệ thống xử lý lượng truy cập lớn và đột biến, kiến trúc **Microservices** hoặc **Modular Monolith** kết hợp với **Event-Driven Architecture** là phù hợp nhất.

- **API Gateway**: Xử lý Authentication, Rate Limiting, routing request.
- **Core Services**: `Concert Service` (quản lý thông tin), `Ticketing Service` (chọn chỗ, giữ chỗ), `Payment Service` (thanh toán), `Notification Service` (thông báo).
- **Message Broker**: RabbitMQ hoặc Kafka để xử lý hàng đợi mua vé và giao tiếp bất đồng bộ.
- **Database**: PostgreSQL (cho ACID transactions liên quan đến tiền/vé), Redis (cho Caching, Locking, Rate Limiting).

---

## 1. XEM VÀ MUA VÉ (VIEW & BUY TICKETS)

Đây là luồng quan trọng nhất và chịu tải cao nhất của hệ thống.

### Vấn đề cần giải quyết:

1.  **Trang chủ và trang chi tiết bị quá tải:** Hàng nghìn request/giây đọc dữ liệu ít thay đổi.

2.  **Tranh chấp vé (Concurrency):** Đảm bảo không có 2 người mua cùng 1 vé cuối cùng.

3.  **Giới hạn vé per-user:** Kiểm soát số vé tối đa mỗi tài khoản được mua dưới tải cao.

### Đánh giá phương án & Trade-offs:

**A. Giải quyết Tải trọng đọc (Read Heavy):**

- **Phương án 1 (Truy vấn thẳng DB):** Rất dễ code nhưng sẽ sập ngay giây đầu tiên.

- **Phương án 2 (Cache-aside với Redis):** Cache thông tin concert và số lượng vé.

- _Trade-off:_ Số lượng vé trong Redis có thể bị "lag" so với thực tế (Eventual Consistency).
- _Đề xuất:_ Dùng Redis. Thông tin concert (tên, giá, SVG) set TTL dài (vài giờ). Số vé còn lại set TTL ngắn (vài giây) hoặc cập nhật chủ động (Write-through) mỗi khi có vé thanh toán thành công. Các file tĩnh (Sơ đồ SVG, hình ảnh) đẩy lên CDN.

**B. Giải quyết Tranh chấp vé & Giới hạn per-user:**

- **Phương án 1 (Pessimistic Locking trong SQL - `SELECT FOR UPDATE`):** Đảm bảo chính xác 100% dữ liệu. _Trade-off:_ Gây lock database, thắt cổ chai toàn hệ thống, database sẽ sập khi có 80.000 người truy cập.

- **Phương án 2 (Optimistic Locking):** Dùng versioning. _Trade-off:_ Sẽ có hàng chục nghìn request bị từ chối và trả về lỗi, trải nghiệm người dùng (UX) rất tệ.
- **Phương án 3 (Redis + Lua Script + Message Queue):** (Khuyên dùng)
- Sử dụng **Lua Script** trong Redis để thực hiện nguyên tử (atomic) 3 việc cùng lúc: Kiểm tra giới hạn vé của user -> Kiểm tra vé còn trống -> Trừ số lượng vé trống & Tăng số vé user đã mua.

- Nếu Redis trả về OK, đẩy request vào Message Queue (RabbitMQ) và báo cho user "Đang xử lý/Đang giữ chỗ".
- Worker đọc Queue và insert vào PostgreSQL (đảm bảo DB chỉ ghi với tốc độ ổn định, không bị nghẽn).

---

## 2. XỬ LÝ THANH TOÁN (PAYMENTS)

Luồng thanh toán tích hợp bên thứ ba (VNPAY, MoMo) thường tiềm ẩn rủi ro về độ ổn định.

### Vấn đề cần giải quyết:

1.  **Cổng thanh toán lỗi:** Không kéo sập các dịch vụ khác (xem concert, check-in).

2.  **Trừ tiền hai lần:** Do mạng rớt hoặc user bấm F5 liên tục.

### Đánh giá phương án & Trade-offs:

- **Xử lý tích hợp bên thứ ba:** Sử dụng **Circuit Breaker Pattern** (có thể dùng thư viện như Resilience4j). Nếu gọi API MoMo thất bại liên tục 50% trong 10 giây -> Chuyển Circuit Breaker sang trạng thái **Open**. Lúc này hệ thống tự động ẩn nút thanh toán MoMo (Graceful Degradation) thay vì để request treo gây tràn RAM.

- Chống trừ tiền hai lần (Idempotency):

- Mỗi khi bấm nút "Thanh toán", frontend sinh ra một mã `Idempotency-Key` (UUID) gắn vào Header.

- Backend nhận request, lưu key này vào Redis với TTL = 24h.
- Nếu user bấm F5, backend thấy key đã tồn tại -> không tạo giao dịch mới mà trả về kết quả của giao dịch cũ.

---

## 3. THÔNG BÁO (NOTIFICATIONS)

Hệ thống cần gửi email, app notification và mở rộng sang Zalo, SMS trong tương lai.

### Giải pháp kỹ thuật:

- **Design Pattern:** Sử dụng **Strategy Pattern** và **Factory Pattern**. Định nghĩa interface `INotificationSender`. Các class thực thi: `EmailSender`, `ZaloSender`, `SMSSender`. Khi cần thêm kênh mới, chỉ cần viết thêm class mà không sửa core logic.

- **Kiến trúc:** Sử dụng **Pub/Sub**. Ticketing Service bắn ra event `OrderSuccess`. Notification Service lắng nghe event này để gửi thông báo.
- Nhắc nhở tự động 24h: Sử dụng Cronjob (Quartz, Celery) quét database mỗi giờ để tìm concert sắp diễn ra; hoặc dùng tính năng **Delay Message/Dead Letter Queue** của RabbitMQ (hẹn giờ message sau X ngày mới đẩy vào queue).

---

## 4. QUẢN TRỊ VÀ KIỂM SOÁT TRUY CẬP (ADMIN & RBAC)

Hệ thống có 3 role: Khán giả, Ban tổ chức, Nhân sự soát vé.

### Giải pháp kỹ thuật:

- **Mô hình (RBAC):** Role-Based Access Control.

- Bảng DB: `Users`, `Roles` (Admin, Organizer, Checker, User), `Permissions` (View_Stats, Edit_Concert, Scan_Ticket), và bảng trung gian `Role_Permissions`.

- **Stack:** JSON Web Token (JWT).
- Khi login, mã hóa Role/Permissions vào payload của JWT.
- Tại API Gateway hoặc Middleware, kiểm tra token: Yêu cầu API `/admin/concerts` phải có permission `Edit_Concert`. Cách này giúp không phải query DB liên tục để check quyền.

---

## 5. SOÁT VÉ OFFLINE TẠI SỰ KIỆN (OFFLINE CHECK-IN)

Mạng tại sân vận động thường rất yếu hoặc mất kết nối.

### Vấn đề cần giải quyết:

Ghi nhận soát vé không cần mạng, đồng bộ khi có mạng, chống quét 1 vé 2 lần.

### Đánh giá phương án & Trade-offs:

- **Quy trình:**

1. **Pre-fetch:** Buổi sáng trước sự kiện, app soát vé của nhân sự tải toàn bộ danh sách mã QR băm (hashed QR) của concert đó về database cục bộ trên điện thoại (SQLite / Room).
2. **Offline Scan:** Quét QR -> Kiểm tra trong SQLite. Nếu hợp lệ -> Đánh dấu `is_scanned = true`, lưu timestamp.
3. **Sync:** Có một Background Worker trong app liên tục ping server. Khi có mạng, tự động đẩy các bản ghi đã quét lên server qua một API bulk-update.

- **Trade-off về xung đột dữ liệu (Conflict):** Nếu 1 khán giả in 2 vé giấy, đưa cho 2 người ở 2 cổng khác nhau (cả 2 cổng đều đang mất mạng).
- _Cách giải quyết nghiệp vụ:_ Yêu cầu chia cổng (Gate 1 chỉ quét vé VIP, Gate 2 chỉ vé GA). Như vậy 1 vé không thể bị quét trùng ở 2 thiết bị khác nhau.

---

## 6. ĐỒNG BỘ DỮ LIỆU & TÍCH HỢP NGOÀI

Các tính năng như tải PDF tạo AI bio và đọc file CSV khách mời.

### Giải pháp kỹ thuật:

- Đồng bộ CSV khách mời (Tích hợp 1 chiều): \* Dùng Cronjob đọc file định kỳ.

- Để không block main thread và không chết khi file quá lớn: Đọc file -> Validate -> Cắt nhỏ (Chunking) thành từng batch (ví dụ 500 dòng/batch) -> Đẩy vào Queue.
- Worker lấy từng batch ghi vào DB bằng lệnh **Upsert** (`INSERT ... ON CONFLICT DO UPDATE` trong PostgreSQL) để tránh lỗi trùng lặp dữ liệu mà không cần xóa dữ liệu cũ.

- AI Artist Bio: Quá trình OCR PDF và gọi LLM API mất nhiều thời gian (vài chục giây). Bắt buộc phải xử lý bất đồng bộ qua Message Queue. Ban tổ chức upload file -> Trả về ID Job -> Frontend dùng Long-polling hoặc WebSocket đợi kết quả trả về từ AI.

---

## TỔNG KẾT BẢO VỆ HỆ THỐNG (SYSTEM PROTECTION)

Để chống chọi với tải trọng 80.000 users, bạn cần 4 chốt chặn (Shields):

1.  **Chặn ở Cửa (API Gateway):** Rate Limiting theo thuật toán **Token Bucket** (cho phép bùng nổ truy cập ngắn hạn nhưng vẫn giới hạn ở ngưỡng an toàn).

2.  **Chặn ở Ứng dụng (Virtual Waiting Room):** Khi mở bán vé SVIP, không cho 80.000 người gọi API mua vé cùng lúc. Hàng vào hàng đợi, hệ thống phát "số thứ tự" qua WebSocket/Polling. Chỉ những người đến lượt mới hiện nút Mua.
3.  **Chặn ở Network/Bên thứ 3:** Circuit Breaker ngắt kết nối với VNPAY nếu hệ thống này timeout liên tục.

4.  **Chặn ở Data Layer:** Caching với Redis để khiên đỡ cho PostgreSQL; Lua script cho thao tác nguyên tử (atomic).
