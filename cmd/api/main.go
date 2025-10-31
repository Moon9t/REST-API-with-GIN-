package main

import (
	"database/sql"
	"log"
	"os"
	"rest-api-in-gin/internal/database"
	"rest-api-in-gin/internal/env"
	"time"

	_ "github.com/joho/godotenv/autoload"
	_ "github.com/mattn/go-sqlite3"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	"github.com/golang-migrate/migrate/v4/source/file"
)

// @title EventHub API
// @version 1.0.0
// @description REST API for event management powered by Eclipse Softworks
// @termsOfService https://eclipse-softworks.com/terms

// @contact.name Eclipse Softworks API Support
// @contact.url https://eclipse-softworks.com/support
// @contact.email support@eclipse-softworks.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

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
// @tag.name Health
// @tag.description System health and monitoring endpoints

type application struct {
	db        *sql.DB
	port      int
	jwtSecret string
	models    database.Models
}

func main() {
	// Validate critical environment variables
	jwtSecret := env.GetEnvString("JWT_Secret", "")
	if jwtSecret == "" || jwtSecret == "some-very-secret-secret" {
		log.Println("WARNING: Using default JWT secret. Set JWT_Secret environment variable for production!")
		jwtSecret = "some-very-secret-secret"
	}

	db, err := sql.Open("sqlite3", "./data.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Verify database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	if err := runMigrationsIfNeeded(db); err != nil {
		log.Fatalf("migrations failed: %v", err)
	}

	models := database.NewModels(db)

	app := &application{
		db:        db,
		port:      env.GetEnvInt("PORT", 8080),
		jwtSecret: jwtSecret,
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
