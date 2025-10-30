package main

import "rest-api-in-gin/internal/database"

// These type aliases are used for Swagger generation only. Swag has trouble
// resolving internal package types when the module path is not a fully
// qualified import path (e.g. github.com/...). Creating aliases in the main
// package lets us reference `main.EventDoc` etc. in annotations so swag can
// generate proper definitions.

type EventDoc = database.Event
type UserDoc = database.User
type AttendeeDoc = database.Attendee
