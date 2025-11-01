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
	Title       string `json:"title" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"required,min=10,max=500"`
	StartTime   string `json:"start_time" binding:"required" example:"2024-12-31T23:59:59Z"`
	EndTime     string `json:"end_time" binding:"required" example:"2024-12-31T23:59:59Z"`
	CreatedAt   string `json:"created_at,omitempty"`
	UpdatedAt   string `json:"updated_at,omitempty"`
}

func (m *EventModel) Insert(event *Event) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `INSERT INTO events (user_id, title, description, start_time, end_time, created_at, updated_at)
			  VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`

	res, err := m.DB.ExecContext(ctx, query,
		event.User_id,
		event.Title,
		event.Description,
		event.StartTime,
		event.EndTime,
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

	query := `SELECT id, user_id, title, description, start_time, end_time, created_at, updated_at FROM events ORDER BY start_time ASC`
	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*Event
	for rows.Next() {
		var event Event
		err := rows.Scan(&event.ID, &event.User_id, &event.Title, &event.Description, &event.StartTime, &event.EndTime, &event.CreatedAt, &event.UpdatedAt)
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

	query := `SELECT id, user_id, title, description, start_time, end_time, created_at, updated_at FROM events WHERE id = ?`
	var event Event
	err := m.DB.QueryRowContext(ctx, query, id).Scan(&event.ID, &event.User_id, &event.Title, &event.Description, &event.StartTime, &event.EndTime, &event.CreatedAt, &event.UpdatedAt)
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

	query := `UPDATE events SET user_id = ?, title = ?, description = ?, start_time = ?, end_time = ?, updated_at = datetime('now') WHERE id = ?`
	_, err := m.DB.ExecContext(ctx, query, event.User_id, event.Title, event.Description, event.StartTime, event.EndTime, event.ID)
	return err
}

func (m *EventModel) Delete(id int) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `DELETE FROM events WHERE id = ?`
	_, err := m.DB.ExecContext(ctx, query, id)
	return err
}
