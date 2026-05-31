# 📘 Tài liệu Hướng dẫn Tích hợp Auth & RBAC cho Front-end (FE)

Tài liệu này cung cấp hướng dẫn chi tiết cho đội ngũ phát triển Front-end cách tích hợp toàn bộ hệ thống Xác thực, Khôi phục mật khẩu, Quản lý Token và Phân quyền RBAC từ Backend API.

---

## 1. Cấu hình Biến môi trường (Environment Variables)
Đảm bảo bạn đã khai báo đường dẫn tới Backend API trong file cấu hình môi trường của Front-end (ví dụ `.env.local` của React/Next.js/Vite):
```env
# URL trỏ tới Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 2. Danh sách các API Endpoints cần tích hợp

### 2.1. Đăng ký tài khoản (`POST /auth/register`)
*   **Mục đích**: Người dùng đăng ký tài khoản Khán giả mới.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123",
      "fullName": "Nguyễn Văn A"
    }
    ```
*   **Xử lý ở FE**: 
    *   Sau khi đăng ký thành công, tài khoản sẽ ở trạng thái `PENDING` (chưa kích hoạt).
    *   **Không tự động đăng nhập**. Hiển thị thông báo (Popup/Toast) yêu cầu người dùng: *"Vui lòng mở hòm thư email của bạn để kích hoạt tài khoản"*.

---

### 2.2. Gửi lại Mail kích hoạt (`POST /auth/resend-verification`)
*   **Mục đích**: Gửi lại email kích hoạt nếu người dùng lỡ tay xóa hoặc chưa nhận được thư cũ.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **Xử lý ở FE**: Hiển thị nút "Gửi lại email kích hoạt" ở màn hình Đăng ký/Đăng nhập nếu tài khoản chưa được kích hoạt.

---

### 2.3. Đăng nhập (`POST /auth/login`)
*   **Mục đích**: Xác thực người dùng và nhận Tokens.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123"
    }
    ```
*   **Response nhận được (Thành công)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "uuid-string",
        "email": "user@example.com",
        "fullName": "Nguyễn Văn A",
        "roles": ["Audience"],
        "permissions": ["CREATE_CONCERT", "UPDATE_CONCERT"]
      }
    }
    ```
*   **Xử lý ở FE (Quan trọng)**:
    1.  Lưu `accessToken` vào State quản lý (Redux/Zustand/React Context) để đính kèm vào header khi gọi các API bảo mật.
    2.  Lưu `refreshToken` vào Cookie bảo mật hoặc LocalStorage để phục vụ tự động gia hạn phiên.
    3.  Lưu thông tin `user` (đặc biệt là `roles` và `permissions`) vào global state để ẩn/hiện các nút bấm trên giao diện cho phù hợp.

---

### 2.4. Khôi phục phiên làm việc khi F5/Tải lại trang (`GET /auth/me`)
*   **Mục đích**: Khi người dùng tải lại trình duyệt, Front-end gọi API này để khôi phục lại trạng thái đăng nhập (Profile, Roles, Permissions).
*   **Headers**: Yêu cầu đính kèm Access Token:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Xử lý ở FE**: Gọi API này ngay khi ứng dụng vừa khởi chạy (App Mount) nếu kiểm tra thấy có token cũ.

---

### 2.5. Tự động gia hạn Token (`POST /auth/refresh`)
*   **Mục đích**: Access Token chỉ có hạn dùng ngắn (15 phút). Khi Access Token hết hạn, FE sử dụng API này để lấy cặp Token mới mà không bắt người dùng đăng nhập lại.
*   **Request Body**:
    ```json
    {
      "refreshToken": "mã-refresh-token-lưu-ở-client"
    }
    ```
*   **Response nhận được**: Trả về cặp `accessToken` và `refreshToken` mới tinh.
*   **Xử lý chuyên nghiệp (Axios Interceptors)**:
    Nên cấu hình một bộ lọc tự động (Interceptor) trong Axios. Khi một request bất kỳ trả về mã lỗi `401 Unauthorized`:
    1.  Tạm dừng tất cả request đang chờ.
    2.  Gửi request `POST /auth/refresh` để lấy `accessToken` mới.
    3.  Cập nhật token mới vào storage.
    4.  Tự động gửi lại (retry) các request bị lỗi ban nãy.

---

### 2.6. Đổi mật khẩu (`POST /auth/change-password`)
*   **Mục đích**: Thay đổi mật khẩu trong trang quản trị cá nhân.
*   **Headers**: Yêu cầu `Authorization: Bearer <accessToken>`.
*   **Request Body**:
    ```json
    {
      "oldPassword": "mật-khẩu-cũ",
      "newPassword": "mật-khẩu-mới"
    }
    ```

---

### 2.7. Yêu cầu Quên mật khẩu (`POST /auth/forgot-password`)
*   **Mục đích**: Gửi yêu cầu lấy lại mật khẩu.
*   **Request Body**:
    ```json
    {
      "email": "user@example.com"
    }
    ```
*   **Xử lý ở FE**: Sau khi gọi thành công, hiện popup thông báo: *"Thư khôi phục mật khẩu đã được gửi, vui lòng kiểm tra Gmail."*

---

### 2.8. Khôi phục mật khẩu thực tế (`POST /auth/reset-password`)
*   **Mục đích**: Người dùng đặt mật khẩu mới sau khi click vào link trong Gmail.
*   **Xây dựng màn hình FE**: Tạo một Router riêng biệt tại `/reset-password` (Ví dụ: `http://localhost:5173/reset-password?token=...`).
*   **Cách thức hoạt động trên giao diện**:
    1.  Dùng Javascript đọc tham số `token` trên URL: `const token = new URLSearchParams(window.location.search).get('token')`.
    2.  **Mẹo Bảo mật & Thẩm mỹ (Khuyên dùng)**: Ngay sau khi đọc xong token và lưu vào bộ nhớ tạm, chạy dòng lệnh dưới đây để **xóa sạch** chuỗi token dài loằng ngoằng khỏi thanh địa chỉ trình duyệt nhằm giữ giao diện chuyên nghiệp và bảo mật tuyệt đối:
        ```javascript
        window.history.replaceState({}, document.title, window.location.pathname);
        ```
    3.  Hiển thị Form cho người dùng nhập **Mật khẩu mới** và **Xác nhận mật khẩu mới**.
    4.  Khi nhấn Xác nhận, gửi request:
        *   **API**: `POST /auth/reset-password`
        *   **Request Body**:
            ```json
            {
              "token": "token-lấy-từ-url",
              "newPassword": "mật-khẩu-mới-người-dùng-nhập"
            }
            ```
    5.  Nếu Backend báo thành công ➔ Chuyển hướng người dùng về trang Đăng nhập (`/login`).

---

### 2.9. Đăng xuất (`POST /auth/logout`)
*   **Mục đích**: Hủy bỏ phiên làm việc, xóa Refresh Token dưới Database.
*   **Headers**: Yêu cầu `Authorization: Bearer <accessToken>`.
*   **Xử lý ở FE**: Gọi API này ➔ Xóa sạch mọi tokens và profile trong LocalStorage/State ➔ Chuyển hướng người dùng về trang đăng nhập.

---

## 3. Quản lý phân quyền RBAC/PBAC trên giao diện FE
Dựa trên mảng `roles` và `permissions` nhận được từ API `/auth/login` hoặc `/auth/me`, Front-end thực hiện ẩn/hiện và phân quyền route:

### 3.1. Phân quyền cấp Route (Navigation Guards)
*   **Trang Quản lý Concert của Admin/Organizer**: Kiểm tra xem user có chứa role `ADMIN` hoặc `ORGANIZER` không. Nếu không, chuyển hướng họ về trang báo lỗi `403 Forbidden` hoặc trang chủ.

### 3.2. Ẩn/Hiện nút bấm trên giao diện
*   **Nút "Tạo Concert mới"**: Chỉ hiển thị nếu `permissions` của user có chứa chuỗi `'CREATE_CONCERT'`.
    ```javascript
    const canCreate = user.permissions.includes('CREATE_CONCERT');
    // ...
    {canCreate && <button>Tạo Concert mới</button>}
    ```
*   **Nút "Xóa Concert"**: Chỉ hiển thị nếu `permissions` có chứa `'DELETE_CONCERT'`.
