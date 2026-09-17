# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

TalentGrid is an executive recruitment platform targeting experienced professionals in India (Technology, Management, Operations). It is a full-stack monorepo with two independent sub-projects:

| Directory | Stack |
|-----------|-------|
| `frontend/` | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| `backend/`  | Spring Boot 4.1.1, Java 21, Spring Data JPA, Spring Security, PostgreSQL |

## Commands

### Frontend (`cd frontend/`)

```bash
npm run dev      # start dev server on :3000 (Turbopack enabled by default in Next 16)
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint (config: eslint.config.mjs)
```

There is no test runner configured yet in the frontend.

### Backend (`cd backend/`)

```bash
./mvnw spring-boot:run          # start the API server on :8080 (requires PostgreSQL)
./mvnw test                     # run all tests
./mvnw test -Dtest=ClassName    # run a single test class
./mvnw package -DskipTests      # build the jar
```

## Architecture

### Frontend

**Public landing vs. signed-in app** — `/` serves two experiences. `components/home/HomeGate.tsx` renders the existing `CandidateDashboard` (with the shared `layout/Header` and `layout/Footer`) for a signed-in candidate, and the public landing for everyone else. `app/_components/AppShell.tsx` lists `/` under `SELF_CHROME_ROUTES` so the page supplies its own chrome. The public landing is composed in `app/page.tsx` from `components/public/`: `PublicHeader`, `HeroSection`, `JobSearchBar`, `PopularRoles`, `StatsStrip`, `EmployerTrust`, `WhyTalentGrid`, `FeaturedOpportunities`, `SpecialistDisciplines`, `EmployerCTA`, `CareerInsights`, `FinalCTA`, `PublicFooter`. Never mix dashboard components into that set. The hero's right-hand panel shows `public/hero.jpg` when present and falls back to a navy gradient panel.

**Routing** — Next.js App Router. Pages live in `app/`:
- `/` → `app/page.tsx` (home — hero, search strip, job cards, categories)
- `/jobs` → `app/jobs/page.tsx` (listing — accepts `?q=`, `?category=`, `?location=` search params)
- `/jobs/[id]` → `app/jobs/[id]/page.tsx` (job detail)
- `/login`, `/register` → auth pages (not yet wired to backend)

**Data flow** — Pages call the backend through `lib/api.ts`. Jobs, applications, profile, saved jobs (`lib/savedJobs.ts`), subscription, notifications and job stats (`lib/account.ts`) are all live. The static arrays in `data/` remain only as fallbacks when the API is unreachable, plus `data/insights.ts`, which is editorial content with no backend yet.

**API client** — `lib/api.ts` exports a typed `api.get / api.post` wrapper that reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`). Use this for all future backend calls.

**Components** — organised into two groups:
- `components/jobs/` — `JobCard`, `JobCategoryCard`, `JobSearch`, `JobFilters`, `JobsList`
- `components/layout/` — `Header`, `Footer`
- `components/ui/` — `Badge`, `Button` (primitive reusable components)

`JobsList` is a client component that owns filter + keyword state and applies them via `useMemo` over the static `jobs` array. `JobSearch` pushes query params to `/jobs` via `router.push`; it has a `compact` prop for the in-page bar vs. the full hero bar.

**Types** — all shared types live in `types/index.ts` (`Job`, `JobCategory`, `Company`, `FilterState`).

**Utilities** — `lib/utils.ts` has `formatSalary` and `formatExperience` display helpers (salaries in LPA, experience in years).

**Design system** — Tailwind v4 with a warm ivory / deep navy / muted gold palette in `app/globals.css` via `@theme inline`. Token names are historical: `navy` is the deep navy (#071827), `brass` is the muted gold (#B68A45) and is used sparingly, `ivory` is the warm page ground (#F7F3EB). `teal` (#0F8078) is an optional secondary accent. Other tokens: `navy-mid`, `navy-deep`, `surface`, `surface-alt`, `charcoal`, `muted`, `muted-light`, `border`, `input`, `navy-border`, `navy-text` / `navy-text-light` / `navy-text-dim` (all clear WCAG AA on navy), `brass-hover`, `highlight` / `highlight-strong` / `highlight-border`, `field`, `track`. Never add raw hex for brand colours; semantic status colours (green/amber/red/purple badges) stay literal on purpose. Fonts via `next/font/google`: `Libre Baskerville` (`--font-serif`, headings, with `font-size-adjust` so sizes tuned for the previous serif still fit) and `Work Sans` (`--font-sans`, body).

### Backend

The backend is a fresh Spring Boot scaffold. The main application class is at `src/main/java/com/talentgrid/backend/BackendApplication.java`. No domain classes, controllers, or repositories have been created yet.

**Database** — PostgreSQL on `localhost:5432`, database `talentgrid_db`. Set the password in `application.properties` (`spring.datasource.password`). JPA is configured with `ddl-auto=update` so Hibernate manages the schema.

**Security** — Stateless JWT auth (`security/JwtAuthFilter`) plus social sign-in via Spring OAuth2 client (`auth/oauth2/`). Google and LinkedIn are configured as OpenID Connect registrations in `application.properties`; the success handler finds-or-creates the user by verified e-mail, issues the normal JWT, and redirects to the frontend `/auth/callback` page with the token in the URL fragment. LinkedIn needs the `nonce` stripped from the authorization request (see `OAuth2ClientConfig`). Admin accounts cannot use social sign-in.

**Errors and logging** — `exception/GlobalExceptionHandler` maps every exception to one JSON shape (`timestamp`, `status`, `error`, `message`, `requestId`, plus `fields` on validation errors). Security rejections happen inside the filter chain before controller advice, so `exception/ApiErrorWriter` produces the same shape for 401 and 403. `security/CorrelationIdFilter` puts a request id in the MDC and the `X-Request-Id` header, honouring an inbound one; every log line and error body carries it. `security/RequestLoggingFilter` logs one line per request (method, path, status, duration), at WARN for 5xx or slow requests, INFO for 4xx, DEBUG for 2xx. Set `APP_LOG_FILE` to write a rotating log file alongside the console.

## Environment setup

Frontend requires `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Backend requires a local PostgreSQL instance with a database named `talentgrid_db` and the password set in `backend/src/main/resources/application.properties`.

On first boot the backend also seeds demo accounts (disable with `APP_SEED_DEMO=false`):
```
candidate  priya.demo@talentgrid.com / Demo1234!   (full profile, resume, photo, 4 applications, saved jobs, PRO)
employer   rahul.demo@talentgrid.com / Demo1234!   (verified, company "Nimbus Technologies", 1 job with an applicant)
```

Logging is console-only by default. To also write a rotating file (10 MB per file, 14 days, 500 MB cap):
```
APP_LOG_FILE=./data/logs/talentgrid.log
APP_LOGGING_SLOW_REQUEST_MS=1000   # requests slower than this log at WARN
```

Social sign-in needs provider credentials exported before starting the backend (the app boots with placeholders, but the buttons fail at the provider until these are set):
```
GOOGLE_CLIENT_ID=...     GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...   LINKEDIN_CLIENT_SECRET=...
```
E-mail (password reset, application and profile updates) is logged to the backend console unless SMTP is configured. For real delivery export, for example with a Gmail app password:
```
SPRING_MAIL_HOST=smtp.gmail.com SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=you@gmail.com SPRING_MAIL_PASSWORD=<app password>
APP_MAIL_FROM="TalentGrid <you@gmail.com>"
```

Register the redirect URIs `http://localhost:8080/login/oauth2/code/google` and `http://localhost:8080/login/oauth2/code/linkedin` with the respective provider. LinkedIn requires the "Sign In with LinkedIn using OpenID Connect" product enabled on the app.
