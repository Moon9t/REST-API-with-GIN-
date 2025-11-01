//go:build ignore
// +build ignore

package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	email := flag.String("email", "admin@example.com", "admin email")
	password := flag.String("password", "adminpass123", "admin password")
	dbPath := flag.String("db", "./data.db", "path to sqlite db")
	flag.Parse()

	db, err := sql.Open("sqlite3", *dbPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	hash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("bcrypt: %v", err)
	}

	// Try to find existing user
	var id int
	err = db.QueryRow("SELECT id FROM users WHERE email = ?", *email).Scan(&id)
	if err == sql.ErrNoRows {
		res, err := db.Exec(`INSERT INTO users (email, name, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`, *email, "admin", string(hash), "admin", time.Now(), time.Now())
		if err != nil {
			log.Fatalf("insert admin: %v", err)
		}
		nid, _ := res.LastInsertId()
		fmt.Printf("Created admin user id=%d\n", nid)
		return
	} else if err != nil {
		log.Fatalf("query user: %v", err)
	}

	// Update existing user to admin
	_, err = db.Exec("UPDATE users SET role = 'admin', updated_at = ? WHERE id = ?", time.Now(), id)
	if err != nil {
		log.Fatalf("update user role: %v", err)
	}
	fmt.Printf("Promoted user id=%d to admin\n", id)
}
