-- Track how an account was created (local password vs. social sign-in).
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id   VARCHAR(255);

ALTER TABLE users ADD CONSTRAINT users_auth_provider_check
    CHECK (auth_provider IN ('LOCAL','GOOGLE','LINKEDIN'));
