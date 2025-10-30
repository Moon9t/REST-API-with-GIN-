package database

import (
	"context"
	"database/sql"
	"time"
)

type EventModel struct {
	DB *sql.DB
}

type Event struct {
	ID          int    `json:"id"`
	User_id     int    `json:"user_id"`
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"required,min=10,max=500"`
	Date        string `json:"date" binding:"required" example:"2024-12-31T23:59:59Z"`
	Location    string `json:"location" binding:"required,min=5,max=200"`
}

func (m *EventModel) Insert(event *Event) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `INSERT INTO events (user_id, name, description, date, location)
			  VALUES (?, ?, ?, ?, ?)`

	res, err := m.DB.ExecContext(ctx, query,
		event.User_id,
		event.Name,
		event.Description,
		event.Date,
		event.Location,
	)
	if err != nil {
		return err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	event.ID = int(id)
	return nil
}

func (m *EventModel) GetAll() ([]*Event, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT id, user_id, name, description, date, location FROM events`
	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*Event
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.User_id, &event.Name, &event.Description, &event.Date, &event.Location)
		if err != nil {
			return nil, err
		}
		events = append(events, &event)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func (m *EventModel) Get(id int) (*Event, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT id, user_id, name, description, date, location FROM events WHERE id = ?`
	var event Event
	err := m.DB.QueryRowContext(ctx, query, id).Scan(&event.ID, &event.User_id, &event.Name, &event.Description, &event.Date, &event.Location)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &event, nil
}

func (m *EventModel) Update(event *Event) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `UPDATE events SET user_id = ?, name = ?, description = ?, date = ?, location = ? WHERE id = ?`
	_, err := m.DB.ExecContext(ctx, query, event.User_id, event.Name, event.Description, event.Date, event.Location, event.ID)
	return err
}

func (m *EventModel) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `DELETE FROM events WHERE id = ?`
	_, err := m.DB.ExecContext(ctx, query, id)
	return err
}
