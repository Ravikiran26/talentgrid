-- V8 backfilled past stages with an internal note that candidates can see on their
-- application page. Use the same wording ApplicationTracker.defaultNote gives new entries.
UPDATE application_status_history
SET note = CASE status
        WHEN 'UNDER_REVIEW' THEN 'The hiring team is reviewing your profile'
        WHEN 'SHORTLISTED'  THEN 'You have been shortlisted for this role'
        WHEN 'REJECTED'     THEN 'The hiring team decided not to move forward'
        ELSE 'Application submitted'
    END
WHERE note = 'Recorded before status history was tracked';
