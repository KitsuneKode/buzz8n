# Multi-stage build for background worker application
FROM oven/bun:1.2.18-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY apps/worker/package.json ./apps/worker/
COPY packages/*/package.json ./packages/*/
COPY toolings/*/package.json ./toolings/*/

# Install dependencies
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

# Set working directory to worker app
WORKDIR /app/apps/worker

# Build the application
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker

# Copy built application
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/packages ./packages

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Set correct permissions
RUN chown -R worker:nodejs /app
USER worker

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start the application
CMD ["bun", "run", "apps/worker/dist/index.js"]







