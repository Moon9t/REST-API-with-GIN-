// +build ignore

package main

import (
	"crypto/rand"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"math/big"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

const pwChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"

func randomString(n int) string {
	out := make([]byte, n)
	max := big.NewInt(int64(len(pwChars)))
	for i := 0; i < n; i++ {
		v, err := rand.Int(rand.Reader, max)
		if err != nil {
			log.Fatalf("rand: %v", err)
		}
		out[i] = pwChars[v.Int64()]
	}
	return string(out)
}

func columnExists(db *sql.DB, table, column string) (bool, error) {
	rows, err := db.Query("PRAGMA table_info('" + table + "')")
	if err != nil {
		return false, err
	}
	defer rows.Close()
	var cid int
	var name, ctype string
	var notnull, dflt_value, pk interface{}
	for rows.Next() {
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt_value, &pk); err != nil {
			return false, err
		}
		if name == column {
			return true, nil
		}
	}
	return false, nil
}

func main() {
	dbPath := flag.String("db", "./data.db", "path to sqlite db")
	usersCount := flag.Int("users", 6, "number of users to create")
	eventsPerUser := flag.Int("events", 2, "events to create per organizer")
	attendeesPerEvent := flag.Int("attendees", 4, "approx attendees per event (including organizer)")
	flag.Parse()

	db, err := sql.Open("sqlite3", *dbPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	hasRole, err := columnExists(db, "users", "role")
	if err != nil {
		log.Fatalf("checking users columns: %v", err)
	}

	first := []string{"Alice", "Bob", "Carlos", "Dana", "Eve", "Frank", "Grace", "Hana", "Ibrahim", "Jade"}
	last := []string{"Smith", "Johnson", "Martinez", "Nguyen", "Patel", "Brown", "Garcia", "Khan", "Lee", "Wilson"}

	type CreatedUser struct {
		ID       int64
		Email    string
		Name     string
		Password string
	}

	created := make([]CreatedUser, 0, *usersCount)

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("begin tx: %v", err)
	}

	insertUserSQL := "INSERT INTO users (email, name, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
	if hasRole {
		insertUserSQL = "INSERT INTO users (email, name, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
	}

	for i := 0; i < *usersCount; i++ {
		fname := first[i%len(first)]
		lname := last[(i/len(first)+i)%len(last)]
		name := fmt.Sprintf("%s %s", fname, lname)
		email := strings.ToLower(fmt.Sprintf("%s.%s+seed%d@example.com", fname, lname, time.Now().Unix()+int64(i)))
		pwd := randomString(12)
		hash, err := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
		if err != nil {
			tx.Rollback()
			log.Fatalf("bcrypt: %v", err)
		}

		now := time.Now()
		var res sql.Result
		if hasRole {
			res, err = tx.Exec(insertUserSQL, email, name, string(hash), "user", now, now)
		} else {
			res, err = tx.Exec(insertUserSQL, email, name, string(hash), now, now)
		}
		if err != nil {
			tx.Rollback()
			log.Fatalf("insert user: %v", err)
		}
		id, _ := res.LastInsertId()
		created = append(created, CreatedUser{ID: id, Email: email, Name: name, Password: pwd})
	}

	// Create events for each created user
	insertEventSQL := "INSERT INTO events (user_id, title, description, start_time, end_time, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
	for _, u := range created {
		for e := 0; e < *eventsPerUser; e++ {
			start := time.Now().Add(time.Duration(24*(3+e)) * time.Hour)
			end := start.Add(2 * time.Hour)
			title := fmt.Sprintf("%s's %s Workshop", strings.Split(u.Name, " ")[0], []string{"Go & Gin", "Docker Basics", "APIs 101", "Testing in Go"}[e%4])
			desc := fmt.Sprintf("Hands-on session: %s", title)
			_, err := tx.Exec(insertEventSQL, u.ID, title, desc, start, end, time.Now(), time.Now())
			if err != nil {
				tx.Rollback()
				log.Fatalf("insert event: %v", err)
			}
		}
	}

	// Collect event IDs to create attendees
	rows, err := tx.Query("SELECT id, user_id FROM events")
	if err != nil {
		tx.Rollback()
		log.Fatalf("query events: %v", err)
	}
	defer rows.Close()

	type Ev struct{ ID, UserID int64 }
	evs := []Ev{}
	for rows.Next() {
		var ev Ev
		if err := rows.Scan(&ev.ID, &ev.UserID); err != nil {
			tx.Rollback()
			log.Fatalf("scan event: %v", err)
		}
		evs = append(evs, ev)
	}

	insertAttSQL := "INSERT INTO attendees (event_id, user_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
	for _, ev := range evs {
		// organizer attends by default
		_, err := tx.Exec(insertAttSQL, ev.ID, ev.UserID, "confirmed", time.Now(), time.Now())
		if err != nil {
			tx.Rollback()
			log.Fatalf("insert attendee organizer: %v", err)
		}

		// add a few other attendees chosen from created users (wrap-around)
		for k := 0; k < *attendeesPerEvent-1; k++ {
			u := created[(int(ev.ID)+k)%len(created)]
			// skip if same as organizer
			if u.ID == ev.UserID {
				continue
			}
			_, err := tx.Exec(insertAttSQL, ev.ID, u.ID, "confirmed", time.Now(), time.Now())
			if err != nil {
				tx.Rollback()
				log.Fatalf("insert attendee: %v", err)
			}
		}
	}

	if err := tx.Commit(); err != nil {
		log.Fatalf("commit: %v", err)
	}

	fmt.Println("Seed complete — created users:")
	for _, u := range created {
		fmt.Printf("- id=%d name=%s email=%s password=%s\n", u.ID, u.Name, u.Email, u.Password)
	}
	fmt.Printf("Created %d users, %d events, and attendees seeded.\n", len(created), len(evs))
}
