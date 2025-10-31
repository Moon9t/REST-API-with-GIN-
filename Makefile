.PHONY: help build run test clean migrate swagger docker-build docker-run dev prod

# Variables
APP_NAME := eventhub-api
VERSION := 1.0.0
BUILD_TIME := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
LDFLAGS := -X 'main.version=$(VERSION)' -X 'main.buildTime=$(BUILD_TIME)' -X 'main.gitCommit=$(GIT_COMMIT)'

help: ## Show this help message
	@echo "EventHub API - Eclipse Softworks"
	@echo "=================================="
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the application binary
	@echo "🔨 Building $(APP_NAME)..."
	@go build -ldflags="$(LDFLAGS)" -o bin/$(APP_NAME) ./cmd/api
	@echo "✅ Build complete: bin/$(APP_NAME)"

run: ## Run the application
	@echo "🚀 Starting $(APP_NAME)..."
	@cd cmd/api && go run .

dev: ## Run with hot reload (requires air)
	@echo "🔄 Starting development server with hot reload..."
	@air -c .air.toml

test: ## Run all tests
	@echo "🧪 Running tests..."
	@go test ./... -v -race -coverprofile=coverage.out

test-coverage: test ## Run tests and show coverage report
	@echo "📊 Generating coverage report..."
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✅ Coverage report: coverage.html"

migrate: ## Run database migrations
	@echo "🗄️  Running migrations..."
	@cd cmd/migrate && go run .
	@echo "✅ Migrations complete"

migrate-force: ## Force run database migrations
	@echo "🗄️  Force running migrations..."
	@FORCE_MIGRATE=1 cd cmd/migrate && go run .
	@echo "✅ Migrations complete"

swagger: ## Generate Swagger documentation
	@echo "📚 Generating Swagger docs..."
	@swag init -g cmd/api/main.go -o cmd/api/docs --parseDependency --parseInternal
	@echo "✅ Swagger docs generated"

lint: ## Run linter
	@echo "🔍 Running linter..."
	@golangci-lint run ./... || (echo "💡 Tip: install golangci-lint with: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest" && exit 1)

fmt: ## Format code
	@echo "✨ Formatting code..."
	@go fmt ./...
	@echo "✅ Code formatted"

vet: ## Run go vet
	@echo "🔍 Running go vet..."
	@go vet ./...
	@echo "✅ Vet complete"

clean: ## Clean build artifacts
	@echo "🧹 Cleaning..."
	@rm -rf bin/ coverage.out coverage.html tmp/
	@echo "✅ Clean complete"

docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	@docker build \
		--build-arg VERSION=$(VERSION) \
		--build-arg BUILD_TIME=$(BUILD_TIME) \
		--build-arg GIT_COMMIT=$(GIT_COMMIT) \
		-t $(APP_NAME):$(VERSION) \
		-t $(APP_NAME):latest \
		.
	@echo "✅ Docker image built: $(APP_NAME):$(VERSION)"

docker-run: ## Run Docker container
	@echo "🐳 Running Docker container..."
	@docker run -d \
		-p 8080:8080 \
		--name $(APP_NAME) \
		-v $$(pwd)/data:/app/data \
		$(APP_NAME):latest
	@echo "✅ Container started: http://localhost:8080"

docker-stop: ## Stop Docker container
	@echo "🛑 Stopping Docker container..."
	@docker stop $(APP_NAME) || true
	@docker rm $(APP_NAME) || true
	@echo "✅ Container stopped"

docker-logs: ## Show Docker container logs
	@docker logs -f $(APP_NAME)

compose-up: ## Start services with docker-compose
	@echo "🚀 Starting services with docker-compose..."
	@docker-compose up -d
	@echo "✅ Services started"

compose-down: ## Stop services with docker-compose
	@echo "🛑 Stopping services..."
	@docker-compose down
	@echo "✅ Services stopped"

compose-logs: ## Show docker-compose logs
	@docker-compose logs -f

install-tools: ## Install development tools
	@echo "📦 Installing development tools..."
	@go install github.com/swaggo/swag/cmd/swag@v1.8.12
	@go install github.com/cosmtrek/air@latest
	@echo "✅ Tools installed"

mod-tidy: ## Tidy go modules
	@echo "📦 Tidying modules..."
	@go mod tidy
	@echo "✅ Modules tidied"

security-check: ## Run security checks (requires gosec)
	@echo "🔒 Running security checks..."
	@gosec -quiet ./... || (echo "💡 Tip: install gosec with: go install github.com/securego/gosec/v2/cmd/gosec@latest" && exit 1)

prod: build ## Build for production
	@echo "🎯 Production build complete!"
	@echo ""
	@echo "To run in production:"
	@echo "  1. Set environment variables (see .env.example)"
	@echo "  2. Run: ./bin/$(APP_NAME)"
	@echo ""
	@echo "Or use Docker:"
	@echo "  make docker-build && make docker-run"

all: clean fmt vet test build ## Run all checks and build

.DEFAULT_GOAL := help
