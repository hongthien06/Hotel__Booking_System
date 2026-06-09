<h1 align="center">🏨 Hotel Booking Management System</h1>

<p align="center">
  Nền tảng đặt phòng khách sạn full-stack với backend Spring Boot, frontend React/Vite, thanh toán online, xuất hóa đơn PDF, chatbot AI và triển khai bằng Docker Compose.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.x-6DB33F?style=flat-square&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/SQL_Server-2022-CC2927?style=flat-square&logo=microsoftsqlserver&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAPI-Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" />
</p>

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ áp dụng](#công-nghệ-áp-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [API & Tài liệu](#api--tài-liệu)
- [Scripts hữu ích](#scripts-hữu-ích)
- [Triển khai bằng Docker](#triển-khai-bằng-docker)
- [Ghi chú kỹ thuật](#ghi-chú-kỹ-thuật)

---

## Tổng quan

Đây là hệ thống quản lý đặt phòng khách sạn được xây dựng theo hướng module hóa, tách rõ frontend và backend. Ứng dụng hỗ trợ luồng đặt phòng từ tra cứu phòng, chọn dịch vụ, thanh toán online, tạo hóa đơn PDF, gửi email và quản trị dữ liệu khách sạn, phòng, voucher, booking, invoice, user, payment và dashboard.

Dự án phù hợp cho môi trường vận hành nội bộ hoặc demo học thuật, với kiến trúc dễ mở rộng, có Swagger/OpenAPI, xác thực JWT, phân quyền theo vai trò và Docker Compose để dựng toàn bộ stack.

---

## Tính năng chính

### Khách hàng
- Đăng ký, đăng nhập, quên mật khẩu, đổi mật khẩu và cập nhật hồ sơ.
- Xem danh sách khách sạn, loại phòng, phòng trống và chi tiết phòng.
- Tạo booking, chọn dịch vụ bổ sung và áp dụng voucher.
- Thanh toán bằng VNPay hoặc MoMo.
- Xem lịch sử đặt phòng và trạng thái thanh toán.
- Sử dụng chatbot AI để hỗ trợ tư vấn.
 - Quản lý chương trình thành viên (membership): xem/hưởng ưu đãi và thông tin thành viên.
 - Hỗ trợ quy trình check-in/check-out (frontend module `checkin-checkout`).
 - Xem và quản lý hóa đơn khách hàng (customers-invoice) trên giao diện người dùng.

### Quản trị / vận hành
- Quản lý khách sạn, tiện ích, loại phòng và phòng.
- Quản lý booking, hóa đơn, payment, voucher và dịch vụ đi kèm.
- Quản lý người dùng theo vai trò.
- Xem dashboard tổng quan với số liệu nghiệp vụ.
- Upload ảnh lên Cloudinary.
- Xuất hóa đơn PDF và gửi email theo mẫu Thymeleaf.
 - Quản lý chương trình thành viên, hạng thẻ và ưu đãi.
 - Quản lý đánh giá / review, bao gồm kiểm duyệt và trả lời.

### Nền tảng
- Xác thực JWT và Spring Security.
- Phân quyền theo vai trò như ADMIN, MANAGER và CUSTOMER.
- Tự động xử lý booking hết hạn bằng scheduler.
- Tích hợp OpenAPI/Swagger để kiểm thử API.
- Health check cho Docker và triển khai container hóa.

---

## Công nghệ áp dụng

### Frontend
| Công nghệ | Vai trò |
|---|---|
| React 19 | Xây dựng giao diện người dùng theo component |
| Vite 8 | Dev server và build production |
| React Router DOM 7 | Điều hướng client-side |
| React Hook Form | Quản lý form và validation |
| Redux Toolkit | Quản lý state toàn cục |
| Redux Persist | Lưu state qua refresh trình duyệt |
| TanStack React Query | Fetch, cache và đồng bộ server state |
| Axios | Gọi REST API |
| Material UI 7 | Bộ UI component chính |
| @emotion/react, @emotion/styled | Tùy biến style và theme |
| i18next, react-i18next | Đa ngôn ngữ |
| React Toastify | Thông báo toast |
| react-icons | Icon set |
| jsPDF | Xuất dữ liệu PDF ở phía client khi cần |
| Monaco Editor | Thành phần editor chuyên biệt nếu có luồng quản trị nội dung |

### Backend
| Công nghệ | Vai trò |
|---|---|
| Java 21 | Ngôn ngữ chính của backend |
| Spring Boot 4 | Nền tảng ứng dụng REST |
| Spring Web | Xây dựng API |
| Spring Security | Xác thực và phân quyền |
| Spring Data JPA | Truy cập dữ liệu theo entity/repository |
| Hibernate | ORM |
| SQL Server JDBC | Driver kết nối SQL Server |
| Flyway | Hỗ trợ migration database |
| JWT (jjwt) | Token access/refresh |
| Spring Validation | Validate request DTO |
| Spring Mail | Gửi email |
| Thymeleaf | Template email |
| Spring AI | Tích hợp chatbot AI |
| Springdoc OpenAPI | Swagger UI và API docs |
| Actuator | Health check và monitoring |
| Lombok | Giảm boilerplate code |
| Cloudinary SDK | Upload và quản lý media |
| iText 7 | Tạo hóa đơn PDF |
| dotenv-java | Đọc biến môi trường trong local dev |

### Cơ sở dữ liệu và tích hợp
| Thành phần | Vai trò |
|---|---|
| SQL Server 2022 | CSDL chính của hệ thống |
| OpenRouter / Gemini | Nguồn model cho chatbot AI |
| VNPay | Cổng thanh toán online |
| MoMo | Cổng thanh toán online |
| Cloudinary | Lưu trữ ảnh |
| SMTP Gmail | Gửi email nghiệp vụ |

### DevOps / công cụ
| Công nghệ | Vai trò |
|---|---|
| Docker | Đóng gói ứng dụng |
| Docker Compose | Dựng toàn bộ stack local |
| Maven Wrapper | Build backend nhất quán trên mọi máy |
| npm | Quản lý dependency frontend |
| ESLint | Kiểm tra chất lượng mã nguồn frontend |

---

## Kiến trúc hệ thống

### Kiến trúc lớp
- **Presentation layer**: Giao diện React, điều hướng bằng React Router, bảo vệ route theo vai trò và các màn hình nghiệp vụ ở frontend.
- **API layer**: Controller, validation, security filter và xử lý request/response theo context path `/api/v1`.
- **Service layer**: Nghiệp vụ chính cho booking, room, hotel, payment, invoice, voucher, chatbot, email và upload.
- **Persistence layer**: Repository JPA/Hibernate làm việc với SQL Server.
- **Integration layer**: VNPay, MoMo, Cloudinary, SMTP, Spring AI/OpenRouter, Swagger/OpenAPI và Actuator.
- **Background jobs**: Scheduler xử lý booking hết hạn và các tác vụ định kỳ khác.

### Luồng nghiệp vụ đặt phòng
1. Người dùng chọn phòng, nhập thông tin đặt phòng và xác nhận dịch vụ đi kèm.
2. Frontend gửi request lên backend thông qua REST API.
3. Backend xác thực JWT, kiểm tra dữ liệu và tạo booking trong SQL Server.
4. Nếu chọn thanh toán online, backend khởi tạo giao dịch VNPay hoặc MoMo.
5. Sau khi thanh toán thành công, hệ thống cập nhật trạng thái booking và payment.
6. Backend tạo hóa đơn PDF, lưu/đính kèm dữ liệu cần thiết và gửi email xác nhận cho khách.

---

## Cấu trúc dự án

```text
Hotel__Booking_System/
├── backend/
│   ├── src/main/java/com/hotel/
│   │   ├── common/              # Security, config, exception, utils
│   │   ├── config/              # Cloudinary, dotenv, cấu hình ứng dụng
│   │   └── modules/             # Các module nghiệp vụ
│   │       ├── auth/            # Đăng nhập, đăng ký, profile, role
│   │       ├── booking/         # Booking, scheduler, trạng thái đặt phòng
│   │       ├── booking_services/ # Dịch vụ đi kèm cho booking
│   │       ├── chatbot/         # Chatbot AI
│   │       ├── dashboard/       # Thống kê tổng quan
│   │       ├── email/           # Gửi email
│   │       ├── file/            # Upload file
│   │       ├── hotel/           # Hotel, amenity, service
│   │       ├── invoice/         # Hóa đơn và PDF
│   │       ├── payment/         # VNPay, MoMo, IPN
│   │       ├── review/          # Review / đánh giá
│   │       ├── rooms/           # Room, room type
│   │       └── voucher/         # Voucher, discount, usage
│   ├── src/main/resources/
│   │   ├── application.yml      # Cấu hình theo profile local/docker
│   │   └── templates/           # Email template, view template
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── features/            # Module UI theo domain
│   │   ├── routes/              # React Router
│   │   ├── shared/              # Layout, hooks, context, api, utils
│   │   ├── i18n/                # Đa ngôn ngữ
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── HotelBookingDB.sql        # Script khởi tạo DB
│   └── voucher_migration.sql     # Script migrate voucher
├── docs/
│   └── ERD_HotelBookingSystem.sql
├── docker-compose.yml
└── README.md
```

---

## Bắt đầu nhanh

### Yêu cầu hệ thống
- Java 21
- Node.js 20+ và npm
- Maven Wrapper có sẵn trong `backend/`
- Docker và Docker Compose nếu muốn chạy full stack
- SQL Server 2022 nếu chạy local không qua Docker

### Clone dự án

```bash
git clone <your-repository-url>
cd Hotel__Booking_System
```

---

## Biến môi trường

Dự án có 2 cách chạy: **local** và **docker**. Ở local, backend đọc cấu hình từ `backend/src/main/resources/application.yml` và file `.env` ở thư mục gốc. Khi chạy bằng Docker Compose, các biến được inject từ file `.env` ở root.

### Root `.env`

```env
SQL_SA_PASSWORD=your_sql_password
SPRING_DATASOURCE_URL=jdbc:sqlserver://localhost:1433;databaseName=HotelBookingDB;encrypt=false;trustServerCertificate=true
JWT_SECRET_KEY=your_jwt_secret
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OPENROUTER_API_KEY=your_openrouter_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Lưu ý
- Không commit giá trị thật của secret key lên repository.
- Backend đang dùng context path `/api/v1`.
- Swagger và Actuator cũng nằm dưới context path này.

---

## Chạy ứng dụng

### 1. Chạy backend local

```bash
cd backend
./mvnw spring-boot:run
```

Trên Windows:

```bash
cd backend
mvnw.cmd spring-boot:run
```

Backend chạy ở:
- `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/api/v1/v3/api-docs`
- Health check: `http://localhost:8080/api/v1/actuator/health`

### 2. Chạy frontend local

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy ở `http://localhost:3000`.

### 3. Chạy toàn bộ bằng Docker Compose

```bash
docker compose up --build
```

Sau khi lên xong, các dịch vụ chính sẽ có địa chỉ:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- SQL Server: `localhost:1433`

Để dừng và dọn volume:

```bash
docker compose down -v
```

---

## API & Tài liệu

Dự án có Swagger/OpenAPI, các controller trong backend đều được gắn annotation mô tả API. Khi chạy backend, bạn có thể xem trực tiếp tài liệu tại:

- `http://localhost:8080/api/v1/swagger-ui/index.html`
- `http://localhost:8080/api/v1/v3/api-docs`

Các nhóm API chính thường gặp:
- Auth và user profile
- Hotel, amenity, room, room type
- Booking và booking services
- Payment VNPay / MoMo
- Invoice và xuất PDF
- Voucher
- Dashboard
- Upload file
- Chatbot AI

---

## Scripts hữu ích

### Backend

```bash
./mvnw spring-boot:run          # Chạy ứng dụng
./mvnw test                     # Chạy test
./mvnw package -DskipTests      # Build jar
```

### Frontend

```bash
npm install                     # Cài dependency
npm run dev                     # Chạy dev server
npm run build                   # Build production
npm run preview                 # Xem bản build
npm run lint                    # Kiểm tra code
```

---

## Triển khai bằng Docker

### Thành phần trong `docker-compose.yml`
- `sqlserver`: SQL Server 2022.
- `db-init`: nạp script khởi tạo database từ `database/HotelBookingDB.sql`.
- `backend`: Spring Boot API.
- `frontend`: React app chạy qua Vite dev server trong container.

### Điểm đáng chú ý
- Backend chạy profile `docker`.
- Frontend lấy API URL từ biến build của Docker.
- Backend có healthcheck qua Actuator.
- Dữ liệu SQL Server được giữ trong volume riêng.

---

## Ghi chú kỹ thuật

- Backend dùng kiến trúc theo module nghiệp vụ, mỗi module có controller, service, repository, entity và DTO riêng.
- `@EnableScheduling` được bật để xử lý các tác vụ định kỳ như booking expiry.
- `open-in-view` tắt để tránh truy cập lazy-loading ngoài service layer.
- CORS được cấu hình để hỗ trợ frontend local và frontend chạy trong Docker.
- Hệ thống tích hợp cả thanh toán, email, upload, PDF và AI, nên khi triển khai thực tế cần đảm bảo các biến môi trường secret được cấu hình đầy đủ.

---

