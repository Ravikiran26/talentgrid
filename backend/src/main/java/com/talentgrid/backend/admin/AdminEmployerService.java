package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.EmployerSummaryResponse;
import com.talentgrid.backend.company.Company;
import com.talentgrid.backend.company.CompanyRepository;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.notification.NotificationService;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminEmployerService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<EmployerSummaryResponse> list(String q, CandidateStatus status, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            preds.add(cb.equal(root.get("role"), Role.EMPLOYER));
            if (status != null) preds.add(cb.equal(root.get("status"), status));
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase().trim() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like)));
            }
            return cb.and(preds.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AdminCandidateService.StatusCounts counts() {
        return new AdminCandidateService.StatusCounts(
                userRepository.countByRole(Role.EMPLOYER),
                userRepository.countByRoleAndStatus(Role.EMPLOYER, CandidateStatus.ACTIVE),
                userRepository.countByRoleAndStatus(Role.EMPLOYER, CandidateStatus.UNDER_REVIEW),
                userRepository.countByRoleAndStatus(Role.EMPLOYER, CandidateStatus.REJECTED));
    }

    /** Rejecting an employer also closes every job they have open. */
    @Transactional
    public EmployerSummaryResponse updateStatus(Long id, CandidateStatus status) {
        User employer = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.EMPLOYER)
                .orElseThrow(() -> new NotFoundException("Employer not found: " + id));
        if (employer.getStatus() != status) {
            employer.setStatus(status);
            if (status == CandidateStatus.REJECTED) {
                int closed = 0;
                for (Job j : jobRepository.findByPostedById(id, Pageable.unpaged())) {
                    if (j.isActive()) { j.setActive(false); closed++; }
                }
                log.info("Employer {} rejected; closed {} job(s)", id, closed);
            }
            notificationService.employerStatusChanged(employer, status);
        }
        return toResponse(employer);
    }

    private EmployerSummaryResponse toResponse(User u) {
        Company c = companyRepository.findByOwnerId(u.getId()).orElse(null);
        return EmployerSummaryResponse.from(u, c,
                jobRepository.countByPostedByIdAndActiveTrue(u.getId()),
                jobRepository.countByPostedById(u.getId()));
    }
}
