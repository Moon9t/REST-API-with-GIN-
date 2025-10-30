package main

import (
	"database/sql"
	"log"
	"rest-api-in-gin/internal/database"
	"rest-api-in-gin/internal/env"

	_ "github.com/mattn/go-sqlite3"
)

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
