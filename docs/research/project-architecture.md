## PHƯƠNG ÁN 1: THE ENTERPRISE MONOREPO (Microservices + DevOps)

Cấu trúc này cực kỳ chuyên nghiệp, tích hợp toàn bộ Tech Stack (PostgreSQL, Redis, RabbitMQ, K8s, Jenkins) và Blueprint vào một repository duy nhất. Quản lý bằng NPM Workspaces hoặc Turborepo.

```text
ticketbox-microservices-workspace/
│
├── blueprint/                            # 1. TÀI LIỆU ĐỒ ÁN
│   ├── proposal.md                       # Đặt vấn đề, mục tiêu, user persona
│   ├── design.md                         # Sơ đồ C4, High-Level Architecture, Techstack
│   ├── research/                         # Các bản nháp, phân tích đánh đổi (trade-offs)
│   └── specs/                            # Đặc tả chi tiết từng module (auth, payment...)
│
├── devops/                               # 2. HẠ TẦNG & CI/CD (Infrastructure as Code)
│   ├── k8s/                              # Các file Manifest deploy lên Kubernetes
│   │   ├── postgres-deployment.yaml      # Khởi tạo DB PostgreSQL
│   │   ├── redis-deployment.yaml         # Khởi tạo Redis (Cache/Lock)
│   │   └── rabbitmq-deployment.yaml      # Khởi tạo RabbitMQ (Message Broker)
│   │
│   ├── data/                             # Dữ liệu & Script khởi tạo
│   │   └── init.sql                      # Script tạo bảng, Index, Ràng buộc cho Postgres
│   │
│   ├── Jenkinsfile                       # Pipeline CI/CD: Tích hợp JaCoCo (coverage), SonarQube & Snyk (scan bảo mật monorepo)
│   └── docker-compose.yml                # File spin-up nhanh toàn bộ DB, Cache, Queue cho môi trường Local
│
├── packages/                             # 3. TẦNG SHARED LIBRARIES (TypeScript)
│   ├── common-contracts/                 # DTOs, Enums, Event Patterns (FE & BE dùng chung)
│   ├── database-lib/                     # Thư viện TypeORM kết nối PostgreSQL
│   ├── redis-lib/                        # Thư viện ioredis, chứa hàm chạy Lua Script
│   └── rmq-lib/                          # Thư viện AMQP kết nối RabbitMQ
│
└── apps/                                 # 4. TẦNG ỨNG DỤNG & DỊCH VỤ ĐỘC LẬP
    ├── web-app/                          # FE: Khán giả mua vé (React/Next.js)
    ├── admin-app/                        # FE: Ban tổ chức (React)
    ├── mobile-checker/                   # Mobile App: Soát vé offline (Flutter/Dart + SQLite)
    │
    ├── api-gateway/                      # BE: NestJS - Rate Limit, Verify JWT Token
    ├── concert-service/                  # BE: NestJS - Đọc PostgreSQL, thao tác Redis (thông tin concert)
    ├── ticketing-service/                # BE: NestJS - Chạy Redis Lua Script giữ chỗ, ném event vào RabbitMQ
    ├── payment-service/                  # BE: NestJS - Lưu Idempotency Key (Redis), Circuit Breaker (VNPAY)
    └── worker-service/                   # BE: NestJS/Python - Consume RabbitMQ, ghi Order xuống Postgres, AI PDF

```

---

## PHƯƠNG ÁN 2: MODULAR MONOLITH (Tối ưu chi phí)

Cấu trúc này giữ lại sự quy củ của Blueprint và sự đồng bộ của DTO, nhưng dồn toàn bộ Backend vào một khối duy nhất để dễ deploy lên 1 con VPS thông thường.

```text
ticketbox-monolith-workspace/
│
├── blueprint/                            # 1. TÀI LIỆU ĐỒ ÁN
│   ├── proposal.md
│   ├── design.md
│   └── specs/
│
├── devops/                               # 2. HẠ TẦNG & CI/CD ĐƠN GIẢN
│   ├── data/
│   │   └── init.sql                      # Script khởi tạo Schema PostgreSQL
│   ├── Jenkinsfile                       # Pipeline build & deploy qua SSH lên VPS (kèm SonarQube/Snyk scan)
│   └── docker-compose.yml                # Cấu hình chung cho PostgreSQL, Redis, RabbitMQ
│
├── packages/                             # 3. TẦNG SHARED CODE
│   └── shared-contracts/                 # Interface, DTO, Type (chia sẻ giữa Frontend & Backend)
│
└── apps/                                 # 4. TẦNG ỨNG DỤNG
    ├── frontend-web/                     # FE: Web Client (Khán giả & Admin)
    ├── mobile-checker/                   # Mobile App: Nhân sự soát vé (Flutter/Dart + SQLite)
    │
    └── backend-api/                      # BE: Ứng dụng NestJS Nguyên khối (Modular)
        ├── src/
        │   ├── shared/                   # Kết nối PostgreSQL, Redis Client, RabbitMQ Producer
        │   └── modules/                  # Tách biệt nghiệp vụ rạch ròi
        │       ├── auth/                 # Xử lý JWT, RBAC
        │       ├── concert/              # Query PostgreSQL lấy dữ liệu, Cache Redis
        │       ├── ticketing/            # Lua Script trên Redis, ném message vào Queue
        │       ├── payment/              # Xử lý thanh toán VNPAY
        │       └── background-jobs/      # Lắng nghe RabbitMQ, ghi DB, cronjob quét CSV
        │
        └── Dockerfile                    # Đóng gói toàn bộ backend thành 1 image duy nhất

```

### 💡 Chi tiết cách các thành phần tương tác trong cây thư mục:

1. **Dữ liệu lõi (PostgreSQL):** Sẽ được khởi tạo bằng file `devops/data/init.sql`. Backend (dù là Microservice hay Monolith) sẽ dùng code trong thư mục `database-lib/` (hoặc `shared/`) để connect vào DB này.
2. **Bộ nhớ đệm & Khóa (Redis):** Nằm độc lập trên Docker/K8s. `ticketing-service` hoặc module `ticketing/` sẽ gọi file cấu hình Redis để thực thi Lua Script mỗi khi có luồng mua vé.
3. **Hàng đợi (RabbitMQ):** Khi người dùng mua vé thành công, backend sẽ bắn event qua thư viện dùng chung `rmq-lib/`. Thằng `worker-service` (hoặc `background-jobs/`) sẽ ngồi hứng event này để ghi xuống PostgreSQL, đảm bảo DB không bao giờ sập.
4. **Luồng CI/CD (Jenkins):** Cả 2 mô hình đều có `Jenkinsfile` nằm ở thư mục `devops/`. Pipeline sẽ được cấu hình để khi có code mới push lên, nó sẽ chạy tự động các bước: Build -> Test (JaCoCo) -> Scan tĩnh (SonarQube) -> Quét bảo mật thư viện (Snyk) -> Đóng gói Docker Image -> Deploy.
