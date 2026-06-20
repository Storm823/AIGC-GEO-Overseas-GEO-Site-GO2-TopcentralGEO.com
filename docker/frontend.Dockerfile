# =====================================
# frontend.Dockerfile
# =====================================

FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

COPY frontend/ .

ARG REACT_APP_API_URL=/api/v1
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=production

RUN npm run build; \
    ls -la dist/ 2>/dev/null && echo "DIST_EXISTS" || echo "NO_DIST_DIR"

FROM nginx:1.26-alpine
RUN apk add --no-cache curl
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/frontend.conf
server {
    listen       3000;
    server_name  localhost;
    root         /usr/share/nginx/html;
    index        index.html;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    error_page 404 /index.html;
}
EOF
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
