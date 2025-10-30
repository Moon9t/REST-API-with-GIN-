package main

import (
	"database/sql"
	"log"
	"os"
	"rest-api-in-gin/internal/database"
	"rest-api-in-gin/internal/env"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"

	"github.com/golang-migrate/migrate"
	"github.com/golang-migrate/migrate/database/sqlite3"
	"github.com/golang-migrate/migrate/source/file"
)

// swagger
// @title REST API in Gin
// @version 1.0
// @description This is a REST API server implemented in Go using the Gin framework.
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
// @tag.name Events
// @tag.description Operations to manage events (create, list, update, delete)
// @tag.name Auth
// @tag.description Authentication endpoints (login, register)
// @tag.name Attendees
// @tag.description Manage attendees for events

type application struct {
	db        *sql.DB
	port      int
	jwtSecret string
	models    database.Models
}

func main() {
	db, err := sql.Open("sqlite3", "./data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := runMigrationsIfNeeded(db); err != nil {
		log.Fatalf("migrations failed: %v", err)
	}

	models := database.NewModels(db)

	app := &application{
		port:      env.GetEnvInt("PORT", 8080),
		jwtSecret: env.GetEnvString("JWT_Secret", "some-very-secret-secret"),
		models:    models,
	}

	err = app.server()
	if err != nil {
		log.Fatal(err)
	}
}

func runMigrationsIfNeeded(db *sql.DB) error {
	force := os.Getenv("FORCE_MIGRATE") == "1"

	if !force {
		var count int
		row := db.QueryRow("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='schema_migrations';")
		if err := row.Scan(&count); err != nil {
			return err
		}
		if count > 0 {
			log.Println("migrations already applied (schema_migrations exists); skipping migration step")
			return nil
		}
	} else {
		log.Println("FORCE_MIGRATE is set; running migrations")
	}

	instance, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return err
	}

	fSrc, err := (&file.File{}).Open("cmd/migrate/migrations")
	if err != nil {
		return err
	}

	m, err := migrate.NewWithInstance(
		"file",
		fSrc,
		"sqlite3",
		instance,
	)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	log.Println("migration up completed successfully (or no change)")
	return nil
}
