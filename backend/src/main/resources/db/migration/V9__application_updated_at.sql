-- When an application last changed (normally a status move), shown as "Updated …" on the dashboard.
ALTER TABLE applications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;

-- Backfill from the latest status change, or the apply date when there is no history.
UPDATE applications a
SET updated_at = COALESCE(
        (SELECT MAX(h.changed_at) FROM application_status_history h WHERE h.application_id = a.id),
        a.applied_at);
