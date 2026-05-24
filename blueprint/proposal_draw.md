# TicketBox — Project Proposal

## Vấn đề

Sự bùng nổ của các concert âm nhạc quy mô lớn tại Việt Nam (như *Anh Trai Say Hi, Chị Đẹp Đạp Gió Rẽ Sóng*) với sức chứa hàng chục nghìn khán giả đang làm lộ rõ những điểm yếu chí mạng của các nền tảng bán vé hiện tại. Việc sử dụng các kênh bán vé rời rạc (Zalo OA, Google Form, chuyển khoản thủ công) hoặc các hệ thống monolith cũ kỹ đang gây ra những hậu quả nghiêm trọng:

* **Sập hệ thống (System Crash):** Lượng truy cập khổng lồ đổ dồn vào một thời điểm (Traffic Spikes) làm cạn kiệt tài nguyên máy chủ (Connection Pool, RAM, CPU), dẫn đến tình trạng website treo hoặc sập hoàn toàn trong vài phút đầu mở bán.
* **Trừ tiền nhưng không ra vé (Inconsistent State):** Do độ trễ của cổng thanh toán hoặc lỗi đồng bộ cơ sở dữ liệu, khán giả bị trừ tiền trong tài khoản ngân hàng nhưng hệ thống không ghi nhận việc xuất vé, gây ra sự phẫn nộ và khủng hoảng truyền thông.
* **Tranh chấp và Overbooking:** Xử lý đồng thời (Concurrency) kém khiến nhiều người cùng mua thành công một vị trí ghế cuối cùng.
* **Vấn nạn Scalper Bot (Phe vé):** Thiếu cơ chế giới hạn và chặn request tự động, tạo điều kiện cho bot càn quét toàn bộ vé VIP/SVIP chỉ trong vài giây để bán lại với giá chợ đen gấp nhiều lần.
* **Hỗn loạn tại cổng soát vé:** Sân vận động thường xuyên mất sóng 4G/Wifi do hàng chục nghìn người tập trung. Việc phụ thuộc vào API trực tuyến khiến tiến trình soát vé bị tê liệt, tạo khe hở cho vé giả hoặc vé quét trùng lọt vào.

## Mục tiêu

Dự án TicketBox được xây dựng nhằm số hóa toàn diện quy trình phân phối vé và quản lý sự kiện, với mục tiêu kiến tạo một hệ thống công bằng, minh bạch và có sức chống chịu tải trọng cực đoan.

**Mục tiêu định lượng & Kỹ thuật:**
* **Đảm bảo Uptime:** Hệ thống phải đứng vững và phục vụ mượt mà **80.000 người truy cập đồng thời** trong 5 phút đầu tiên mở bán (70% dồn vào phút đầu).
* **Zero Overbooking:** Đảm bảo tỷ lệ bán trùng vé là **0%**, kể cả khi có hàng chục nghìn người cùng tranh chấp 200 vé SVIP giới hạn.
* **Zero Double-charge:** Đảm bảo **100%** không có giao dịch nào bị trừ tiền hai lần dù mạng chập chờn hoặc người dùng cố tình spam nút thanh toán.
* **Offline Check-in:** Quá trình soát vé tại cổng phải diễn ra dưới **1 giây/vé** và hoạt động hoàn toàn trơn tru ngay cả khi rớt mạng Internet hoàn toàn.

## Người dùng và nhu cầu

Hệ thống phục vụ 3 nhóm tác nhân chính với các nhu cầu chuyên biệt:

1.  **Khán giả (Audience)**
    * *Hành vi:* Tìm kiếm sự kiện, xem sơ đồ chỗ ngồi, mua vé, thanh toán và nhận E-ticket.
    * *Nhu cầu cốt lõi:* Cần một luồng mua vé mượt mà, công bằng (không bị bot tranh giành). Cần sự minh bạch và an tâm tuyệt đối ở khâu thanh toán (thấy rõ trạng thái giao dịch).
2.  **Ban tổ chức (Organizer)**
    * *Hành vi:* Quản trị toàn bộ vòng đời sự kiện (Tạo concert, định giá, mở bán, xem dashboard doanh thu).
    * *Nhu cầu cốt lõi:* Cần hệ thống chịu tải tốt để bảo vệ danh tiếng sự kiện. Cần công cụ tự động hóa các tác vụ tốn thời gian (như đọc file CSV khách mời hàng loạt, dùng AI tóm tắt hồ sơ nghệ sĩ từ PDF).
3.  **Nhân sự soát vé (Checker)**
    * *Hành vi:* Sử dụng thiết bị di động quét mã QR của khán giả tại cổng.
    * *Nhu cầu cốt lõi:* App phải phản hồi tức thì. Không bị gián đoạn công việc khi sân vận động nghẽn mạng. Đảm bảo phát hiện và chặn đứng vé giả hoặc vé đã được sử dụng.

## Phạm vi

**Trong phạm vi đồ án (In-scope):**
* Thiết kế và lập trình hoàn chỉnh kiến trúc **Modular Monolith** kết hợp **Event-Driven**.
* Hiện thực hóa (code thật) các cơ chế kỹ thuật bảo vệ hệ thống: *Rate Limiting (Token Bucket), Idempotency Key (chống trừ tiền 2 lần), Circuit Breaker (Xử lý lỗi bên thứ 3), Redis Lua Script (chống overbooking).*
* Phát triển Backend API (Node.js/NestJS), kết nối cơ sở dữ liệu PostgreSQL, Redis và Message Broker (RabbitMQ).
* Lập trình luồng xử lý bất đồng bộ (Background Workers) cho tác vụ AI PDF OCR và Import CSV.
* Phát triển Mobile App Check-in có tích hợp Local Database (SQLite) để mô phỏng luồng soát vé Offline và cơ chế phân luồng cổng (Gate Segregation).
* Triển khai hạ tầng ở môi trường phát triển cục bộ bằng Docker Compose.

**Ngoài phạm vi đồ án (Out-of-scope):**
* Tích hợp trực tiếp (Call API thật) với hệ thống ngân hàng VNPAY/MoMo thực tế (Hệ thống sẽ dùng Mock/Stub Service để giả lập mạng bị delay/timeout nhằm test cơ chế Circuit Breaker).
* Triển khai hệ thống lên hạ tầng Production phức tạp như Kubernetes Cluster hay Cloud AWS/GCP (Chỉ tập trung vào Architecture và Code logic nghiệp vụ).
* Tự huấn luyện mô hình AI (Sẽ sử dụng các API LLM có sẵn như OpenAI hoặc Gemini).

## Rủi ro và ràng buộc

Quá trình phát triển hệ thống phải đối mặt và giải quyết các ràng buộc kỹ thuật khắt khe:

1.  **Tải trọng đọc đột biến (Read-Heavy Spike):** Ràng buộc không cho phép truy vấn trực tiếp vào PostgreSQL khi 80.000 user cùng tải trang. Bắt buộc phải triển khai Multi-layer Caching (CDN cho SVG và Redis Cache-aside cho thông tin/số vé).
2.  **Tranh chấp vé cường độ cao (Write-Heavy Contention):** Rủi ro thắt cổ chai (bottleneck) nếu dùng SQL Locking (Pessimistic/Optimistic Lock). Ràng buộc phải xử lý chốt vé nguyên tử (Atomic) trên bộ nhớ RAM bằng Redis Lua Script, sau đó lưu trữ bất đồng bộ.
3.  **Cổng thanh toán không ổn định:** Rủi ro hệ thống bị treo toàn tập do cạn kiệt Thread Pool khi API VNPAY/MoMo phản hồi chậm. Bắt buộc áp dụng Circuit Breaker Pattern để ngắt mạch kịp thời và Idempotency Key để chống lặp giao dịch.
4.  **Phân mảnh dữ liệu ngoại tuyến (Split-brain Offline):** Rủi ro khán giả dùng 1 vé giấy quét ở 2 cổng mất mạng khác nhau. Ràng buộc phải giải quyết bằng nghiệp vụ Phân luồng cổng (Gate Segregation) kết hợp đồng bộ hàng loạt (Bulk-sync) thay vì cố gắng tạo mạng cục bộ phức tạp.
5.  **Tích hợp hệ thống bên thứ 3 chậm chạp:** Quá trình OCR PDF bằng AI và đọc CSV diễn ra rất lâu. Ràng buộc tuyệt đối không được xử lý đồng bộ trên main thread. Bắt buộc phải áp dụng kiến trúc Event-Driven, ném task vào RabbitMQ để Background Worker chạy ngầm.