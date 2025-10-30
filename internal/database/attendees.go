package database

import "database/sql"

type AttendeeModels struct {
	DB *sql.DB
}

type Attendee struct {
	ID      int `json:"id"`
	EventID int `json:"event_id" binding:"required"`
	UserID  int `json:"user_id" binding:"required"`
}
