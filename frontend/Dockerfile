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
RUN npm ci

# Nhận API URL từ docker-compose args (override frontend/.env lúc build)
ARG VITE_API_URL=/api/v1
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
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Gzip\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
\n\
    # Health check\n\
    location /health {\n\
        return 200 "OK";\n\
        add_header Content-Type text/plain;\n\
    }\n\
\n\
    # Cache static assets (Vite hash ten file)\n\
    location ~* \\.(js|css|png|jpg|jpeg|svg|ico|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    # Proxy API requests to backend\n\
    location /api {\n\
        proxy_pass http://backend:8080;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_set_header Origin "";\n\
    }\n\
\n\
    # SPA fallback: route -> index.html (React Router xu ly)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
        add_header Cache-Control "no-store";\n\
    }\n\
}\n' > /etc/nginx/conf.d/hbms.conf

# Copy static files từ stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]



# ── STAGE 3: DEV ────────────────────────────────
FROM node:20-alpine AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 5173 3000 80
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
