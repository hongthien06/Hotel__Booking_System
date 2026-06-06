# 🚀 Hướng Dẫn Deploy — Hotel Booking Management System (HBMS)

## Mục lục

- [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Biến môi trường](#biến-môi-trường)
- [1. Chạy local (Development)](#1-chạy-local-development)
- [2. Deploy Production với Docker Compose](#2-deploy-production-với-docker-compose)
- [3. CI/CD Pipeline (GitHub Actions)](#3-cicd-pipeline-github-actions)
- [4. Deploy lên AWS EC2](#4-deploy-lên-aws-ec2)
- [Cấu trúc Docker Images](#cấu-trúc-docker-images)
- [Xử lý sự cố](#xử-lý-sự-cố)

---

## Tổng quan kiến trúc

```
                        ┌─────────────────────────────┐
                        │         AWS EC2 Server       │
                        │                              │
  Client (Browser) ───► │  Frontend (Nginx :3000)      │
                        │       │                      │
                        │       │ proxy /api/*         │
                        │       ▼                      │
                        │  Backend (Spring Boot :8080) │
                        │       │                      │
                        │       │ JDBC                 │
                        │       ▼                      │
                        │  SQL Server 2022 (:1433)     │
                        └─────────────────────────────┘
```

| Service     | Image                                   | Port | Mô tả                          |
|-------------|-----------------------------------------|------|--------------------------------|
| `sqlserver` | `mcr.microsoft.com/mssql/server:2022`   | 1433 | Cơ sở dữ liệu chính            |
| `db-init`   | `mcr.microsoft.com/mssql/server:2022`   | —    | Init schema (chạy 1 lần)       |
| `backend`   | `<hub>/booking-backend:<tag>`           | 8080 | Spring Boot REST API           |
| `frontend`  | `<hub>/booking-frontend:<tag>`          | 3000 | React + Vite, serve bằng Nginx |

---

## Yêu cầu hệ thống

### Local / Development
| Công cụ        | Phiên bản tối thiểu |
|----------------|----------------------|
| JDK            | 21 (Temurin)         |
| Maven          | 3.9+                 |
| Node.js        | 20 LTS               |
| npm            | 9+                   |
| Docker         | 24+                  |
| Docker Compose | v2 (plugin)          |
| SQL Server     | 2022                 |

### Server (Production / EC2)
| Tài nguyên | Tối thiểu | Khuyến nghị |
|------------|-----------|-------------|
| CPU        | 2 vCPU    | 4 vCPU      |
| RAM        | 4 GB      | 8 GB        |
| Disk       | 20 GB SSD | 40 GB SSD   |
| OS         | Ubuntu 22.04 LTS |      |

---

## Biến môi trường

Tạo file `.env` ở **thư mục gốc** dự án. File này được dùng cho cả `docker-compose.yml` (local) lẫn server.

```dotenv
# ─── Database ────────────────────────────────────────────────
SQL_SA_PASSWORD=<mật_khẩu_sql_server>      # Bắt buộc, tối thiểu 8 ký tự, có chữ hoa/thường/số/ký tự đặc biệt

# ─── JWT ─────────────────────────────────────────────────────
JWT_SECRET_KEY=<chuỗi_bí_mật_jwt>          # Bắt buộc

# ─── Email (Gmail SMTP) ───────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<gmail_của_bạn>@gmail.com
MAIL_PASSWORD=<app_password_gmail>          # Tạo tại: myaccount.google.com/apppasswords

# ─── VNPay ───────────────────────────────────────────────────
VNPAY_TMN_CODE=<vnpay_tmn_code>
VNPAY_HASH_SECRET=<vnpay_hash_secret>

# ─── MoMo ────────────────────────────────────────────────────
MOMO_PARTNER_CODE=<momo_partner_code>
MOMO_ACCESS_KEY=<momo_access_key>
MOMO_SECRET_KEY=<momo_secret_key>

# ─── Cloudinary ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# ─── Gemini AI ───────────────────────────────────────────────
GEMINI_API_KEY=<gemini_api_key>

# ─── URL & CORS ──────────────────────────────────────────────
RETURN_URL=https://<domain_của_bạn>/payment?step=3
APP_FRONTEND_URL=https://<domain_của_bạn>
APP_CORS_ALLOWED_ORIGINS=https://<domain_của_bạn>,https://www.<domain_của_bạn>

# ─── Docker Hub ──────────────────────────────────────────────
DOCKERHUB_USERNAME=<dockerhub_username>
IMAGE_TAG=latest                            # CD pipeline tự cập nhật
```

> **⚠️ Lưu ý bảo mật:** Không commit file `.env` lên git. File này đã có trong `.gitignore`.

---

## 1. Chạy local (Development)

### Cách 1: Docker Compose (khuyến nghị)

Dùng `docker-compose.yml` ở thư mục gốc — build image trực tiếp từ source code.

```bash
# Sao chép và cấu hình biến môi trường
cp .env.example .env   # (hoặc tạo .env theo mẫu ở trên)

# Khởi động toàn bộ stack
docker compose up -d

# Kiểm tra log
docker compose logs -f backend
docker compose logs -f frontend

# Dừng
docker compose down
```

> **Lưu ý:** Frontend dev server chạy ở port `3000` với hot-reload. API được proxy từ `/api/*` sang backend `http://backend:8080`.

### Cách 2: Chạy thủ công từng service

**Backend:**
```bash
cd backend

# Đảm bảo SQL Server local đang chạy ở port 1433
# application.yml profile "local" sẽ kết nối localhost:1433

mvn spring-boot:run
# Hoặc build JAR rồi chạy
mvn clean package -DskipTests
java -jar target/hotel-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Truy cập: http://localhost:5173
```

---

## 2. Deploy Production với Docker Compose

Dùng file `deploy/docker-compose-deploy.yml` — sử dụng **image đã build sẵn** từ Docker Hub.

### Bước 1: Chuẩn bị server

```bash
# Cài Docker & Docker Compose (Ubuntu)
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# Thêm user hiện tại vào group docker
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra
docker --version
docker compose version
```

### Bước 2: Chuẩn bị file trên server

```bash
# Tạo thư mục làm việc
mkdir -p /home/ubuntu/hbms
cd /home/ubuntu/hbms

# Sao chép file cần thiết lên server
# (Từ máy local chạy lệnh sau, hoặc dùng git clone)
scp .env ubuntu@<server_ip>:/home/ubuntu/.env
scp database/HotelBookingDB.sql ubuntu@<server_ip>:/home/ubuntu/database/HotelBookingDB.sql
scp deploy/docker-compose-deploy.yml ubuntu@<server_ip>:/home/ubuntu/docker-compose.yml
```

> **Hoặc** clone repo lên server và chỉnh sửa `.env`:
> ```bash
> git clone https://github.com/<org>/Hotel__Booking_System.git
> cd Hotel__Booking_System
> # Chỉnh sửa .env với giá trị production
> ```

### Bước 3: Khởi động ứng dụng

```bash
# Pull images từ Docker Hub
docker compose pull

# Khởi động toàn bộ stack
docker compose up -d

# Kiểm tra trạng thái các container
docker compose ps

# Xem log
docker compose logs -f backend
docker compose logs -f frontend
```

### Bước 4: Kiểm tra health

```bash
# Backend health check
curl http://localhost:8080/api/v1/actuator/health

# Frontend
curl http://localhost:3000/health
```

---

## 3. CI/CD Pipeline (GitHub Actions)

### Tổng quan luồng

```
Push to main/develop
        │
        ▼
  ┌─────────────────────────────┐
  │         CI Pipeline         │
  │  (ci.yml — chạy song song)  │
  │                             │
  │  ┌──────────┐ ┌──────────┐  │
  │  │ Backend  │ │Frontend  │  │
  │  │ Build +  │ │Build +   │  │
  │  │ Test     │ │ Upload   │  │
  │  └────┬─────┘ └────┬─────┘  │
  │       └─────┬───────┘       │
  │             ▼               │
  │     ┌──────────────┐        │
  │     │ Docker Build │        │
  │     │ & Push Hub   │        │
  │     └──────────────┘        │
  └─────────────────────────────┘
        │ (CI thành công)
        ▼
  ┌─────────────────────────────┐
  │         CD Pipeline         │
  │  (cd.yml — chỉ branch main) │
  │                             │
  │  SSH vào EC2 → Pull image   │
  │  → docker compose up -d     │
  └─────────────────────────────┘
```

### GitHub Secrets cần thiết

Vào **Settings → Secrets and variables → Actions** của repository, thêm:

| Secret                | Mô tả                                        |
|-----------------------|----------------------------------------------|
| `DOCKERHUB_USERNAME`  | Tên tài khoản Docker Hub                     |
| `DOCKERHUB_TOKEN`     | Access token Docker Hub (không dùng password)|
| `MSSQL_SA_PASSWORD`   | Mật khẩu SA cho SQL Server trong CI tests    |
| `SSH_HOST`            | IP public của EC2 server                     |
| `SSH_USERNAME`        | User SSH (thường là `ubuntu`)                |
| `SSH_PRIVATE_KEY`     | Nội dung file `.pem` / private key SSH       |

### Docker Hub Images

Sau khi CI chạy thành công, 2 images sẽ được push lên Docker Hub:

```
<DOCKERHUB_USERNAME>/booking-backend:<commit-sha>
<DOCKERHUB_USERNAME>/booking-backend:latest

<DOCKERHUB_USERNAME>/booking-frontend:<commit-sha>
<DOCKERHUB_USERNAME>/booking-frontend:latest
```

---

## 4. Deploy lên AWS EC2

### Cấu hình Security Group

Mở các port sau trong AWS Security Group của EC2:

| Port | Protocol | Source    | Mục đích               |
|------|----------|-----------|------------------------|
| 22   | TCP      | Your IP   | SSH                    |
| 80   | TCP      | 0.0.0.0/0 | HTTP (nếu dùng Nginx)  |
| 443  | TCP      | 0.0.0.0/0 | HTTPS                  |
| 3000 | TCP      | 0.0.0.0/0 | Frontend (tạm thời)    |
| 8080 | TCP      | 0.0.0.0/0 | Backend API (tạm thời) |

> **Khuyến nghị:** Đặt Nginx reverse proxy ở phía trước để chỉ expose port 80/443 ra ngoài.

### Cấu hình EC2 lần đầu

```bash
# SSH vào server
ssh -i <key.pem> ubuntu@<ec2-public-ip>

# Cài đặt môi trường
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y docker.io docker-compose-plugin git

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# Logout và login lại để group docker có hiệu lực
exit
ssh -i <key.pem> ubuntu@<ec2-public-ip>

# Tạo thư mục và copy file cần thiết
mkdir -p /home/ubuntu/database

# Tạo .env với giá trị production thực tế
nano /home/ubuntu/.env

# Copy docker-compose file
# (Từ repo hoặc scp từ local)
```

### Auto-deploy với CD Pipeline

Khi code được push lên branch `main` và CI thành công, CD Pipeline sẽ tự động:

1. SSH vào EC2
2. Xóa images cũ (`docker image prune -af`)
3. Cập nhật `IMAGE_TAG` trong `.env` thành commit SHA mới nhất
4. Pull images mới từ Docker Hub (retry tối đa 10 lần, cách 8 giây)
5. Chạy `docker compose up -d --force-recreate`
6. Dọn dẹp images không dùng

> **Lưu ý:** CD chỉ chạy khi push vào `main` (hoặc `master`) và CI phải **thành công** trước.

---

## Cấu trúc Docker Images

### Backend (`booking-backend`)

```dockerfile
# Stage 1: Build với Maven + JDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
# → Tạo ra hotel-0.0.1-SNAPSHOT.jar

# Stage 2: Runtime nhẹ với JRE Alpine
FROM eclipse-temurin:21-jre-alpine AS runtime
# → Chạy với user non-root (hbms)
# → JVM: -Xms256m -Xmx512m -XX:+UseContainerSupport
# → Health check: GET /api/v1/actuator/health
```

### Frontend (`booking-frontend`)

```dockerfile
# Stage 1: Build với Node 20 Alpine
FROM node:20-alpine AS builder
# → npm ci + npm run build → /app/dist

# Stage 2: Runtime với Nginx 1.27 Alpine
FROM nginx:1.27-alpine AS runtime
# → Serve static files từ /usr/share/nginx/html
# → Gzip bật, cache 1 năm cho assets có hash
# → Proxy /api/* → http://backend:8080
# → SPA fallback: mọi route → index.html
# → Health check: GET /health

# Stage 3: Development (dùng cho docker-compose.yml local)
FROM node:20-alpine AS development
# → npm run dev với hot-reload
```

---

## Xử lý sự cố

### Container không khởi động được

```bash
# Xem log chi tiết
docker compose logs --tail=100 <service_name>

# Ví dụ
docker compose logs --tail=100 backend
docker compose logs --tail=100 sqlserver
```

### Database không kết nối được

```bash
# Kiểm tra SQL Server container đang chạy
docker compose ps sqlserver

# Thử kết nối trực tiếp vào container
docker exec -it hbms-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "<SQL_SA_PASSWORD>" -Q "SELECT @@VERSION"

# Xem log db-init
docker compose logs db-init
```

### Lỗi `IMAGE_TAG` trong CD

Kiểm tra `.env` trên server có dòng `IMAGE_TAG=` hay không. CD pipeline sẽ tự cập nhật giá trị này.

```bash
# Kiểm tra
cat /home/ubuntu/.env | grep IMAGE_TAG

# Cập nhật thủ công nếu cần
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=latest/" /home/ubuntu/.env
```

### Reset toàn bộ (xóa cả data)

```bash
# ⚠️ Cảnh báo: Lệnh này xóa toàn bộ dữ liệu database!
docker compose down -v

# Khởi động lại từ đầu (db-init sẽ chạy lại)
docker compose up -d
```

### Xem logs ứng dụng

```bash
# Backend logs được mount vào volume backend-logs
docker exec -it hbms-backend tail -f /app/logs/hbms.log

# Hoặc xem qua docker compose
docker compose logs -f --tail=200 backend
```

---

## Kiểm tra sau deploy

Sau khi deploy thành công, kiểm tra các endpoint sau:

```bash
SERVER="http://<server-ip>"  # hoặc https://<domain>

# 1. Frontend load được
curl -I $SERVER:3000

# 2. Backend health check
curl $SERVER:8080/api/v1/actuator/health

# 3. API endpoint cơ bản
curl $SERVER:8080/api/v1/rooms

# 4. Frontend proxy tới backend (qua Nginx)
curl $SERVER:3000/api/v1/actuator/health
```
