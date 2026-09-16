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
- [ ] Backend: Email to candidate when status changes (Active / Rejected)
- [ ] Backend: Email to candidate when application is shortlisted
- [ ] Backend: Email to employer when a candidate applies to their job
- [ ] Frontend: In-app notification bell in header (future phase)

## 7. Search & Filters (Priority: LOW)
- [ ] Backend: GET /api/jobs with query params (?category=&location=&keyword=) for server-side filtering
- [ ] Frontend: Wire JobSearch to backend query params instead of client-side filter

## 8. Misc / Polish
- [ ] Fix: Candidate name on admin page showing full DB string (e.g. "Ravikiran RAVI Ravella") — normalise fullName on register
- [ ] Add resume upload endpoint (POST /api/profile/resume) — store file, return URL
- [ ] Frontend: Resume download in admin panel should hit real file URL
- [ ] Add pagination to admin candidates list (when list grows large)
- [ ] Add pagination to admin jobs list
