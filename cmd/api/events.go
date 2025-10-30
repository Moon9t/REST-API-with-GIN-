package main

import (
	"errors"
	"log"
	"net/http"
	"rest-api-in-gin/internal/database"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	sqlite3 "github.com/mattn/go-sqlite3"
)

// @Summary Create an event
// @Description Create a new event for the authenticated user
// @Tags Events
// @Accept json
// @Produce json
// @Param event body main.EventDoc true "Event payload"
// @Success 201 {object} main.EventDoc
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Security BearerAuth
// @Router /api/v1/events [post]

func (app *application) createEvent(c *gin.Context) {
	var event database.Event
	if err := c.ShouldBindJSON(&event); err != nil {
		// Log detailed validation/binding error for server-side debugging
		log.Printf("createEvent: bind error: %v", err)
		// Return a generic message to the client (avoid leaking internal details)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Require authentication and set owner from token rather than trusting client-supplied user_id
	user, err := app.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	event.User_id = user.ID

	err = app.models.Events.Insert(&event)
	if err != nil {
		// Log the error server-side for debugging
		log.Printf("createEvent: db insert error: %v", err)

		var sqlErr sqlite3.Error
		if errors.As(err, &sqlErr) {
			if sqlErr.Code == sqlite3.ErrConstraint || sqlErr.ExtendedCode == sqlite3.ErrConstraintUnique {
				c.JSON(http.StatusConflict, gin.H{"error": "Conflict: constraint violation"})
				return
			}
		}

		if strings.Contains(strings.ToLower(err.Error()), "foreign key") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Foreign key constraint failed"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	c.JSON(http.StatusCreated, event)
}

// @Summary Get all events
// @Description Retrieve a list of all events
// @Tags Events
// @Accept json
// @Produce json
// @Success 200 {array} main.EventDoc
// @Router /api/v1/events [get]
func (app *application) getAllEvets(c *gin.Context) {
	events, err := app.models.Events.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	if events == nil {
		events = []*database.Event{}
	}

	c.JSON(http.StatusOK, events)
}

// @Summary Get a single event
// @Description Retrieve details for a single event by ID
// @Tags Events
// @Accept json
// @Produce json
// @Param id path int true "Event ID"
// @Success 200 {object} main.EventDoc
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/events/{id} [get]
func (app *application) getEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
	}

	event, err := app.models.Events.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}
	if event == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	c.JSON(http.StatusOK, event)
}

// @Summary Update an event
// @Description Update an existing event (owner only)
// @Tags Events
// @Accept json
// @Produce json
// @Param id path int true "Event ID"
// @Param event body main.EventDoc true "Updated event payload"
// @Success 200 {object} main.EventDoc
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /api/v1/events/{id} [put]
func (app *application) updateEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
	}

	// Fetch existing
	existing, err := app.models.Events.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}
	if existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}
	// Ensure the requesting user is the owner
	user, err := app.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if existing.User_id != user.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to update this event"})
		return
	}

	var updated database.Event
	if err := c.ShouldBindJSON(&updated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	updated.ID = id
	if err := app.models.Events.Update(&updated); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	c.JSON(http.StatusOK, updated)
}

// @Summary Delete an event
// @Description Delete an event by ID (owner only)
// @Tags Events
// @Param id path int true "Event ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /api/v1/events/{id} [delete]
func (app *application) deleteEvent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
	}

	// Fetch existing
	existing, err := app.models.Events.Get(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}
	if existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Check if the user is the owner of the event

	err = app.models.Events.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

// @Summary Get attendees for an event
// @Description List users attending a specific event
// @Tags Attendees
// @Accept json
// @Produce json
// @Param id path int true "Event ID"
// @Success 200 {array} main.UserDoc
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/events/{id}/attendees [get]
func (app *application) getEventAttendees(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	users, err := app.models.Attendees.GetEventAttendees(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve attendees"})
		return
	}

	if users == nil {
		users = []*database.User{}
	}

	c.JSON(http.StatusOK, users)
}

// @Summary Remove an attendee from an event
// @Description Remove a user from an event's attendee list (self or owner/admin)
// @Tags Attendees
// @Param id path int true "Event ID"
// @Param userId path int true "User ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /api/v1/events/{id}/attendees/{userId} [delete]
func (app *application) deleteAttendeeFromEvent(c *gin.Context) {
	eventID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	userID, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Fetch event to determine owner
	ev, err := app.models.Events.Get(eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}
	if ev == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Allow self-removal or owner/admin
	tokenUser, err := app.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if tokenUser.ID != userID {
		if !requireOwnerOrAdmin(app, c, ev.User_id) {
			return
		}
	}

	deleted, err := app.models.Attendees.Delete(eventID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove attendee"})
		return
	}
	if !deleted {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attendee not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendee removed"})
}

// @Summary Get events for a user
// @Description Retrieve events a user is attending
// @Tags Attendees
// @Param id path int true "User ID"
// @Success 200 {array} main.EventDoc
// @Failure 400 {object} map[string]string
// @Router /api/v1/attendees/{id}/events [get]
func (app *application) getUserEvents(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	events, err := app.models.Attendees.GetEventsForUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events for user"})
		return
	}
	if events == nil {
		events = []*database.Event{}
	}
	c.JSON(http.StatusOK, events)
}

// @Summary Add attendee to event
// @Description Add a user as attendee to an event (self or owner/admin)
// @Tags Attendees
// @Param id path int true "Event ID"
// @Param user_id query int true "User ID"
// @Success 201 {object} main.AttendeeDoc
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Security BearerAuth
// @Router /api/v1/events/{id}/attendees [post]

func (app *application) addEventAttendee(c *gin.Context) {
	eventID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	userId, err := strconv.Atoi(c.Query("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	ev, err := app.models.Events.Get(eventID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve event"})
		return
	}
	if ev == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	tokenUser, err := app.getUserFromContext(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	if tokenUser.ID != userId {
		if !requireOwnerOrAdmin(app, c, ev.User_id) {
			return
		}
	}
	userToAdd, err := app.models.Users.Get(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	if userToAdd == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	existingAttendee, err := app.models.Attendees.Get(eventID, userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing attendee"})
		return
	}
	if existingAttendee != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already an attendee of this event"})
		return
	}
	attendee := &database.Attendee{
		EventID: eventID,
		UserID:  userId,
	}
	id, err := app.models.Attendees.Insert(attendee)
	if err != nil {
		log.Printf("addEventAttendee: db insert error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add attendee"})
		return
	}
	attendee.ID = id

	c.JSON(http.StatusCreated, gin.H{"message": "Attendee added successfully", "attendee": userToAdd})

}
