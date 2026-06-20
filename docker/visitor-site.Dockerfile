# =====================================
# visitor-site.Dockerfile
# =====================================

FROM node:20-alpine AS builder

WORKDIR /app/visitor-site

COPY visitor-site/package*.json ./
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

COPY visitor-site/ .

ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

RUN npm run build 2>&1; \
    ls -la out/ 2>/dev/null && echo "OUT_EXISTS" || echo "NO_OUT_DIR"

FROM nginx:1.26-alpine
RUN apk add --no-cache curl
COPY --from=builder /app/visitor-site/out /usr/share/nginx/html
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/visitor-site.conf
server {
    listen       4000;
    server_name  localhost;
    root         /usr/share/nginx/html;
    index        index.html;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 1000;
    location / {
        try_files $uri $uri.html $uri/ =404;
        add_header Cache-Control "public, max-age=3600, must-revalidate";
    }
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|css|js|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:4000/ || exit 1
EXPOSE 4000
CMD ["nginx", "-g", "daemon off;"]
