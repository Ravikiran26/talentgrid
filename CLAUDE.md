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

**Routing** — Next.js App Router. Pages live in `app/`:
- `/` → `app/page.tsx` (home — hero, search strip, job cards, categories)
- `/jobs` → `app/jobs/page.tsx` (listing — accepts `?q=`, `?category=`, `?location=` search params)
- `/jobs/[id]` → `app/jobs/[id]/page.tsx` (job detail)
- `/login`, `/register` → auth pages (not yet wired to backend)

**Data flow (Phase 1 — static)** — All job, category, and company data is imported from `data/jobs.ts`, `data/categories.ts`, `data/companies.ts` as static TypeScript arrays. The backend API is not yet called from the frontend. The comment `// wire to backend API in Phase 2` marks every placeholder.

**API client** — `lib/api.ts` exports a typed `api.get / api.post` wrapper that reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`). Use this for all future backend calls.

**Components** — organised into two groups:
- `components/jobs/` — `JobCard`, `JobCategoryCard`, `JobSearch`, `JobFilters`, `JobsList`
- `components/layout/` — `Header`, `Footer`
- `components/ui/` — `Badge`, `Button` (primitive reusable components)

`JobsList` is a client component that owns filter + keyword state and applies them via `useMemo` over the static `jobs` array. `JobSearch` pushes query params to `/jobs` via `router.push`; it has a `compact` prop for the in-page bar vs. the full hero bar.

**Types** — all shared types live in `types/index.ts` (`Job`, `JobCategory`, `Company`, `FilterState`).

**Utilities** — `lib/utils.ts` has `formatSalary` and `formatExperience` display helpers (salaries in LPA, experience in years).

**Design system** — Tailwind v4 with a custom brand palette defined in `app/globals.css` via `@theme inline`. Key tokens: `navy`, `navy-mid`, `ivory`, `surface`, `brass`, `charcoal`, `muted`, `border`, `navy-border`. Two fonts loaded via `next/font/google`: `Cormorant Garamond` (`--font-serif`) for headings and `DM Sans` (`--font-sans`) for body text.

### Backend

The backend is a fresh Spring Boot scaffold. The main application class is at `src/main/java/com/talentgrid/backend/BackendApplication.java`. No domain classes, controllers, or repositories have been created yet.

**Database** — PostgreSQL on `localhost:5432`, database `talentgrid_db`. Set the password in `application.properties` (`spring.datasource.password`). JPA is configured with `ddl-auto=update` so Hibernate manages the schema.

**Security** — Spring Security is on the classpath but not yet configured.

## Environment setup

Frontend requires `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Backend requires a local PostgreSQL instance with a database named `talentgrid_db` and the password set in `backend/src/main/resources/application.properties`.
