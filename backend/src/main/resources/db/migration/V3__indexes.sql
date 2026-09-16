-- Lookup indexes referenced by @Index annotations on entities.

CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_role_status  ON users(role, status);

CREATE INDEX IF NOT EXISTS idx_jobs_active        ON jobs(active);
CREATE INDEX IF NOT EXISTS idx_jobs_category      ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location      ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by     ON jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at     ON jobs(posted_at);

CREATE INDEX IF NOT EXISTS idx_applications_user   ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job    ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
