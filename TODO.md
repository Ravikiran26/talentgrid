# TalentGrid — TODO

## 1. Before the demo
- [ ] Commit the current work on a new branch (everything is still uncommitted on `main`)
- [ ] Redesign the register page to match the new login page
- [ ] Test at phone width (375–430px); Chrome could only be checked down to 500px
- [ ] Submit a real application with a cover note and confirm the employer sees it
- [ ] Post a brand-new job from the employer form (only editing was tested)

## 2. Demo data (keep until the demo is done)
Keep these as they are for the demo:
- Demo candidate `priya.demo@talentgrid.com` and employer `rahul.demo@talentgrid.com` (password `Demo1234!`)
- Test job #27 "QA Test – Delivery Lead" (TalentGrid QA) and Priya's application to it
- Seeded jobs, companies, applications and insights

## 3. After the demo: switch to real data
- [ ] Delete test job #27 and its application
- [ ] Turn off demo seeding (`APP_SEED_DEMO=false`) and remove the demo accounts
- [ ] Replace the seeded jobs with real roles from real employers
- [ ] Change the admin password (default `ChangeMe123!`) and set it through env vars only
- [ ] Add real company profiles, logos and job descriptions
- [ ] Write real Career Insights articles

## 4. Product
- [ ] Applicant review: recruiter notes, bulk actions, and "export shortlist"
- [ ] Job closing date / auto-expiry
- [ ] Employer billing / job-posting plans
- [ ] Payments: Razorpay (or Stripe) checkout for PRO; replace the simulated upgrade with order + webhook
- [ ] Subscription renewal, expiry handling and invoices
- [ ] Server-side matching score (the match % is a client-side estimate today)
- [ ] Decide how long job pages may be cached (`revalidate: 60` shows edits up to a minute late)

## 5. Content and pages
- [ ] Executive-office photo at `frontend/public/hero.jpg` (falls back to a gradient today)
- [ ] Real `/privacy` and `/terms` pages
- [ ] Update `CLAUDE.md`: it still says the backend has no controllers

## 6. Before going live
- [ ] Set `SPRING_MAIL_*` env vars so e-mails are actually sent (they are only logged today)
- [ ] Set `GOOGLE_*` / `LINKEDIN_*` env vars for social sign-in
- [ ] Remove committed defaults for JWT secret, admin password and OAuth placeholders; env-only in prod
- [ ] S3-backed storage for resumes and photos (keep local storage for dev)
- [ ] Backend tests (auth, applications, quota, notifications); only a start-up test exists
- [ ] Frontend test runner (Vitest + Testing Library)
- [ ] Dockerfiles + docker-compose (postgres, backend, frontend)
- [ ] CI (GitHub Actions: build, lint, test)
- [ ] Redis-backed rate limiting and OAuth session store for multi-instance deploys
- [ ] Spring Boot Actuator health/metrics for deploy probes
- [ ] Ship logs somewhere (CloudWatch / Loki) and alert on 5xx rate
