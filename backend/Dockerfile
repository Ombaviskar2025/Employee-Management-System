# ─────────────────────────────────────────────────────────
# Backend Dockerfile
# Multi-stage: deps → production image
# ─────────────────────────────────────────────────────────

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies
FROM base AS deps
RUN npm ci --only=production

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server.js"]
