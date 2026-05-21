### Hiểu đúng về "Database per Service"

Trong Microservices, nguyên tắc tối thượng là: **Service A không được phép query trực tiếp vào bảng dữ liệu của Service B.** (Ví dụ: `ticketing-service` không được phép gọi câu lệnh `SELECT * FROM users` của `auth-service`). Nếu muốn lấy dữ liệu, chúng phải gọi API của nhau hoặc gửi Event.

**Vậy có cần mua 5 máy chủ Database khác nhau không?** Hoàn toàn **KHÔNG**. Đối với hạ tầng thực tế (đặc biệt là để tiết kiệm chi phí K8s), "Database per Service" thường được triển khai bằng cách: Chạy **1 máy chủ PostgreSQL duy nhất** (như cấu hình trong `docker-compose.yml`), nhưng bên trong máy chủ đó, ta tạo ra **các Logical Database hoặc Schema độc lập**.

Ví dụ: `db_auth`, `db_catalog`, `db_ticketing`, `db_order`.
Mỗi microservice sẽ có một chuỗi kết nối (`DATABASE_URL`) trỏ vào đúng cái DB nhỏ của nó.

### Cấu trúc thư mục Monorepo có bị thay đổi không?

**[Project architecture](../research/project-architecture.md) mà bạn đã thiết kế KHÔNG ĐỔI.** Nó đã quá hoàn hảo rồi. Sự thay đổi chỉ diễn ra ở phần "ruột" bên trong 2 chỗ sau:

**1. File `devops/data/init.sql` sẽ thay đổi cách viết:**
Thay vì tạo ra một đống bảng có khóa ngoại (Foreign Key) móc nối chằng chịt vào nhau như Monolith, file `init.sql` giờ đây chỉ làm nhiệm vụ khởi tạo các schema/database riêng lẻ để cấp quyền cho các service.

```sql
-- Bên trong devops/data/init.sql
CREATE DATABASE db_auth;
CREATE DATABASE db_catalog;
CREATE DATABASE db_ticketing;
CREATE DATABASE db_order;

```

**2. Các thư mục Entity/Migration sẽ nằm rải rác ở từng Service:**
Thay vì để toàn bộ Entity vào chung một chỗ, database của service nào thì service đó tự giữ file thiết kế bảng (Entity) của nó.

```text
└── apps/
    ├── auth-service/
    │   └── src/entities/      <-- Chỉ chứa User, Role, Permission
    │
    ├── catalog-service/
    │   └── src/entities/      <-- Chỉ chứa Concert, TicketCategory
    │
    └── ticketing-service/
        └── src/entities/      <-- Chỉ chứa Ticket, HoldSession

```

*Lưu ý:* Việc kết nối Database vẫn dùng chung code ở `packages/database-lib/` (để tránh lặp code setup TypeORM), nhưng khi các service gọi thư viện này, chúng sẽ truyền biến môi trường khác nhau để trỏ vào đúng `db_...` của riêng mình.

---
