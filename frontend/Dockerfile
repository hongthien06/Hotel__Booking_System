# ============================================================
#  HBMS - frontend/Dockerfile
#  React + Vite → Nginx Alpine
#  Dùng npm (thấy package-lock.json trong ảnh, không phải yarn.lock)
# ============================================================

# ── STAGE 1: BUILD ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lock file TRƯỚC → cache node_modules layer
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Nhận API URL từ docker-compose args (override frontend/.env lúc build)
ARG VITE_API_URL=http://localhost:8080/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Copy toàn bộ source và build
COPY . .
RUN npm run build
# Output: /app/dist

# ── STAGE 2: RUNTIME (Nginx) ────────────────────────────────
FROM nginx:1.27-alpine AS runtime

LABEL maintainer="HBMS Team"

# Xóa config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Nginx config tối giản (reverse proxy + SPA fallback)
# Lưu thẳng vào image, không cần file bên ngoài
RUN cat > /etc/nginx/conf.d/hbms.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # Health check
    location /health {
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # Cache static assets (Vite đã hash tên file)
    location ~* \.(js|css|png|jpg|jpeg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback: Mọi route → index.html (React Router xử lý)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store";
    }
}
EOF

# Copy static files từ stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
