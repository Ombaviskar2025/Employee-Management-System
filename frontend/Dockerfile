# ─────────────────────────────────────────────────────────
# Frontend Dockerfile
# Build with Vite, serve with nginx
# ─────────────────────────────────────────────────────────

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage — serve with nginx
FROM nginx:1.25-alpine AS runner

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config for SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
