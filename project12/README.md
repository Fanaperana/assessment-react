# Project 12 — PulseChat

Go 1.25 (server) + PostgreSQL + React 19 / Vite (web).

👉 **Read [ASSIGNMENT.md](ASSIGNMENT.md) first.** It has the requirements and the grading.

## Get started

```bash
docker compose up -d                  # PostgreSQL
cp .env.example .env
cd server && go run ./cmd/api         # http://localhost:8080/healthz
cd web && npm install && npm run dev  # http://localhost:5173
```

## Checks (CI runs these on every pull request)

```bash
cd server && gofmt -l . && go vet ./... && go test -race ./...
cd web && npm run lint && npm run build
```

## Notes

- Needs Go 1.25+, Docker and Node.js.
- `go test -race` needs a C compiler (CGO). On Windows without one, run `go test ./...` locally; CI runs `-race` on Linux.
- Recommended Node.js version for all projects: **24 LTS**.

The starter was created with the official CLI. Everything else is your job. 💪
