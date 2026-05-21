# 🗄️ TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU TỔNG THỂ (MASTER DB SCHEMA)

## 1. SƠ ĐỒ THỰC THỂ LIÊN KẾT (OVERALL ERD)

```mermaid
erDiagram
    %% MODULE: AUTH & RBAC
    USERS ||--o{ USER_ROLES : "has"
    ROLES ||--o{ USER_ROLES : "assigned_to"
    ROLES ||--o{ ROLE_PERMISSIONS : "contains"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "assigned_to"

    %% MODULE: CATALOG (CONCERT)
    CONCERTS ||--o{ TICKET_CATEGORIES : "has"
    
    %% MODULE: TICKETING & ORDERS
    USERS ||--o{ ORDERS : "places"
    CONCERTS ||--o{ ORDERS : "includes"
    ORDERS ||--o{ TICKETS : "contains"
    TICKET_CATEGORIES ||--o{ TICKETS : "belongs_to"

    %% MODULE: PAYMENTS
    ORDERS ||--o| PAYMENT_TRANSACTIONS : "paid_via"

    %% MODULE: OFFLINE CHECK-IN & GUEST LIST
    CONCERTS ||--o{ GUEST_LISTS : "has"
    USERS ||--o{ TICKETS : "scanned_by (Checker)"

    %% MODULE: BACKGROUND JOBS & NOTIFICATIONS
    USERS ||--o{ NOTIFICATION_LOGS : "receives"
    NOTIFICATION_TEMPLATES ||--o{ NOTIFICATION_LOGS : "uses"
    CONCERTS ||--o{ BACKGROUND_JOBS : "triggers (AI Bio)"

    %% TABLES DEFINITION - AUTH
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string status
    }
    ROLES {
        uuid id PK
        string name UK
    }
    PERMISSIONS {
        uuid id PK
        string code UK
    }
    USER_ROLES {
        uuid user_id PK, FK
        uuid role_id PK, FK
    }
    ROLE_PERMISSIONS {
        uuid role_id PK, FK
        uuid permission_id PK, FK
    }

    %% TABLES DEFINITION - CATALOG
    CONCERTS {
        uuid id PK
        string name
        text ai_bio
        timestamp start_time
        string svg_map_url
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

    %% TABLES DEFINITION - TICKETING
    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid concert_id FK
        decimal total_amount
        string status
        timestamp expires_at
    }
    TICKETS {
        uuid id PK
        uuid order_id FK
        uuid category_id FK
        string qr_code_hash UK
        boolean is_scanned
        timestamp scanned_at
        uuid scanned_by FK
    }

    %% TABLES DEFINITION - PAYMENTS
    PAYMENT_TRANSACTIONS {
        uuid id PK
        uuid order_id FK
        string provider
        string idempotency_key UK
        decimal amount
        jsonb raw_response
        string status
    }

    %% TABLES DEFINITION - OFFLINE CHECK-IN
    GUEST_LISTS {
        uuid id PK
        uuid concert_id FK
        string email
        string full_name
        boolean is_scanned
    }

    %% TABLES DEFINITION - JOBS & NOTIFICATIONS
    BACKGROUND_JOBS {
        uuid id PK
        string target_type
        uuid target_id
        string status
        jsonb payload
        jsonb result
    }
    NOTIFICATION_TEMPLATES {
        uuid id PK
        string type
        string channel
        text content_template
    }
    NOTIFICATION_LOGS {
        uuid id PK
        uuid user_id FK
        uuid template_id FK
        string status
        int retry_count
    }

```

---

## 2. ĐẶC TẢ CHI TIẾT CÁC BẢNG (DATA DICTIONARY)

Hệ thống sử dụng **PostgreSQL**. Tất cả các khóa chính (PK) đều sử dụng kiểu `UUID` để bảo mật và phân tán tốt trong môi trường Microservices.

### 🛡️ Module 1: Auth & RBAC (Quản trị và Phân quyền)

Lưu trữ thông tin người dùng và phân quyền động.

* **`users`**:
* `id` (UUID, PK)
* `email` (VARCHAR, Unique): Dùng để đăng nhập.
* `password_hash` (VARCHAR)
* `full_name` (VARCHAR): Họ và tên người dùng.
* `status` (VARCHAR): `ACTIVE`, `BANNED`.

---

* **`roles`**: Định nghĩa nhóm quyền.
* `id` (UUID, PK)
* `name` (VARCHAR, Unique): Ví dụ `ADMIN`, `ORGANIZER`, `CHECKER`, `AUDIENCE`.

---

* **`permissions`**: Quyền chi tiết (Sẽ được encode vào JWT).
* `id` (UUID, PK)
* `code` (VARCHAR, Unique): Ví dụ `CREATE_CONCERT`, `VIEW_STATS`, `SCAN_TICKET`.

---

* **`user_roles`**: Bảng trung gian gán Role cho User (Khóa chính kép: `user_id`, `role_id`).
* **`role_permissions`**: Bảng trung gian gán Permission cho Role (Khóa chính kép: `role_id`, `permission_id`).

### 🎤 Module 2: Catalog (Quản lý Concert)

* **`concerts`**:
* `id` (UUID, PK)
* `name` (VARCHAR)
* `ai_bio` (TEXT): Đoạn text giới thiệu nghệ sĩ do AI tạo ra.
* `start_time` (TIMESTAMP WITH TIME ZONE): Phục vụ gửi email nhắc nhở 24h.
* `svg_map_url` (VARCHAR): Link CDN trỏ tới sơ đồ ghế.
* `status` (VARCHAR): `DRAFT`, `PUBLISHED`, `COMPLETED`.

---

* **`ticket_categories`**:
* `id` (UUID, PK)
* `concert_id` (UUID, FK)
* `name` (VARCHAR): `SVIP`, `CAT1`, `GA`.
* `price` (DECIMAL)
* `total_quantity` (INT): Tổng cung.
* `max_per_user` (INT): Giới hạn số lượng vé được mua trên mỗi tài khoản.

---

### 🎟️ Module 3: Ticketing & Orders (Đặt vé & E-Ticket)

* **`orders`**:
* `id` (UUID, PK)
* `user_id` (UUID, FK)
* `concert_id` (UUID, FK)
* `total_amount` (DECIMAL)
* `status` (VARCHAR): `PENDING` (Đang giữ chỗ 10 phút), `PAID` (Thành công), `CANCELLED`.
* `expires_at` (TIMESTAMP): RabbitMQ dựa vào cột này để release vé nếu user không thanh toán.

---

* **`tickets`**: Kho chứa vé điện tử.
* `id` (UUID, PK)
* `order_id` (UUID, FK, Cascade Delete)
* `category_id` (UUID, FK)
* `qr_code_hash` (VARCHAR, Unique): Mã băm SHA-256 sinh ra sau khi trả tiền xong.
* `is_scanned` (BOOLEAN): Mặc định `FALSE`.
* `scanned_at` (TIMESTAMP): Thời gian thực tế khi vé được quét tại cổng.
* `scanned_by` (UUID, FK): ID của nhân viên (Checker) thực hiện quét vé.

---

### 💳 Module 4: Payments (Thanh toán)

* **`payment_transactions`**:
* `id` (UUID, PK)
* `order_id` (UUID, FK)
* `provider` (VARCHAR): `VNPAY`, `MOMO`.
* `idempotency_key` (VARCHAR, Unique): Mã UUID do Frontend gửi lên để chặn trừ tiền 2 lần.
* `amount` (DECIMAL): Số tiền giao dịch.
* `status` (VARCHAR): `SUCCESS`, `FAILED`.
* `raw_response` (JSONB): Chuỗi JSON VNPAY trả về để đối soát.

---

### 📥 Module 5: Integrations & Async Tasks

* **`guest_lists`**: Danh sách VIP từ file CSV.
* `id` (UUID, PK)
* `concert_id` (UUID, FK)
* `email` (VARCHAR)
* `full_name` (VARCHAR)
* `is_scanned` (BOOLEAN)
* **UNIQUE CONSTRAINT** `(concert_id, email)`: Dùng cho truy vấn `UPSERT` khi đọc CSV.

---

* **`background_jobs`**: Theo dõi tác vụ nền.
* `id` (UUID, PK)
* `target_type` (VARCHAR): `AI_PDF_OCR`, `CSV_IMPORT`.
* `target_id` (UUID): ID của Concert tương ứng.
* `status` (VARCHAR): `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
* `payload` (JSONB): Thông tin cấu hình/đường dẫn file S3.
* `result` (JSONB): Kết quả đầu ra lưu tạm.

---

### 🔔 Module 6: Notifications (Thông báo tự động)

* **`notification_templates`**:
* `id` (UUID, PK)
* `type` (VARCHAR): `ORDER_SUCCESS`, `CONCERT_REMINDER_24H`.
* `channel` (VARCHAR): `EMAIL`, `ZALO`, `SMS`.
* `content_template` (TEXT): Chứa text có biến số (Ví dụ: `Xin chào {{name}}...`).

---

* **`notification_logs`**:
* `id` (UUID, PK)
* `user_id` (UUID, FK)
* `template_id` (UUID, FK)
* `status` (VARCHAR): `SENT`, `FAILED`.
* `retry_count` (INT): Số lần gửi lại nếu API bên thứ 3 lỗi.