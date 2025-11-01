package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

// jwtAuthMiddleware validates JWT tokens and loads user information
func (app *application) jwtAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract Authorization header
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "missing Authorization header",
				"message": "Please provide a valid JWT token in the Authorization header",
			})
			return
		}

		// Parse Bearer token
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid Authorization header format",
				"message": "Authorization header must be in format: Bearer <token>",
			})
			return
		}
		tokenString := parts[1]

		// Validate token signature and expiration
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			// Verify signing method
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(app.jwtSecret), nil
		})

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid token",
				"message": "Token is invalid or expired",
			})
			return
		}

		if !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid token",
				"message": "Token validation failed",
			})
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid token claims",
				"message": "Unable to parse token claims",
			})
			return
		}

		// Extract user ID
		uidFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid token claims",
				"message": "Token does not contain valid user_id",
			})
			return
		}
		userID := int(uidFloat)

		// Load user from database
		user, err := app.models.Users.Get(userID)
		if err != nil {
			log.Printf("Error loading user %d: %v", userID, err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error":   "failed to load user",
				"message": "An error occurred while validating your account",
			})
			return
		}

		if user == nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "user not found",
				"message": "The user associated with this token no longer exists",
			})
			return
		}

		// Store user in context for downstream handlers
		c.Set("user", user)
		c.Set("user_id", userID)
		c.Next()
	}
}

func (app *application) requireOwnerOrAdmin(c *gin.Context, ownerID int) bool {
	u, err := app.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return false
	}
	if u.ID == ownerID {
		return true
	}
	if u.Role == "admin" {
		return true
	}
	c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
	return false
}

func requireOwnerOrAdmin(app *application, c *gin.Context, ownerID int) bool {
	return app.requireOwnerOrAdmin(c, ownerID)
}

// corsMiddleware handles Cross-Origin Resource Sharing (CORS) with configurable origins
func corsMiddleware(allowedOrigins []string) gin.HandlerFunc {
	// Pre-compile allowed origins for better performance
	originMap := make(map[string]bool, len(allowedOrigins))
	hasWildcard := false

	for _, origin := range allowedOrigins {
		if origin == "*" {
			hasWildcard = true
			break
		}
		originMap[origin] = true
	}

	// Always allow localhost for development
	originMap["http://localhost:3000"] = true
	originMap["http://127.0.0.1:3000"] = true
	originMap["http://localhost:8080"] = true

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Handle preflight OPTIONS request first
		if c.Request.Method == "OPTIONS" {
			// Set CORS headers for preflight
			if hasWildcard {
				c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
			} else if originMap[origin] {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				c.Writer.Header().Set("Vary", "Origin")
			}

			c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization, X-Request-ID, X-CSRF-Token")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// Set CORS headers for actual requests
		if hasWildcard {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else if originMap[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		c.Next()
	}
}

// securityHeadersMiddleware adds security headers to all responses
func securityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")
		// Skip HSTS for development (localhost)
		if c.Request.Host != "localhost" && c.Request.Host != "localhost:8080" {
			c.Writer.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		// Relaxed CSP for API
		c.Writer.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Writer.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		c.Next()
	}
}

// requestIDMiddleware adds a unique request ID to each request for tracing
func requestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if request ID already provided by client
		requestID := c.Request.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		// Set in response headers and context
		c.Writer.Header().Set("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}

// recoveryMiddleware recovers from panics and returns a 500 error
func recoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// Get request ID for tracking
				requestID, _ := c.Get("request_id")
				requestIDStr := "unknown"
				if id, ok := requestID.(string); ok {
					requestIDStr = id
				}

				// Log the panic with stack trace
				log.Printf("[PANIC] Request ID: %s | Error: %v | Path: %s %s | IP: %s",
					requestIDStr,
					err,
					c.Request.Method,
					c.Request.URL.Path,
					c.ClientIP(),
				)

				// Return error response
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":      "Internal server error",
					"message":    "An unexpected error occurred. Please try again later.",
					"request_id": requestIDStr,
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

// timeoutMiddleware adds a timeout to requests (optional, can be enabled if needed)
func timeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create a context with timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		// Replace request context
		c.Request = c.Request.WithContext(ctx)

		// Channel to signal completion
		finished := make(chan struct{})

		go func() {
			c.Next()
			close(finished)
		}()

		select {
		case <-finished:
			// Request completed normally
			return
		case <-ctx.Done():
			// Request timed out
			if ctx.Err() == context.DeadlineExceeded {
				c.JSON(http.StatusGatewayTimeout, gin.H{
					"error":   "Request timeout",
					"message": "The request took too long to process",
				})
				c.Abort()
			}
		}
	}
}

// requestLoggerMiddleware logs all incoming requests with detailed information
func requestLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Store start time for other middleware
		c.Set("request_start", start)

		// Process request
		c.Next()

		// Calculate request duration
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()

		// Get request ID if available
		requestID, _ := c.Get("request_id")
		requestIDStr := ""
		if id, ok := requestID.(string); ok {
			requestIDStr = fmt.Sprintf(" [%s]", id[:8]) // Show first 8 chars
		}

		// Build full path with query string
		if raw != "" {
			path = path + "?" + raw
		}

		// Get user agent
		userAgent := c.Request.UserAgent()
		if len(userAgent) > 50 {
			userAgent = userAgent[:50] + "..."
		}

		// Color code status for terminal output
		statusColor := ""
		switch {
		case statusCode >= 500:
			statusColor = "🔴" // Server error
		case statusCode >= 400:
			statusColor = "🟡" // Client error
		case statusCode >= 300:
			statusColor = "🔵" // Redirect
		case statusCode >= 200:
			statusColor = "🟢" // Success
		default:
			statusColor = "⚪" // Other
		}

		// Log errors if any
		errorMessage := ""
		if len(c.Errors) > 0 {
			errorMessage = " | ERR: " + c.Errors.String()
		}

		// Format log message
		log.Printf("[API]%s %s %3d | %13v | %8d bytes | %15s | %-7s %s | UA: %s%s",
			requestIDStr,
			statusColor,
			statusCode,
			latency,
			bodySize,
			clientIP,
			method,
			path,
			userAgent,
			errorMessage,
		)

		// Log slow requests (> 1 second)
		if latency > time.Second {
			log.Printf("[SLOW] Request took %v: %s %s", latency, method, path)
		}
	}
}

// rateLimiter implements a token bucket rate limiter with automatic cleanup
type rateLimiter struct {
	mu       sync.RWMutex
	visitors map[string]*visitor
	rate     int
}

type visitor struct {
	lastSeen  time.Time
	tokens    int
	blocked   bool
	blockedAt time.Time
}

func newRateLimiter() *rateLimiter {
	rl := &rateLimiter{
		visitors: make(map[string]*visitor),
	}

	// Cleanup goroutine - runs every minute
	go func() {
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

// cleanup removes stale visitor entries to prevent memory leaks
func (rl *rateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, v := range rl.visitors {
		// Remove visitors inactive for more than 5 minutes
		if now.Sub(v.lastSeen) > 5*time.Minute {
			delete(rl.visitors, ip)
		}
		// Unblock temporarily blocked IPs after 5 minutes
		if v.blocked && now.Sub(v.blockedAt) > 5*time.Minute {
			v.blocked = false
		}
	}

	// Log cleanup stats periodically (every 10th cleanup)
	if len(rl.visitors) > 100 {
		log.Printf("[RATE_LIMITER] Active visitors: %d", len(rl.visitors))
	}
}

func (rl *rateLimiter) middleware(requestsPerMinute int) gin.HandlerFunc {
	rl.rate = requestsPerMinute

	return func(c *gin.Context) {
		// Get client IP
		ip := c.ClientIP()

		// Skip rate limiting for health checks
		if c.Request.URL.Path == "/health" || c.Request.URL.Path == "/version" {
			c.Next()
			return
		}

		rl.mu.Lock()
		v, exists := rl.visitors[ip]

		// New visitor - grant full bucket
		if !exists {
			rl.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				tokens:   requestsPerMinute - 1, // Consume one token for this request
				blocked:  false,
			}
			rl.mu.Unlock()
			c.Next()
			return
		}

		// Check if visitor is temporarily blocked
		if v.blocked {
			retryAfter := 300 - int(time.Since(v.blockedAt).Seconds())
			if retryAfter < 0 {
				// Unblock and reset
				v.blocked = false
				v.tokens = requestsPerMinute - 1
				v.lastSeen = time.Now()
				rl.mu.Unlock()
				c.Next()
				return
			}

			rl.mu.Unlock()
			c.Header("Retry-After", fmt.Sprintf("%d", retryAfter))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"message":     "Too many requests. You have been temporarily blocked.",
				"retry_after": retryAfter,
			})
			c.Abort()
			return
		}

		// Refill tokens based on elapsed time (token bucket algorithm)
		elapsed := time.Since(v.lastSeen)
		tokensToAdd := int(elapsed.Seconds() * float64(requestsPerMinute) / 60.0)
		v.tokens += tokensToAdd

		// Cap at maximum rate
		if v.tokens > requestsPerMinute {
			v.tokens = requestsPerMinute
		}

		v.lastSeen = time.Now()

		// Check if tokens available
		if v.tokens > 0 {
			v.tokens--

			// Add rate limit headers
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", requestsPerMinute))
			c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", v.tokens))
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(time.Minute).Unix()))

			rl.mu.Unlock()
			c.Next()
		} else {
			// No tokens left - block the visitor temporarily
			v.blocked = true
			v.blockedAt = time.Now()

			log.Printf("[RATE_LIMITER] Blocked IP: %s (exceeded %d req/min)", ip, requestsPerMinute)

			rl.mu.Unlock()
			c.Header("Retry-After", "300")
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", requestsPerMinute))
			c.Header("X-RateLimit-Remaining", "0")
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"message":     "Too many requests. Please try again later.",
				"retry_after": 300,
			})
			c.Abort()
		}
	}
}
