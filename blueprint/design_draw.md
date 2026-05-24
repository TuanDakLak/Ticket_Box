# TicketBox — Technical Design

## 1. Kiến trúc tổng thể

Hệ thống TicketBox được thiết kế theo kiến trúc **Modular Monolith (Nguyên khối chia module)** kết hợp với **Event-Driven Architecture (Kiến trúc hướng sự kiện)**. 

* **Kiến trúc Modular Monolith:** Toàn bộ logic nghiệp vụ (Core Logic) được đóng gói và triển khai trên một ứng dụng Backend (Node.js/NestJS) duy nhất. Tuy nhiên, mã nguồn bên trong được phân tách ranh giới (strict boundaries) thành các module độc lập (Auth, Ticketing, Payment, Catalog). Điều này giúp tối ưu tốc độ phát triển, loại bỏ độ trễ mạng (network latency) giữa các service, nhưng vẫn giữ được khả năng bóc tách thành Microservices trong tương lai.
* **Kiến trúc Event-Driven:** Để giải quyết bài toán tải trọng cực đoan (80.000 users/5 phút), hệ thống không xử lý đồng bộ mọi thao tác ghi (Write). Thay vào đó, API Core chỉ tiếp nhận, "chốt đơn" nguyên tử trên RAM (Redis) và ném thông điệp (Event/Message) vào hệ thống Message Broker (RabbitMQ). Các Background Worker sẽ tiêu thụ hàng đợi này một cách tuần tự để ghi xuống Database vật lý.

---

## 2. C4 Diagram

### 2.1. Level 1 — System Context

Sơ đồ ngữ cảnh cấp 1 định vị TicketBox trong bức tranh toàn cảnh: các tác nhân (Actors) sử dụng hệ thống và các hệ thống ngoại vi (External Systems) mà TicketBox phụ thuộc.

```mermaid
C4Context
    title System Context Diagram - TicketBox

    Person(audience, "Khán giả", "Tìm kiếm sự kiện, mua vé, nhận e-ticket QR")
    Person(organizer, "Ban tổ chức", "Tạo sự kiện, cấu hình vé, xem thống kê doanh thu")
    Person(checker, "Nhân sự soát vé", "Quét mã QR tại cổng (yêu cầu hỗ trợ offline)")

    System(ticketbox, "TicketBox System", "Nền tảng số hóa quy trình bán vé và quản lý sự kiện chịu tải cao")

    System_Ext(vnpay_momo, "Cổng thanh toán (VNPAY/MoMo)", "Xử lý giao dịch tài chính")
    System_Ext(mail_sms, "Hệ thống Notification (SendGrid/Zalo)", "Gửi Email, Zalo, SMS nhắc nhở")
    System_Ext(ai_model, "AI LLM API (OpenAI/Gemini)", "OCR PDF và tóm tắt Artist Bio")

    Rel(audience, ticketbox, "Tìm kiếm, đặt vé, thanh toán")
    Rel(organizer, ticketbox, "Quản trị hệ thống")
    Rel(checker, ticketbox, "Đồng bộ vé và Check-in tại cổng")

    Rel(ticketbox, vnpay_momo, "Gửi yêu cầu thanh toán & Nhận Webhook")
    Rel(ticketbox, mail_sms, "Gửi thông báo E-ticket")
    Rel(ticketbox, ai_model, "Gửi text/PDF để tóm tắt")

```

### 2.2. Level 2 — Container

Sơ đồ cấp 2 "mở hộp" hệ thống TicketBox, thể hiện sự phân rã thành các khối hạ tầng (Containers) và Tech Stack cốt lõi được lựa chọn.

```mermaid
C4Container
    title Container Diagram - TicketBox Modular Monolith

    Person(audience, "Khán giả")
    Person(checker, "Nhân sự soát vé")

    Container(web_app, "Web Application", "React/Next.js", "Giao diện SPA cho Khán giả và Ban tổ chức")
    Container(mobile_app, "Mobile Check-in App", "Flutter/Dart", "App soát vé chứa local database hỗ trợ Offline")
    
    Container(cdn, "CDN & S3", "Cloudflare/AWS", "Phân phối sơ đồ SVG (cực nặng) và hình ảnh tĩnh")

    System_Boundary(c1, "TicketBox Monolith Backend") {
        Container(backend_api, "NestJS Backend API", "Node.js/TypeScript", "Xử lý toàn bộ logic đồng bộ: Auth, Catalog, Ticketing, Payment.")
        Container(worker_process, "Background Worker", "Node.js/Python", "Tiến trình chạy ngầm xử lý RabbitMQ Queue, AI PDF, CSV")
    }

    ContainerDb(db, "Primary Database", "PostgreSQL", "Lưu trữ Users, Concerts, Orders, Tickets (Chuẩn ACID)")
    ContainerDb(cache, "Cache & Lock", "Redis", "Lưu Cache dữ liệu tĩnh, chạy Lua Script chốt vé, lưu Idempotency Key 24h")
    ContainerDb(mq, "Message Broker", "RabbitMQ", "Hàng đợi ghi đơn hàng, gửi email, và Delay Queue (10 phút hủy vé)")
    ContainerDb(local_db, "Local Offline DB", "SQLite", "Lưu trữ mã QR băm trên thiết bị di động")

    Rel(audience, web_app, "Truy cập HTTPS")
    Rel(checker, mobile_app, "Sử dụng")

    Rel(web_app, backend_api, "Gọi API (JSON/REST)")
    Rel(web_app, cdn, "Tải tài nguyên tĩnh")
    Rel(mobile_app, backend_api, "Đồng bộ vé (Bulk Sync)")
    Rel(mobile_app, local_db, "Đọc/Ghi tra cứu QR khi mất mạng")

    Rel(backend_api, cache, "Đọc/Ghi Cache, thực thi Lua Script")
    Rel(backend_api, mq, "Publish Events (TicketReserved, PaymentFailed)")
    Rel(worker_process, mq, "Consume Events")
    Rel(worker_process, db, "Ghi chậm (Async Write)")
    Rel(backend_api, db, "Đọc/Ghi dữ liệu lõi")

```

---

## 3. High-Level Architecture Diagram

Sơ đồ này đi sâu vào cách **Dữ liệu luân chuyển (Data Flow)** để giải quyết bài toán tải cao và tích hợp bất đồng bộ.

```mermaid
graph TD
    %% Users
    Client[Khán giả (80k Users)] -->|1. Click Mua Vé| API_Gateway(API Gateway / Rate Limiter)
    
    %% Core Backend
    API_Gateway -->|2. Forward Request| Backend_API(NestJS Core API)
    
    %% High-Speed Layer
    Backend_API <-->|3. Lua Script (Check Limit + Trừ vé)| Redis[(Redis - RAM)]
    
    %% Async Queue
    Backend_API -->|4. Push 'Order.Pending' Event| RabbitMQ{RabbitMQ}
    Backend_API -->|5. Trả về kết quả 'Đang giữ chỗ'| Client
    
    %% Background Workers
    RabbitMQ -->|6. Consume Event| DB_Worker(Order DB Worker)
    RabbitMQ -->|Event 10m Delay| DLX(Dead Letter Exchange - Cancel Order)
    RabbitMQ -->|Event 'Order.Paid'| Notif_Worker(Notification Worker)
    RabbitMQ -->|Event 'AI.Process'| AI_Worker(AI OCR Worker)

    %% Slow Data Layer
    DB_Worker -->|7. Insert DB từ từ| PostgreSQL[(PostgreSQL - Disk)]
    Notif_Worker -->|8. Gọi API Gửi Mail| SendGrid[SendGrid/Zalo]
    AI_Worker -->|9. Gọi LLM| LLM[OpenAI API]

```

---

## 4. Thiết kế Cơ sở dữ liệu

### 4.1. Lựa chọn Database & Trade-offs

Hệ thống chọn **PostgreSQL (Relational Database)** làm cơ sở dữ liệu chính thay vì các giải pháp NoSQL (như MongoDB).

* **Lý do:** Hệ thống bán vé là hệ thống liên quan trực tiếp đến tài chính và tính toàn vẹn dữ liệu. Bất kỳ sự bất đồng bộ (data anomaly) hay đọc ảo (phantom read) nào cũng dẫn đến thảm họa Overbooking. PostgreSQL cung cấp chuẩn **ACID transaction** mạnh mẽ.
* **Đánh đổi:** PostgreSQL có giới hạn về Connection Pool và tốc độ ghi I/O Disk so với NoSQL. Điểm yếu này được khắc phục hoàn toàn bằng kiến trúc Event-Driven (dùng RabbitMQ làm hồ chứa để ghi từ từ).

### 4.2. Schema các Entity chính (ERD)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places"
    CONCERTS ||--o{ TICKET_CATEGORIES : "has"
    CONCERTS ||--o{ ORDERS : "includes"
    ORDERS ||--o{ TICKETS : "contains"
    TICKET_CATEGORIES ||--o{ TICKETS : "belongs_to"
    ORDERS ||--o| PAYMENT_TRANSACTIONS : "paid_via"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
    }
    CONCERTS {
        uuid id PK
        string name
        timestamp start_time
        string status
    }
    TICKET_CATEGORIES {
        uuid id PK
        uuid concert_id FK
        string name
        decimal price
        int total_quantity
        int max_per_user
    }
    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid concert_id FK
        string status "PENDING, PAID, CANCELLED"
        timestamp expires_at
    }
    TICKETS {
        uuid id PK
        uuid order_id FK
        uuid category_id FK
        string qr_code_hash UK
        boolean is_scanned
    }
    PAYMENT_TRANSACTIONS {
        uuid id PK
        uuid order_id FK
        string idempotency_key UK
        jsonb raw_response
        string status
    }

```

---

## 5. Thiết kế kiểm soát truy cập (Access Control)

Hệ thống áp dụng mô hình **RBAC (Role-Based Access Control)** kết hợp **Stateless JWT**.

* **Các nhóm người dùng:** Khán giả (Chỉ xem/mua vé), Ban tổ chức (Tạo sự kiện, xem thống kê), Nhân sự soát vé (Chỉ dùng API đồng bộ/quét vé).
* **Cơ chế xác thực (JWT vs Stateful Session):**
* *Phương án Session:* Lưu session trên RAM/Redis. Nhược điểm: Tốn RAM, mỗi request phải chọc vào Redis để xác thực, dễ nghẽn cổ chai.
* *Phương án JWT (Được chọn):* Mã hóa trực tiếp thông tin `Role` và `Permissions` (VD: `CREATE_CONCERT`) vào payload của JWT.
* *Lợi ích dưới tải cao:* Tại tầng API Gateway/Middleware, hệ thống tự động giải mã chữ ký điện tử (Signature) bằng Secret Key trên RAM và kiểm tra chuỗi permission mà **không cần thực hiện bất kỳ truy vấn nào xuống Database hay Redis**.
* *Trade-off:* JWT không thể thu hồi tức thì (Revoke). Giải pháp: Set TTL cho Access Token cực ngắn (15 phút) và dùng Refresh Token.

---

## 6. Thiết kế các cơ chế bảo vệ hệ thống

Đây là tầng phòng ngự (Shields) thiết yếu để hệ thống sống sót qua "cơn bão" 80.000 users.

### 6.1. Kiểm soát tải đột biến (Traffic Spikes)

* **Vấn đề:** 80.000 khán giả cùng F5 trang và bấm nút "Mua vé" liên tục.
* **Giải pháp 1 (Tầng mạng):** Triển khai thuật toán **Token Bucket** tại API Gateway. Thuật toán này cho phép hệ thống chịu được một đợt "bùng nổ" (burst) request ngắn hạn, nhưng drop các request vượt ngưỡng (VD: giới hạn mỗi IP 10 requests/giây). Hành vi khi vượt ngưỡng: Trả về HTTP 429 (Too Many Requests).
* **Giải pháp 2 (Chống Overbooking - Quan trọng nhất):** Tuyệt đối không dùng DB Locking. Sử dụng **Redis Lua Script** để gom 3 lệnh (Kiểm tra vé trống -> Kiểm tra giới hạn vé của tài khoản -> Trừ vé) thành 1 thao tác nguyên tử (Atomic) chạy đơn luồng trên RAM. Giải quyết bài toán tranh chấp mà không bị Race Condition.

### 6.2. Xử lý cổng thanh toán không ổn định

* **Vấn đề:** Cổng VNPAY/MoMo có thể bị nghẽn, phản hồi mất 30 giây. Nếu Backend đợi, Thread Pool sẽ cạn kiệt, kéo sập toàn bộ hệ thống.
* **Giải pháp:** Áp dụng **Circuit Breaker Pattern (Cầu dao tự ngắt)**.
* **Trạng thái CLOSED:** Hoạt động bình thường. Ghi nhận Error Rate.
* **Trạng thái OPEN:** Kích hoạt nếu tỷ lệ timeout > 50% trong 10 giây. Toàn bộ request thanh toán bị từ chối ngay lập tức (Fast-Fail) mà không cần chờ gửi mạng. Thread được giải phóng tức thì. Áp dụng *Graceful Degradation*, tự động ẩn nút VNPAY và báo bảo trì.
* **Trạng thái HALF-OPEN:** Sau 60s, cho phép 5 request đi qua thăm dò. Nếu thành công -> CLOSED, nếu lỗi -> OPEN lại.

### 6.3. Chống trừ tiền hai lần (Double Charging)

* **Vấn đề:** Khán giả mất kiên nhẫn bấm F5 hoặc bấm nút thanh toán nhiều lần. Khóa Unique ở DB không có tác dụng ngay lập tức do độ trễ I/O.
* **Giải pháp:** Áp dụng **Idempotency Key (Khóa lũy đẳng)**.
1. Frontend sinh mã UUID (Idempotency-Key) gắn vào Header.
2. Backend dùng lệnh `SETNX` (Set if Not eXists) đẩy Key vào Redis với **TTL = 24h**.
3. Nếu Key chưa tồn tại: Cho phép gọi sang VNPAY.
4. Nếu Key đã tồn tại (khán giả bấm đúp): Hệ thống chặn request ngay tại cửa, trả về kết quả giao dịch cũ, chặn đứng yêu cầu trừ tiền thứ 2.

### 6.4. Chiến lược Caching (Giải quyết Read-Heavy)

* **Các đối tượng cần Cache:** Trang chủ, Thông tin chi tiết sự kiện, Số vé còn lại. Sơ đồ chỗ ngồi SVG cực nặng được đẩy ra mạng CDN (Cloudflare).
* **Chiến lược cho Dữ liệu Tĩnh (Thông tin Concert):** Dùng **Cache-Aside**. TTL cấu hình dài (24h). Invalidate chủ động (Write-through) ngay khi Admin bấm cập nhật thông tin sự kiện.
* **Chiến lược cho Dữ liệu Động (Số vé còn lại):** Không dùng Cache-Aside vì sẽ gây độ trễ hiển thị (Stale data). Lưu số vé bằng một biến Counter trong Redis. Biến này tự động giảm ngay khi Redis Lua Script chốt vé thành công, đảm bảo frontend luôn thấy số lượng tồn kho Realtime.

---

## 7. Các quyết định kỹ thuật quan trọng (ADR)

### ADR 1: Thiết kế Cơ chế Check-in Offline (Split-Brain Problem)

* **Vấn đề:** 1 vé giấy in ra 2 bản, mang đến 2 cổng từ đang mất mạng Internet để quét.
* **Lựa chọn:** Giải quyết bằng kỹ thuật (Mesh Network) VS Giải quyết bằng Nghiệp vụ (Gate Segregation).
* **Quyết định:** Chọn **Gate Segregation (Phân luồng cổng)** kết hợp **Local SQLite**.
* **Trade-offs:** Thay vì thiết kế mạng nội bộ phức tạp, ta chia luồng: Gate 1 chỉ quét vé VIP, Gate 2 chỉ vé GA. Buổi sáng, thiết bị ở Gate 1 chỉ fetch danh sách QR Hash của vé VIP vào SQLite. Nếu kẻ gian mang 2 vé VIP đến Gate 1, SQLite đánh dấu `is_scanned = true` sau lần quét đầu và chặn lần hai. Nếu mang sang Gate 2, SQLite Gate 2 không có data -> báo vé giả. Khi mạng phục hồi, App tự động Bulk-sync lên Server.

### ADR 2: SQL Locking vs Redis Lua Script (Giải quyết Race Condition)

* **Lựa chọn 1: Pessimistic Locking (SELECT FOR UPDATE).** DB khóa row dữ liệu vé. Người 1 mua thì 79.999 người phải xếp hàng. **Trade-off:** Cạn kiệt Connection Pool, DB chết ngay lập tức dưới tải 80.000 requests.
* **Lựa chọn 2: Optimistic Locking (Versioning).** 80.000 người cùng đọc, nhưng chỉ 200 người ghi thành công. **Trade-off:** 79.800 người văng lỗi Conflict. Trải nghiệm người dùng (UX) thảm họa.
* **Quyết định:** Chọn **Redis Lua Script + RabbitMQ**.
* **Tại sao:** Redis chạy Single-threaded trên RAM. 80.000 requests được xếp hàng vi mô và xử lý nguyên tử với tốc độ nano giây. Redis trừ vé xong ném Message vào RabbitMQ. PostgreSQL phía sau cứ thong thả lấy Queue ra ghi đĩa (1000 record/s) mà không bao giờ bị nghẽn.

### ADR 3: RabbitMQ vs Kafka cho Message Broker

* **Vấn đề:** Chọn hệ thống điều phối thông điệp bất đồng bộ.
* **Quyết định:** Chọn **RabbitMQ**.
* **Lý do & Đánh đổi:** Kafka chịu tải throughput cao hơn, nhưng overhead lớn và setup phức tạp cho tính năng Hàng đợi trễ (Delay Message). Hệ thống TicketBox yêu cầu tính năng sống còn: "Nếu khán giả không thanh toán sau 10 phút, tự động nhả vé lại". RabbitMQ hỗ trợ native cơ chế **Dead Letter Exchange (DLX)** và **Delay Queue** cực kỳ hoàn hảo cho kịch bản hẹn giờ hủy đơn này.
