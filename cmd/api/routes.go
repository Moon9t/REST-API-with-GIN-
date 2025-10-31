package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (app *application) routes() *gin.Engine {
	// Use custom middleware instead of Default()
	g := gin.New()
	g.Use(gin.Recovery())

	// Production middleware (CORS must be first)
	g.Use(corsMiddleware([]string{"http://localhost:3000", "https://eclipse-softworks.com"}))
	g.Use(requestIDMiddleware())
	g.Use(requestLoggerMiddleware())
	g.Use(securityHeadersMiddleware())

	// Rate limiting: 100 requests per minute per IP
	rl := newRateLimiter()
	g.Use(rl.middleware(100))

	// Health and monitoring endpoints (no rate limiting)
	g.GET("/health", app.healthCheck)
	g.GET("/version", app.versionInfo)

	g.GET("/events", func(c *gin.Context) {
		c.Redirect(http.StatusPermanentRedirect, "/api/v1/events")
	})

	// Public routes
	public := g.Group("/api/v1")
	{
		public.GET("/events", app.getAllEvets)
		public.GET("/events/:id", app.getEvent)

		public.POST("/auth/register", app.createUser)
		public.POST("/auth/login", app.loginUser)
	}

	auth := g.Group("/api/v1")
	auth.Use(app.jwtAuthMiddleware())
	{
		auth.POST("/events", app.createEvent)
		auth.PUT("/events/:id", app.updateEvent)
		auth.DELETE("/events/:id", app.deleteEvent)

		auth.POST("/events/:id/attendees", app.addEventAttendee)
		auth.GET("/events/:id/attendees", app.getEventAttendees)
		auth.DELETE("/events/:id/attendees/:userId", app.deleteAttendeeFromEvent)
		auth.GET("/attendees/:id/events", app.getUserEvents)
	}
	// Serve EventHub static UI
	g.Static("/eventhub", "web/eventhub")

	// Expose repository scripts (single files) via HTTP so they can be downloaded with wget.
	// Serve the systemd unit file for easy retrieval at /files/eventhub.service
	g.StaticFile("/files/eventhub.service", "scripts/eventhub.service")

	// Serve a static Swagger UI at /docs that points to /docs/doc.json.
	// We copy the generated JSON into web/swagger/doc.json and serve the directory.
	g.Static("/docs", "web/swagger")

	return g
}
