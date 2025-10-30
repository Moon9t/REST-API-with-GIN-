package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func (app *application) routes() *gin.Engine {
	g := gin.Default()

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
	g.GET("/swagger/*any", func(ctx *gin.Context) {
		if ctx.Request.RequestURI == "/swagger/" {
			ctx.Request.RequestURI = "/swagger/index.html"
		}
		ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.URL("http://localhost:8080/swagger/doc.json"))(ctx)
	})

	return g
}
