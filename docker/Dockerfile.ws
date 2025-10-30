# Multi-stage build for primary websocket server
FROM oven/bun:1.3.1-alpine AS base

# Install system dependencies
RUN apk update
RUN apk add --no-cache libc6-compat

RUN bun install --global turbo@canary

# Prune project
FROM base AS pruner

# Set working directory
WORKDIR /app
COPY . .
RUN turbo prune @buzz8n/ws-server --docker

# Build stage
FROM base AS builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache bun ci --frozen-lockfile --production


# Build the project and its dependencies
COPY --from=pruner /app/out/full/ .
# Generate the prisma client
RUN bun db:generate
RUN bun run build

# Remove source code from image
RUN rm -rf ./**/*/src

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 ws
RUN adduser --system --uid 1001 server
USER server


# Copy only production dependencies
COPY --from=builder --chown=server:ws /app .

# Expose port
EXPOSE 8082

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8082

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/health || exit 1

# Start the application

CMD ["bun", "--filter", "@buzz8n/ws-server", "start"]
