package main

import (
	"fmt"
	"rest-api-in-gin/internal/database"

	"github.com/gin-gonic/gin"
)

func (app *application) getUserFromContext(c *gin.Context) (*database.User, error) {
	userInterface, exists := c.Get("user")
	if !exists {
		return nil, fmt.Errorf("user not found in context")
	}

	user, ok := userInterface.(*database.User)
	if !ok {
		return nil, fmt.Errorf("invalid user type in context")
	}

	return user, nil
}
