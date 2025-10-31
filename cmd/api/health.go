package main

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	version   = "1.0.0"
	buildTime = "unknown"
	gitCommit = "unknown"
)

type HealthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Version   string            `json:"version"`
	Checks    map[string]string `json:"checks"`
}

type VersionResponse struct {
	Version   string `json:"version"`
	BuildTime string `json:"build_time"`
	GitCommit string `json:"git_commit"`
	GoVersion string `json:"go_version"`
	Vendor    string `json:"vendor"`
}

// @Summary Health check
// @Description Check the health status of the API and its dependencies
// @Tags Health
// @Produce json
// @Success 200 {object} HealthResponse
// @Failure 503 {object} HealthResponse
// @Router /health [get]
func (app *application) healthCheck(c *gin.Context) {
	checks := make(map[string]string)
	healthy := true

	// Database health check
	if err := app.db.Ping(); err != nil {
		checks["database"] = "unhealthy: " + err.Error()
		healthy = false
	} else {
		checks["database"] = "healthy"
	}

	status := "healthy"
	statusCode := http.StatusOK
	if !healthy {
		status = "unhealthy"
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, HealthResponse{
		Status:    status,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   version,
		Checks:    checks,
	})
}

// @Summary API version information
// @Description Get version and build information for the API
// @Tags Health
// @Produce json
// @Success 200 {object} VersionResponse
// @Router /version [get]
func (app *application) versionInfo(c *gin.Context) {
	c.JSON(http.StatusOK, VersionResponse{
		Version:   version,
		BuildTime: buildTime,
		GitCommit: gitCommit,
		GoVersion: runtime.Version(),
		Vendor:    "Eclipse Softworks",
	})
}
