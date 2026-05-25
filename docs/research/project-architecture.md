## KIẾN TRÚC DỰ ÁN HIỆN TẠI: MODULAR MONOLITH + EVENT-DRIVEN

Hệ thống hiện tại sử dụng một backend NestJS dạng modular monolith, tách module rõ ràng và xử lý tác vụ nặng qua RabbitMQ để đảm bảo luồng mua vé không bị block. Cấu trúc thư mục được tổ chức theo monorepo để thuận tiện chia sẻ tài liệu và triển khai môi trường local.

```text
Ticket_Box/
│
├── blueprint/                            # 1. TÀI LIỆU ĐỒ ÁN
│   ├── proposal.md
│   ├── design.md
│   ├── specs/
│   └── research/
│
├── apps/                                 # 2. TẦNG ỨNG DỤNG
│   ├── backend-api/                      # BE: NestJS Modular Monolith
│   │   └── src/
│   │       ├── shared/                   # Kết nối PostgreSQL, Redis Client, RabbitMQ Producer
│   │       └── modules/                  # Tách biệt nghiệp vụ rạch ròi
│   │           ├── auth/
│   │           ├── catalog/
│   │           ├── ticketing/
│   │           ├── order/
│   │           ├── payment/
│   │           ├── notification/
│   │           └── background-jobs/
│   └── web-app/                          # FE: Khán giả mua vé (React/Next.js)
│
├── devops/                               # 3. HẠ TẦNG LOCAL
│   ├── data/
│   │   └── init.sql                      # Script khởi tạo Schema PostgreSQL
│   └── docker-compose.yml                # Cấu hình PostgreSQL, Redis, RabbitMQ
│
├── docs/                                 # 4. TÀI LIỆU NGHIÊN CỨU
|   ├── template/                             # 5. BIỂU MẪU
|   ├── workflow/                             # 6. QUY TRÌNH NHÓM
├── turbo.json                            # Cấu hình Turborepo
├── tsconfig.json
└── package.json

```

### 💡 Chi tiết cách các thành phần tương tác trong cây thư mục:

1. **Dữ liệu lõi (PostgreSQL):** Khởi tạo bằng file `devops/data/init.sql`. Backend sử dụng lớp kết nối trong `apps/backend-api/src/shared/` để thao tác DB.
2. **Bộ nhớ đệm & Khóa (Redis):** Chạy qua Docker Compose. Module `ticketing/` gọi Redis để thực thi Lua Script mỗi khi có luồng mua vé.
3. **Hàng đợi (RabbitMQ):** Backend publish event khi giữ vé/hoàn tất thanh toán. Module `background-jobs/` consume event để ghi DB và xử lý AI/CSV.
4. **Frontend:** `apps/web-app/` gọi API backend theo REST, tải tài nguyên tĩnh qua CDN khi triển khai thực tế.

---

## Ghi chú mở rộng trong tương lai

Nếu quy mô tăng, các module có thể được bóc tách dần thành service độc lập (microservices). Việc này không ảnh hưởng tới cấu trúc tài liệu hiện tại và có thể thực hiện theo từng module.
