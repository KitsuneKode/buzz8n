# Multi-stage build for Express server application
FROM oven/bun:1.2.18-alpine AS base

# Install system dependencies
RUN apk add --no-cache curl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/
COPY toolings/*/package.json ./toolings/*/

# Install dependencies
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

# Set working directory to server app
WORKDIR /app/apps/server

# Build the application
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server

# Copy built application
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/packages ./packages

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Set correct permissions
RUN chown -R server:nodejs /app
USER server

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["bun", "run", "apps/server/dist/index.js"]







