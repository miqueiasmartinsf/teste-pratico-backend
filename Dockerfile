FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN node ace build

# ─── Production stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3333

CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
