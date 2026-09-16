# TalentGrid

Executive recruitment platform for Project Management professionals in India.

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- **Backend**: Spring Boot 4.1, Java 21, Spring Security, JPA, PostgreSQL, Flyway
- **Auth**: JWT (HS512) + BCrypt

## Prerequisites

- Java 21+
- Node 18+
- PostgreSQL 14+ running locally
- Maven wrapper is included (`./mvnw`)

## First-time setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE talentgrid_db;"

# Install frontend deps
cd frontend
npm install
```

## Environment variables

The backend reads these at boot. Local defaults exist for everything except the JWT secret.

| Variable                     | Purpose                            | Local default                          |
|------------------------------|------------------------------------|----------------------------------------|
| `SPRING_DATASOURCE_URL`      | Postgres URL                       | `jdbc:postgresql://localhost:5432/talentgrid_db` |
| `SPRING_DATASOURCE_USERNAME` | Postgres user                      | `postgres`                             |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password                  | *(empty)*                              |
| `APP_JWT_SECRET`             | HMAC secret (≥64 bytes base64)     | **must set** — the placeholder in `application.properties` is not a valid signing key |
| `APP_JWT_EXPIRATION_MS`      | Token lifetime                     | `86400000` (24h)                       |
| `APP_ADMIN_EMAIL`            | Seed admin email                   | `admin@talentgrid.com`                 |
| `APP_ADMIN_PASSWORD`         | Seed admin password (change!)      | `ChangeMe123!`                         |
| `APP_CORS_ALLOWED_ORIGINS`   | Comma-separated origins            | `http://localhost:3000`                |
| `APP_RESUME_STORAGE_DIR`     | Where uploaded resumes go          | `./data/resumes`                       |

Generate a JWT secret:

```bash
openssl rand -base64 64
```

## Run locally

Two terminals.

### Terminal 1 — backend

```bash
cd backend
export APP_JWT_SECRET="$(openssl rand -base64 64)"
export SPRING_DATASOURCE_PASSWORD="<your postgres password or empty>"
./mvnw spring-boot:run
```

On first boot, Flyway creates the schema, `JobSeeder` inserts 15 seed roles, `AdminSeeder` inserts the admin user.

### Terminal 2 — frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000**.

Default admin login: **`admin@talentgrid.com`** / **`ChangeMe123!`** (or whatever `APP_ADMIN_PASSWORD` you exported).

## Layout

```
backend/                Spring Boot service
  src/main/java/com/talentgrid/backend/
    admin/              Admin endpoints (candidates, applications, resume view)
    auth/               Register, login, password reset, JWT
    employer/           Employer endpoints (jobs, applicants, status)
    profile/            Candidate profile + resume upload
    job/                Public job listing/detail + admin CRUD
    application/        Candidate applications
    resume/             Local disk storage (swap for S3 in prod)
    security/           JWT filter, correlation IDs, rate limits
    config/             SecurityConfig, seeders, pagination helper
    exception/          Global exception handler
    user/               User entity + related
  src/main/resources/
    application.properties
    db/migration/       Flyway migrations (V1 baseline, V2 password-reset, V3 indexes)

frontend/               Next.js App Router
  app/                  Routes (home, jobs, profile, dashboard, admin, employer, auth)
  components/           UI + domain components
  lib/                  api client, auth helpers, formatters, job mapper
  data/                 static fallback content
  types/                shared types
```

## Key endpoints

**Public**
- `GET  /api/jobs?q=&category=&location=&page=&size=&sort=`
- `GET  /api/jobs/{id}`
- `POST /api/auth/register` — rate-limited, 5/hr per IP
- `POST /api/auth/login` — rate-limited, 10/min per IP
- `POST /api/auth/forgot-password` — rate-limited, 3/hr; token printed to stdout in dev
- `POST /api/auth/reset-password`

**Candidate**
- `GET  /api/profile/me`, `PUT /api/profile`
- `POST /api/profile/resume` (multipart), `GET /api/profile/resume`, `DELETE /api/profile/resume`
- `POST /api/applications` `{ jobId }`
- `GET  /api/applications/my`

**Admin**
- `GET  /api/admin/candidates` (paginated)
- `GET  /api/admin/candidates/{id}`, `PATCH /api/admin/candidates/{id}/status`
- `GET  /api/admin/candidates/{id}/resume`
- `GET  /api/admin/jobs/{id}/applications`
- `PATCH /api/admin/applications/{id}/status` (SHORTLISTED / REJECTED)
- `POST /api/jobs`, `PATCH /api/jobs/{id}`, `PATCH /api/jobs/{id}/deactivate`

**Employer**
- `GET  /api/employer/jobs`
- `POST /api/employer/jobs`, `PATCH /api/employer/jobs/{id}`, `PATCH /api/employer/jobs/{id}/deactivate`
- `GET  /api/employer/jobs/{id}/applications`
- `PATCH /api/employer/applications/{id}/status`

## Notes

- Every response carries `X-Request-Id` (matches the MDC `[requestId]` in server logs).
- List endpoints expose totals via `X-Total-Count` and `X-Total-Pages` headers.
- Rate-limited endpoints return `429` with `Retry-After` when exhausted.
- Password reset tokens are logged to stdout in dev; wire an email provider before prod.
- Resume files land on local disk under `APP_RESUME_STORAGE_DIR`. Swap `LocalResumeStorage` for an S3 impl before horizontal scale.
