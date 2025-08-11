# Auth Server SSO

## 🚀 Tính năng

- **Đăng ký client**: Đăng ký ứng dụng client mới
- **Đăng ký tài khoản**: Đăng ký tài khoản người dùng mới.
- **Endpoint xác thực**: Endpoint khởi tạo luồng xác thực (hiển thị trang đăng nhập).
- **Login**: Xử lý thông tin đăng nhập và trả về Authorization Code.
- **Get token**: Đổi Authorization Code lấy các token.
- **Get userinfo**: Lấy thông tin người dùng, yêu cầu access_token hợp lệ.
- **Get public key**: Trả về public k

## 📋 Yêu cầu hệ thống

- Node.js (version 18 trở lên)
- npm hoặc yarn

## 🛠️ Cài đặt

1. **Clone repository**:

```bash
git clone <repository-url>
cd project folder
```

2. **Cài đặt dependencies**:

```bash
npm install
```

3. **Generate key RSA**

```bash
node generate-jwks.js
```

4. **Khởi chạy server**:

```bash
# Development mode
npm run dev

# Production mode
npm run start
```

Server sẽ chạy tại `http://localhost:5403`

## 🔧 Cấu hình

### Environment Variables

- `PORT`: Port để chạy server (mặc định: 5403)

- `MONGO_URI`

- `PRIVATE_KEY_PATH`

- `PUBLIC_KEY_PATH`

---
