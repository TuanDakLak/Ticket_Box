# TÀI LIỆU RESEARCH: LỰA CHỌN KIẾN TRÚC HỆ THỐNG TICKETBOX (MODULAR MONOLITH + EVENT-DRIVEN)

## 1. CÁC "NỖI ĐAU" TỪ REQUIREMENT QUYẾT ĐỊNH KIẾN TRÚC
Trước khi vạch ra kiến trúc, chúng ta cần nhìn thẳng vào các giới hạn vật lý và nghiệp vụ mà hệ thống phải chịu đựng:
- **Tải trọng cực đoan (Traffic Spike):** 80.000 người truy cập trong 5 phút đầu mở bán, 70% dồn vào phút đầu tiên. Backend API không được phép sập.
- **Tranh chấp dữ liệu (High Concurrency Write):** 200 vé SVIP nhưng hàng chục nghìn người tranh nhau. Tuyệt đối không có chuyện 2 khán giả nhận cùng 1 vé cuối cùng.
- **Điểm mù bên thứ 3 (3rd-party Failures):** Cổng VNPAY/MoMo có thể sập. Luồng mua vé phải xử lý được timeout, trong khi các tính năng xem concert khác vẫn phải hoạt động bình thường.
- **Tác vụ nặng & Chậm (Heavy/Slow I/O):** Xử lý file PDF bằng AI Model và đọc file CSV khách mời mà không làm block hệ thống.

---

## 2. ĐÁNH GIÁ CÁC MÔ HÌNH KIẾN TRÚC (ARCHITECTURAL OPTIONS)

### Option 1: Monolith Truyền thống (Kiến trúc Nguyên khối đồng bộ)
- **Cách hoạt động:** Tất cả API (từ xem vé, thanh toán đến xử lý AI) nằm chung một khối code và xử lý đồng bộ.
- **Nhược điểm chí mạng:** Luồng mua vé và luồng xử lý nền (AI/CSV) tranh giành cùng tài nguyên. Khi tải đột biến, hệ thống dễ nghẽn thread pool, trễ I/O, kéo theo sập toàn bộ trải nghiệm mua vé.
- **Kết luận:** **LOẠI BỎ** vì không đảm bảo được độ ổn định dưới tải cao.

### Option 2: Modular Monolith kết hợp Event-Driven - ĐƯỢC CHỌN
- **Cách hoạt động:** Vẫn là một ứng dụng backend duy nhất, nhưng chia module rạch ròi (Auth, Catalog, Ticketing, Payment, Notification, Check-in). Các tác vụ ghi nặng hoặc chậm được đẩy vào RabbitMQ để Background Worker xử lý bất đồng bộ.
- **Lý do chọn:**
   - Giảm độ phức tạp vận hành so với microservices, phù hợp nguồn lực và phạm vi đồ án.
   - Giữ được hiệu năng của monolith (không có network latency giữa service) nhưng vẫn tách module rõ ràng.
   - Dễ tiến hóa: có thể bóc tách từng module thành service độc lập khi nhu cầu mở rộng tăng lên.

### Option 3: Microservices (định hướng tương lai)
- **Mục tiêu:** Khi quy mô tăng mạnh và cần scale độc lập từng module, có thể tách dần thành các service riêng.
- **Kết luận:** **Không chọn cho hiện tại**, nhưng giữ như hướng mở rộng dài hạn.

---

## 3. MAP KIẾN TRÚC MODULAR MONOLITH + EVENT-DRIVEN VÀO REQUIREMENT (TRACEABILITY)

Khi áp dụng mô hình này, chúng ta có lời giải phù hợp cho các bài toán trọng yếu:

1. **Requirement "Tải trọng đột biến 80.000 users"**
   - *Kiến trúc giải quyết:* Redis Lua Script chốt vé nguyên tử trên RAM + RabbitMQ xử lý ghi bất đồng bộ. Caching cho dữ liệu đọc nhiều giúp giảm tải DB.

2. **Requirement "Tranh chấp vé và overbooking"**
   - *Kiến trúc giải quyết:* Kiểm tra giới hạn per-user và trừ vé trong một thao tác nguyên tử trên Redis, tránh race condition.

3. **Requirement "VNPAY/MoMo sập không kéo sập hệ thống"**
   - *Kiến trúc giải quyết:* Circuit Breaker ở module Payment để fail-fast, các module khác vẫn phục vụ đọc thông tin concert bình thường.

4. **Requirement "Xử lý tác vụ nặng AI & CSV"**
   - *Kiến trúc giải quyết:* Event-Driven: đẩy công việc vào RabbitMQ để Background Worker xử lý, không block luồng mua vé.

5. **Requirement "Soát vé offline"**
   - *Kiến trúc giải quyết:* Module Check-in đồng bộ danh sách QR theo gate, lưu cục bộ và bulk-sync khi có mạng.