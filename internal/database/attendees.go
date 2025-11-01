package database

import (
	"context"
	"database/sql"
	"time"
)

type Attendee struct {
	ID        int    `json:"id"`
	EventID   int    `json:"event_id" binding:"required"`
	UserID    int    `json:"user_id" binding:"required"`
	Status    string `json:"status,omitempty"`
	CreatedAt string `json:"created_at,omitempty"`
	UpdatedAt string `json:"updated_at,omitempty"`
}

func (m *AttendeeModel) Insert(attendee *Attendee) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `INSERT INTO attendees (event_id, user_id, status) VALUES (?, ?, ?)`
	res, err := m.DB.ExecContext(ctx, query, attendee.EventID, attendee.UserID, "pending")
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(id), nil
}

func (m *AttendeeModel) Get(eventID, userID int) (*Attendee, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT id, event_id, user_id FROM attendees WHERE event_id = ? AND user_id = ?`
	var a Attendee
	err := m.DB.QueryRowContext(ctx, query, eventID, userID).Scan(&a.ID, &a.EventID, &a.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &a, nil
}

func (m *AttendeeModel) GetEventAttendees(eventID int) ([]*User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT u.id, u.email, u.name FROM users u JOIN attendees a ON u.id = a.user_id WHERE a.event_id = ?`
	rows, err := m.DB.QueryContext(ctx, query, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

func (m *AttendeeModel) Delete(eventID, userID int) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `DELETE FROM attendees WHERE event_id = ? AND user_id = ?`
	res, err := m.DB.ExecContext(ctx, query, eventID, userID)
	if err != nil {
		return false, err
	}
	ra, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return ra > 0, nil
}

func (m *AttendeeModel) GetEventsForUser(userID int) ([]*Event, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT e.id, e.user_id, e.title, e.description, e.start_time, e.end_time, e.created_at, e.updated_at FROM events e
			  JOIN attendees a ON e.id = a.event_id WHERE a.user_id = ?`
	rows, err := m.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*Event
	for rows.Next() {
		var ev Event
		if err := rows.Scan(&ev.ID, &ev.User_id, &ev.Title, &ev.Description, &ev.StartTime, &ev.EndTime, &ev.CreatedAt, &ev.UpdatedAt); err != nil {
			return nil, err
		}
		events = append(events, &ev)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return events, nil
}
