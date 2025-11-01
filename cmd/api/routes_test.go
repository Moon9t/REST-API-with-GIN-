package main

import (
	"database/sql"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"rest-api-in-gin/internal/database"

	"bytes"
	"encoding/json"
	"fmt"

	"github.com/golang-jwt/jwt/v4"
)

// helper to create an application with a temp sqlite DB and run migrations
func setupAppWithTempDB(t *testing.T) (*application, func()) {
	t.Helper()

	tmp, err := ioutil.TempFile("", "test-db-*.db")
	if err != nil {
		t.Fatalf("create temp db file: %v", err)
	}
	dbPath := tmp.Name()
	tmp.Close()

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		os.Remove(dbPath)
		t.Fatalf("open sqlite db: %v", err)
	}

	// create minimal schema required for tests (avoid running full migrations)
	createUsers := `CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL UNIQUE,
		name TEXT,
		password TEXT,
		role TEXT DEFAULT 'user',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	createEvents := `CREATE TABLE IF NOT EXISTS events (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		title TEXT NOT NULL,
		description TEXT,
		start_time DATETIME NOT NULL,
		end_time DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);`

	if _, err := db.Exec(createUsers); err != nil {
		db.Close()
		os.Remove(dbPath)
		t.Fatalf("create users table: %v", err)
	}
	if _, err := db.Exec(createEvents); err != nil {
		db.Close()
		os.Remove(dbPath)
		t.Fatalf("create events table: %v", err)
	}
	createAttendees := `CREATE TABLE IF NOT EXISTS attendees (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		event_id INTEGER NOT NULL,
		user_id INTEGER NOT NULL,
		status TEXT NOT NULL DEFAULT 'pending',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);`
	if _, err := db.Exec(createAttendees); err != nil {
		db.Close()
		os.Remove(dbPath)
		t.Fatalf("create attendees table: %v", err)
	}

	models := database.NewModels(db)
	app := &application{
		db:        db,
		port:      0,
		jwtSecret: "test-secret",
		models:    models,
	}

	cleanup := func() {
		db.Close()
		os.Remove(dbPath)
	}

	return app, cleanup
}

func TestPublicRoutes(t *testing.T) {
	app, cleanup := setupAppWithTempDB(t)
	defer cleanup()

	ts := httptest.NewServer(app.routes())
	defer ts.Close()

	// Test canonical endpoint
	resp, err := http.Get(ts.URL + "/api/v1/events")
	if err != nil {
		t.Fatalf("GET /api/v1/events failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 OK for /api/v1/events, got %d", resp.StatusCode)
	}

	// Test redirect from root /events -> /api/v1/events
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error { return http.ErrUseLastResponse },
	}
	resp2, err := client.Get(ts.URL + "/events")
	if err != nil {
		t.Fatalf("GET /events failed: %v", err)
	}
	defer resp2.Body.Close()

	// Expect permanent redirect (308)
	if resp2.StatusCode != http.StatusPermanentRedirect {
		t.Fatalf("expected 308 redirect for /events, got %d", resp2.StatusCode)
	}

	loc := resp2.Header.Get("Location")
	if loc != "/api/v1/events" {
		t.Fatalf("expected Location '/api/v1/events', got '%s'", loc)
	}
}

// helper to create a signed JWT for a user id
func jwtForUser(app *application, userID int) (string, error) {
	claims := jwt.MapClaims{"user_id": userID}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(app.jwtSecret))
}

func TestProtectedRoutes(t *testing.T) {
	app, cleanup := setupAppWithTempDB(t)
	defer cleanup()

	// create two users
	u1 := &database.User{Email: "owner@example.com", Name: "Owner", Password: "x"}
	if err := app.models.Users.Insert(u1); err != nil {
		t.Fatalf("insert user1: %v", err)
	}
	u2 := &database.User{Email: "att@example.com", Name: "Attendee", Password: "x"}
	if err := app.models.Users.Insert(u2); err != nil {
		t.Fatalf("insert user2: %v", err)
	}

	ts := httptest.NewServer(app.routes())
	defer ts.Close()

	ownerToken, err := jwtForUser(app, u1.ID)
	if err != nil {
		t.Fatalf("make jwt: %v", err)
	}

	// create event as owner
	evBody := map[string]interface{}{
		"title":       "Test Event",
		"description": "This is a test event for protected routes",
		"start_time":  "2025-12-01T12:00:00Z",
		"end_time":    "2025-12-01T14:00:00Z",
	}
	b, _ := json.Marshal(evBody)
	req, _ := http.NewRequest("POST", ts.URL+"/api/v1/events", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ownerToken)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("create event request failed: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		body, _ := ioutil.ReadAll(resp.Body)
		t.Fatalf("expected 201 created, got %d: %s", resp.StatusCode, string(body))
	}
	var created database.Event
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatalf("decode created event: %v", err)
	}

	// update event (owner)
	updated := map[string]interface{}{"title": "Updated Test Event", "description": created.Description, "start_time": created.StartTime, "end_time": created.EndTime}
	ub, _ := json.Marshal(updated)
	putReq, _ := http.NewRequest("PUT", fmt.Sprintf("%s/api/v1/events/%d", ts.URL, created.ID), bytes.NewReader(ub))
	putReq.Header.Set("Content-Type", "application/json")
	putReq.Header.Set("Authorization", "Bearer "+ownerToken)
	putResp, err := http.DefaultClient.Do(putReq)
	if err != nil {
		t.Fatalf("update event request failed: %v", err)
	}
	defer putResp.Body.Close()
	if putResp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(putResp.Body)
		t.Fatalf("expected 200 OK on update, got %d: %s", putResp.StatusCode, string(body))
	}

	// add attendee: have user2 add themself (self-add allowed)
	attToken, err := jwtForUser(app, u2.ID)
	if err != nil {
		t.Fatalf("make jwt for u2: %v", err)
	}
	addReq, _ := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/events/%d/attendees?user_id=%d", ts.URL, created.ID, u2.ID), nil)
	addReq.Header.Set("Authorization", "Bearer "+attToken)
	addResp, err := http.DefaultClient.Do(addReq)
	if err != nil {
		t.Fatalf("add attendee request failed: %v", err)
	}
	defer addResp.Body.Close()
	if addResp.StatusCode != http.StatusCreated {
		body, _ := ioutil.ReadAll(addResp.Body)
		t.Fatalf("expected 201 created for add attendee, got %d: %s", addResp.StatusCode, string(body))
	}

	// get attendees
	getAttReq, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/events/%d/attendees", ts.URL, created.ID), nil)
	getAttReq.Header.Set("Authorization", "Bearer "+ownerToken)
	getAttResp, err := http.DefaultClient.Do(getAttReq)
	if err != nil {
		t.Fatalf("get attendees request failed: %v", err)
	}
	defer getAttResp.Body.Close()
	if getAttResp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(getAttResp.Body)
		t.Fatalf("expected 200 OK for get attendees, got %d: %s", getAttResp.StatusCode, string(body))
	}
	var attendees []database.User
	if err := json.NewDecoder(getAttResp.Body).Decode(&attendees); err != nil {
		t.Fatalf("decode attendees: %v", err)
	}
	if len(attendees) != 1 || attendees[0].ID != u2.ID {
		t.Fatalf("expected attendee list to include user2 (id=%d), got %+v", u2.ID, attendees)
	}

	// delete attendee (self-removal by attendee)
	delReq, _ := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/events/%d/attendees/%d", ts.URL, created.ID, u2.ID), nil)
	delReq.Header.Set("Authorization", "Bearer "+attToken)
	delResp, err := http.DefaultClient.Do(delReq)
	if err != nil {
		t.Fatalf("delete attendee request failed: %v", err)
	}
	defer delResp.Body.Close()
	if delResp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(delResp.Body)
		t.Fatalf("expected 200 OK for delete attendee, got %d: %s", delResp.StatusCode, string(body))
	}

	// recreate attendee to test deletion of event
	addReq2, _ := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/events/%d/attendees?user_id=%d", ts.URL, created.ID, u2.ID), nil)
	addReq2.Header.Set("Authorization", "Bearer "+ownerToken)
	addResp2, err := http.DefaultClient.Do(addReq2)
	if err != nil {
		t.Fatalf("add attendee 2 request failed: %v", err)
	}
	addResp2.Body.Close()

	// delete event
	delEvReq, _ := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/events/%d", ts.URL, created.ID), nil)
	delEvReq.Header.Set("Authorization", "Bearer "+ownerToken)
	delEvResp, err := http.DefaultClient.Do(delEvReq)
	if err != nil {
		t.Fatalf("delete event request failed: %v", err)
	}
	defer delEvResp.Body.Close()
	if delEvResp.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(delEvResp.Body)
		t.Fatalf("expected 200 OK for delete event, got %d: %s", delEvResp.StatusCode, string(body))
	}

	// ensure event gone
	getEvResp, _ := http.Get(fmt.Sprintf("%s/api/v1/events/%d", ts.URL, created.ID))
	if getEvResp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 after deleting event, got %d", getEvResp.StatusCode)
	}
}

func TestProtectedErrorCases(t *testing.T) {
	app, cleanup := setupAppWithTempDB(t)
	defer cleanup()

	// create two users
	u1 := &database.User{Email: "owner2@example.com", Name: "Owner2", Password: "x"}
	if err := app.models.Users.Insert(u1); err != nil {
		t.Fatalf("insert user1: %v", err)
	}
	u2 := &database.User{Email: "other@example.com", Name: "Other", Password: "x"}
	if err := app.models.Users.Insert(u2); err != nil {
		t.Fatalf("insert user2: %v", err)
	}

	ts := httptest.NewServer(app.routes())
	defer ts.Close()

	// 1) Invalid token -> expect 401 on protected POST
	evBody := map[string]interface{}{"title": "Event for Errors", "description": "A sufficiently long description.", "start_time": "2025-12-01T12:00:00Z", "end_time": "2025-12-01T14:00:00Z"}
	b, _ := json.Marshal(evBody)
	req, _ := http.NewRequest("POST", ts.URL+"/api/v1/events", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	// no Authorization header
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing token, got %d", resp.StatusCode)
	}

	// malformed token
	req2, _ := http.NewRequest("POST", ts.URL+"/api/v1/events", bytes.NewReader(b))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", "Bearer invalid.token.here")
	resp2, err := http.DefaultClient.Do(req2)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	resp2.Body.Close()
	if resp2.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401 for invalid token, got %d", resp2.StatusCode)
	}

	// create event as owner
	ownerToken, _ := jwtForUser(app, u1.ID)
	creq, _ := http.NewRequest("POST", ts.URL+"/api/v1/events", bytes.NewReader(b))
	creq.Header.Set("Content-Type", "application/json")
	creq.Header.Set("Authorization", "Bearer "+ownerToken)
	cresp, err := http.DefaultClient.Do(creq)
	if err != nil {
		t.Fatalf("create event failed: %v", err)
	}
	defer cresp.Body.Close()
	if cresp.StatusCode != http.StatusCreated {
		body, _ := ioutil.ReadAll(cresp.Body)
		t.Fatalf("expected 201 created, got %d: %s", cresp.StatusCode, string(body))
	}
	var created database.Event
	if err := json.NewDecoder(cresp.Body).Decode(&created); err != nil {
		t.Fatalf("decode created event: %v", err)
	}

	// 2) Forbidden update by non-owner -> expect 403
	otherToken, _ := jwtForUser(app, u2.ID)
	updated := map[string]interface{}{"title": "Malicious Update", "description": created.Description, "start_time": created.StartTime, "end_time": created.EndTime}
	ub, _ := json.Marshal(updated)
	ureq, _ := http.NewRequest("PUT", fmt.Sprintf("%s/api/v1/events/%d", ts.URL, created.ID), bytes.NewReader(ub))
	ureq.Header.Set("Content-Type", "application/json")
	ureq.Header.Set("Authorization", "Bearer "+otherToken)
	uresp, err := http.DefaultClient.Do(ureq)
	if err != nil {
		t.Fatalf("update by non-owner failed: %v", err)
	}
	uresp.Body.Close()
	if uresp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403 forbidden for non-owner update, got %d", uresp.StatusCode)
	}

	// 3) Duplicate attendee conflict: add same attendee twice -> second should be 409
	// attendee self-add
	attToken, _ := jwtForUser(app, u2.ID)
	addReq, _ := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/events/%d/attendees?user_id=%d", ts.URL, created.ID, u2.ID), nil)
	addReq.Header.Set("Authorization", "Bearer "+attToken)
	addResp, err := http.DefaultClient.Do(addReq)
	if err != nil {
		t.Fatalf("first add attendee failed: %v", err)
	}
	addResp.Body.Close()
	if addResp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201 for first add attendee, got %d", addResp.StatusCode)
	}

	// second add (duplicate)
	addReq2, _ := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/events/%d/attendees?user_id=%d", ts.URL, created.ID, u2.ID), nil)
	addReq2.Header.Set("Authorization", "Bearer "+attToken)
	addResp2, err := http.DefaultClient.Do(addReq2)
	if err != nil {
		t.Fatalf("second add attendee failed: %v", err)
	}
	defer addResp2.Body.Close()
	if addResp2.StatusCode != http.StatusConflict {
		body, _ := ioutil.ReadAll(addResp2.Body)
		t.Fatalf("expected 409 conflict for duplicate attendee, got %d: %s", addResp2.StatusCode, string(body))
	}
}
