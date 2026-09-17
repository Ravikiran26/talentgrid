package com.talentgrid.backend.application;

public enum ApplicationStatus {
    APPLIED,
    /** A recruiter has opened the application and is assessing it. */
    UNDER_REVIEW,
    SHORTLISTED,
    REJECTED
}
