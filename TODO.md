# TalentGrid — Pending TODO

## 1. Application Flow (Priority: HIGH)
- [x] Backend: Create Application entity (candidate, job, status, appliedAt)
- [x] Backend: POST /api/applications — candidate submits application
- [x] Backend: GET /api/applications/my — candidate sees their own applications
- [x] Backend: GET /api/admin/jobs/{id}/applications — admin sees applicants per job
- [x] Backend: PATCH /api/admin/applications/{id}/status — shortlist / reject applicant
- [x] Frontend: Wire "Apply Now" button on job detail page to POST /api/applications
- [x] Frontend: Candidate dashboard — list of applied jobs with status badges
- [x] Frontend: Admin jobs page — "View Applicants" per job listing

## 2. Profile Completion Gate (Priority: HIGH)
- [x] Backend: Profile completeness check before allowing apply (headline + skills + resume required)
- [x] Frontend: Block "Apply Now" if profile is incomplete — show prompt to complete profile
- [x] Frontend: Profile strength bar should update dynamically as fields are filled
- [x] Frontend: Wire profile save form to backend (PUT /api/profile)
- [x] Backend: PUT /api/profile — update candidate profile fields

## 3. Recruiter / Employer Flow (Priority: MEDIUM)
- [x] Backend: Add EMPLOYER role to Role enum
- [x] Backend: Employer registration — POST /api/auth/register with role=EMPLOYER
- [x] Backend: GET /api/employer/jobs — employer sees only their own job listings
- [x] Backend: Employer can only edit/delete their own jobs (not others)
- [x] Backend: GET /api/employer/jobs/{id}/applications — see applicants for their job
- [x] Frontend: Employer registration page — role toggle on /register
- [x] Frontend: Employer dashboard (/employer/dashboard) — post jobs, view applicants
- [x] Frontend: Update For Employers page (/for-employers) with working Register CTA

## 4. Forgot Password (Priority: MEDIUM)
- [x] Backend: POST /api/auth/forgot-password — send OTP/reset link to email
- [x] Backend: POST /api/auth/reset-password — validate token and update password
- [x] Frontend: Wire /forgot-password page form to backend
- [x] Frontend: Add reset password confirmation page (/reset-password?token=)

## 5. Real Jobs on Public Page (Priority: MEDIUM)
- [x] Backend: Seed 15 jobs into DB on startup (CommandLineRunner) — idempotent, runs if table is empty
- [x] Frontend: Jobs page auto-uses real API data when DB has jobs — no change needed

## 6. Notifications (Priority: LOW)
- [x] Backend: Email to candidate when status changes (Active / Rejected)
- [x] Backend: Email to candidate when application is shortlisted
- [x] Backend: Email to employer when a candidate applies to their job
- [x] Frontend: In-app notification bell in header
- [ ] Ops: set SPRING_MAIL_* env vars for real delivery (messages are logged until then)

## 7. Search & Filters (Priority: LOW)
- [x] Backend: GET /api/jobs with query params (?q=&category=&location=) for server-side filtering
- [x] Frontend: JobSearch pushes query params; filter dropdowns read live facets from /api/jobs/facets
- [x] Employment type, experience and salary filters run server-side

## 8. Misc / Polish
- [x] Normalise fullName on register / social sign-in (V6 also fixed existing rows)
- [x] Add resume upload endpoint (POST /api/profile/resume)
- [x] Frontend: Resume download in admin panel hits the real file endpoint
- [x] Admin candidates: server-side pagination, search and status filter with live counts
- [x] Admin jobs: server-side pagination and search
- [x] Employer: view applicant resume (/api/employer/applications/{id}/resume)
- [x] Fix: admin and employer applicant panels read the wrong response shape (nested `candidate`)
- [x] Settings page: change password, change e-mail, delete account (/api/account)

## 9. Auth (DONE)
- [x] Google and LinkedIn sign-in (OpenID Connect) — needs GOOGLE_*/LINKEDIN_* env vars
- [x] /api/auth/me + /auth/callback page

## 10. Account data (DONE — was mock)
- [x] Saved jobs on backend (/api/saved-jobs)
- [x] Subscription on backend with free-plan quota (3 applications/month); upgrade is simulated
- [x] Profile photo upload
- [x] Dashboard weekly counts, home stats and filter facets from DB

## 10b. Employer side (DONE)
- [x] Employer notifications bell and Settings link in header
- [x] Reopen closed jobs (employer + admin); Open/Closed tabs and badges; applicant count per job
- [x] Company profile (/employer/company) with public page (/companies/[id]); jobs take name/initials/about from it
- [x] Employer verification: new employers start UNDER_REVIEW, cannot post until approved; admin page at /admin/employers with approve/reject (reject closes their jobs); admins notified on new employer registration
- [x] Admin jobs page lists closed jobs (/api/admin/jobs?active=)
- [ ] Job closing date / auto-expiry
- [ ] Employer billing / job-posting plans
- [ ] Applicant panel: filter by status, notes, bulk actions

## 11. Payments (Priority: MEDIUM)
- [ ] Razorpay (or Stripe) checkout for PRO; replace SubscriptionService.upgrade with order + webhook
- [ ] Renewal / expiry handling and invoices

## 11a. Public landing page (DONE)
- [x] Rebuilt `/` as a dedicated public landing in `components/public/` (13 components, no dashboard code)
- [x] Own `PublicHeader` / `PublicFooter`; signed-in candidate keeps the shared chrome via HomeGate
- [x] Warm ivory / deep navy / muted gold palette; gold used sparingly
- [x] Stats, featured roles, employer strip and insights all read live APIs; dashes instead of invented numbers when the API is down
- [x] Employer fallback names are fictional and labelled, never a false partnership claim
- [ ] Add an executive-office photograph at `frontend/public/hero.jpg` (panel falls back to a gradient today)
- [ ] Real `/privacy` and `/terms` pages (footer links point at them)

## 11b. Observability (DONE)
- [x] Consistent JSON error shape everywhere, including 401/403 from the security filter chain
- [x] Request id in every log line, error body and the X-Request-Id response header
- [x] Per-request access log with duration; WARN on 5xx and slow requests
- [x] Handlers for optimistic locking (409), 405, 415, missing file part, IOException, param validation
- [x] Optional rotating log file via APP_LOG_FILE
- [ ] Spring Boot Actuator health/metrics endpoint for deploy probes
- [ ] Ship logs somewhere (CloudWatch / Loki) and alert on 5xx rate

## 12. Infrastructure (Priority: HIGH before deploy)
- [ ] S3-backed ResumeStorage implementation (resumes + photos); keep LocalResumeStorage for dev
- [ ] Backend tests (auth, applications quota, notifications) — only the context-load test exists
- [ ] Frontend test runner (Vitest + Testing Library)
- [ ] Dockerfiles + docker-compose (postgres, backend, frontend)
- [ ] CI (GitHub Actions: build, lint, test)
- [ ] Remove committed defaults for JWT secret / admin password / OAuth placeholders; env-only in prod
- [ ] Redis-backed rate limiting and OAuth session store for multi-instance deploys
- [x] Career insights: DB-backed articles (/insights, /insights/[slug]) with admin editor at /admin/insights
