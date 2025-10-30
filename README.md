
<img width="1024" height="1024" alt="evenhub_logo" src="https://github.com/user-attachments/assets/346562e8-d1ec-4c2f-aa0e-ac4961309c1f" />

EventHub — RESTful API
======================

Overview
--------

EventHub is a RESTful API server implemented in Go using the Gin framework. It provides endpoints to manage users, events and attendees, uses JWT for authentication, and stores data in SQLite. The repository also contains migration tooling and a small mobile app client.

Repository layout
-----------------

- cmd/
  - api/        - API server entry point and handlers
  - migrate/    - migration runner and SQL migrations

- internal/
  - database/   - models and DB access layer
  - env/        - environment helpers

- docs/         - misc docs and curl commands

- mobile-app/   - React Native (Expo) client

- .github/      - CI workflows

Requirements
------------

- Go 1.21
- sqlite3 development headers (for CGO: libsqlite3-dev on Debian/Ubuntu)
- A POSIX-compatible shell for local commands (zsh, bash)

Environment
-----------

The server reads configuration from environment variables. Important ones:

- PORT — HTTP port (default: 8080)
- JWT_Secret — secret used to sign JWT tokens (default in dev: some-very-secret-secret)
- FORCE_MIGRATE — when set to 1 the migration step will run even if schema_migrations exists

Local development
-----------------

1. Install system dependency (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install -y libsqlite3-dev
```

1. Run migrations (creates data.db):

```bash
cd cmd/migrate
go run .
```

1. Start the API server:

```bash
cd cmd/api
go run .
```

By default the server listens on :8080. The API root is mounted under `/api/v1`.

Testing
-------

Run the package tests (the `cmd/api` tests create temporary SQLite DBs):

```bash
go test ./... -v
```

Swagger / API docs
------------------

The project uses `swag` (swaggo) to generate OpenAPI docs. To generate docs locally:

```bash
go install github.com/swaggo/swag/cmd/swag@v1.8.12
$(go env GOPATH)/bin/swag init -g cmd/api/main.go -o cmd/api/docs --parseDependency --parseInternal
```

The server exposes a Swagger UI route at `/swagger/*any`. After generating docs, open:

- [Swagger UI](http://localhost:8080/swagger/index.html)
- [OpenAPI JSON](http://localhost:8080/swagger/doc.json)

Key routes
----------

All endpoints are prefixed with `/api/v1`. Major endpoints include:

- `POST /api/v1/auth/register` — register a new user
- `POST /api/v1/auth/login` — log in and receive a JWT token
- `GET /api/v1/events` — list events (public)
- `GET /api/v1/events/{id}` — get a single event (public)
- `POST /api/v1/events` — create event (authenticated)
- `PUT /api/v1/events/{id}` — update event (owner only)
- `DELETE /api/v1/events/{id}` — delete event (owner only)
- `POST /api/v1/events/{id}/attendees?user_id={id}` — add attendee (self or owner/admin)
- `GET /api/v1/events/{id}/attendees` — list attendees
- `DELETE /api/v1/events/{id}/attendees/{userId}` — remove attendee
- `GET /api/v1/attendees/{id}/events` — list events a user attends

Authentication
--------------

JWT bearer tokens are required for protected routes. Set the `Authorization` header to:

```text
Authorization: Bearer <token>
```

CI
--
The repository includes a GitHub Actions workflow in `.github/workflows/ci.yml` that:
- sets up Go
- runs tests
- builds the API
- generates Swagger docs (the docs job installs `swag` and uploads `cmd/api/docs` as an artifact)

Notes and maintainer tips
------------------------
- The project uses `internal/database` for models; when generating Swagger docs the generator may need types to be referenced from `main` or a fully-qualified module path to resolve models. A small alias file was used to help the generator during development.
- If you update `swag` or the gin-swagger runtime, re-run doc generation and check `cmd/api/docs/docs.go` for compatibility issues.
- Consider pinning the `swag` version in CI to avoid mismatches between local and CI-generated docs.

Contributing
------------
- Create a branch for your work.
- Add tests for new behavior and run `go test ./...`.
- Update or re-generate Swagger docs when you change handlers or models.

License
-------
This repository includes a LICENSE file (see project root).
