package database

import "database/sql"

type EventModel struct {
	DB *sql.DB
}

type Event struct {
	ID          int    `json:"id"`
	User_id     int    `json:"user_id" binding:"required"`
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"required,min=10,max=500"`
	Date        string `json:"date" binding:"required" example:"2024-12-31T23:59:59Z"`
	Location    string `json:"location" binding:"required,min=5,max=200"`
}
