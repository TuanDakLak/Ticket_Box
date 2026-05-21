# TÀI LIỆU RESEARCH: LỰA CHỌN KIẾN TRÚC HỆ THỐNG TICKETBOX (ENTERPRISE EDITION)

## 1. CÁC "NỖI ĐAU" TỪ REQUIREMENT QUYẾT ĐỊNH KIẾN TRÚC
Trước khi vạch ra kiến trúc, chúng ta cần nhìn thẳng vào các giới hạn vật lý và nghiệp vụ mà hệ thống phải chịu đựng:
- **Tải trọng cực đoan (Traffic Spike):** 80.000 người truy cập trong 5 phút đầu mở bán, 70% dồn vào phút đầu tiên. Backend API không được phép sập.
- **Tranh chấp dữ liệu (High Concurrency Write):** 200 vé SVIP nhưng hàng chục nghìn người tranh nhau. Tuyệt đối không có chuyện 2 khán giả nhận cùng 1 vé cuối cùng.
- **Điểm mù bên thứ 3 (3rd-party Failures):** Cổng VNPAY/MoMo có thể sập. Luồng mua vé phải xử lý được timeout, trong khi các tính năng xem concert khác vẫn phải hoạt động bình thường.
- **Tác vụ nặng & Chậm (Heavy/Slow I/O):** Xử lý file PDF bằng AI Model và đọc file CSV khách mời mà không làm block hệ thống.

---

## 2. ĐÁNH GIÁ CÁC MÔ HÌNH KIẾN TRÚC (ARCHITECTURAL OPTIONS)

Với hạ tầng Kubernetes (K8s) và CI/CD Jenkins đã có sẵn trong tay, luật chơi thay đổi hoàn toàn.

### Option 1: Monolith Truyền thống (Kiến trúc Nguyên khối đồng bộ)
- **Cách hoạt động:** Tất cả API (từ xem vé, thanh toán đến xử lý AI) nằm chung một cục code và chạy trên cùng một Pod trong K8s.
- **Nhược điểm chí mạng:** Khi 80.000 người ập vào mua vé, bạn phải dùng HPA (Horizontal Pod Autoscaler) của K8s để nhân bản cục Monolith này lên. Việc nhân bản toàn bộ một ứng dụng khổng lồ (chứa cả thư viện xử lý PDF AI, import CSV) chỉ để giải quyết luồng "Mua vé" là sự lãng phí tài nguyên RAM/CPU khủng khiếp. Nếu một tiến trình đọc file CSV bị tràn RAM (OOM), toàn bộ Pod đó chết, kéo theo cả người đang thanh toán cũng văng lỗi.
- **Kết luận:** **LOẠI BỎ**. K8s không phát huy được sức mạnh với mô hình này.

### Option 2: Modular Monolith kết hợp Event-Driven
- **Cách hoạt động:** Vẫn là 1 cục code, nhưng chia module rõ ràng và dùng RabbitMQ làm hàng đợi.
- **Đánh giá:** Rất tốt cho team thiếu resource hạ tầng. Nhưng vì team ta đã có K8s, việc giữ tất cả trong một khối vẫn tạo ra rào cản khi muốn scale (mở rộng) độc lập từng phần. Khi commit code phần Notification, Jenkins vẫn phải build và test lại toàn bộ cục Monolith, làm chậm quá trình CI/CD.
- **Kết luận:** **PHƯƠNG ÁN BACKUP**. Chỉ dùng nếu giữa chừng team gặp sự cố không thể setup được hạ tầng K8s.

### Option 3: Event-Driven Microservices (Kiến trúc Vi dịch vụ hướng sự kiện) - ĐỀ XUẤT CHỌN
- **Cách hoạt động:** Cắt nát hệ thống thành các Microservice độc lập. Mỗi service được build thành một Docker Image riêng, chạy trên các Pod riêng biệt trong K8s. Giao tiếp với nhau thông qua API Gateway và Event Broker (RabbitMQ).
  - `Concert Service`: Quản lý hiển thị sự kiện, sơ đồ chỗ ngồi.
  - `Ticketing Service`: Luồng xử lý giữ chỗ (kết nối với Redis).
  - `Payment Service`: Quản lý giao dịch, tích hợp VNPAY/MoMo.
  - `Worker/AI Service`: Quản lý đồng bộ CSV và xử lý PDF.
- **Tại sao chọn?** Đây là mô hình "sinh ra" dành cho Kubernetes và CI/CD. Nó tối ưu hóa từng đồng tài nguyên và cung cấp khả năng chịu lỗi (Fault Tolerance) tuyệt đối.

---

## 3. MAP KIẾN TRÚC MICROSERVICES + K8S VÀO REQUIREMENT (TRACEABILITY)

Khi áp dụng mô hình này, chúng ta có lời giải hoàn hảo cho mọi bài toán trong đề:

1. **Requirement "Tải trọng đột biến 80.000 users"**
   - *Kiến trúc giải quyết:* Nhờ chia nhỏ Service, ta thiết lập K8s HPA (Horizontal Pod Autoscaler) khác nhau. Khi mở bán vé, K8s tự động scale `Ticketing Service` từ 2 Pods lên 50 Pods để chịu tải, trong khi `Worker/AI Service` hay `Admin Service` vẫn ngoan ngoãn nằm ở 1 Pod để tiết kiệm RAM/CPU.

2. **Requirement "VNPAY/MoMo sập không kéo sập hệ thống"**
   - *Kiến trúc giải quyết:* Cô lập lỗi (Fault Isolation). `Payment Service` nằm ở một tập hợp Pod riêng. Nếu nó sập hoặc cạn kiệt connection do VNPAY treo, thì CPU/RAM của `Concert Service` không hề bị ảnh hưởng. Khán giả vẫn vào xem thông tin concert, xem sơ đồ chỗ ngồi bình thường.

3. **Requirement "CI/CD & Phân chia công việc" (Team Requirement)**
   - *Kiến trúc giải quyết:* Microservices cho phép áp dụng chiến lược phân nhánh Gitflow trơn tru hơn. Khi một thành viên push code từ nhánh tính năng phần AI PDF lên, Jenkins pipeline chỉ chạy build Docker image cho `Worker Service` (kết hợp các bước scan bảo mật, coverage) và deploy lên K8s trong 1 phút. Quá trình này hoàn toàn không gây downtime hay ảnh hưởng đến luồng mua vé đang chạy trên các service khác.

4. **Requirement "Xử lý tác vụ nặng AI & CSV"**
   - *Kiến trúc giải quyết:* Luồng mua vé (HTTP đồng bộ) và luồng xử lý nền (RabbitMQ bất đồng bộ) bị tách vật lý. `Worker Service` có thể consume RabbitMQ message từ từ, xử lý file CSV và gọi LLM API mà không bao giờ có thể tranh giành tài nguyên CPU với API Node.js đang xử lý giữ vé cho khách hàng.