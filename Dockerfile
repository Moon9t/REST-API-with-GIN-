# Build stage
FROM golang:1.21-alpine AS build

# Install build dependencies (CGO required for SQLite)
RUN apk add --no-cache git gcc musl-dev sqlite-dev

WORKDIR /src

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . ./

# Build with version info and CGO enabled for SQLite
ARG VERSION=1.0.0
ARG BUILD_TIME
ARG GIT_COMMIT

RUN cd cmd/api && CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-X 'main.version=${VERSION}' -X 'main.buildTime=${BUILD_TIME}' -X 'main.gitCommit=${GIT_COMMIT}' -w -s" \
    -o /app/eventhub-api ./

# Production stage
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache ca-certificates sqlite-libs tzdata wget

# Create non-root user for security
RUN addgroup -g 1000 eventhub && \
    adduser -D -u 1000 -G eventhub eventhub

WORKDIR /app

# Copy binary from builder
COPY --from=build /app/eventhub-api ./eventhub-api

# Copy migrations
COPY --from=build /src/cmd/migrate/migrations ./cmd/migrate/migrations

# Copy web assets
COPY --from=build /src/web ./web

# Create data directory and set permissions
RUN mkdir -p /app/data && chown -R eventhub:eventhub /app

# Switch to non-root user
USER eventhub

# Expose port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV GIN_MODE=release

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run application
CMD ["./eventhub-api"]
