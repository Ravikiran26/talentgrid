package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.CandidateDetailResponse;
import com.talentgrid.backend.admin.dto.CandidateSummaryResponse;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.notification.NotificationService;
import com.talentgrid.backend.resume.ResumeService;
import com.talentgrid.backend.user.CandidateStatus;
import com.talentgrid.backend.user.Role;
import com.talentgrid.backend.user.User;
import com.talentgrid.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminCandidateService {

    private final UserRepository userRepository;
    private final ResumeService resumeService;
    private final NotificationService notificationService;
    private final com.talentgrid.backend.resume.ResumeStorage storage;

    @Transactional(readOnly = true)
    public Page<CandidateSummaryResponse> listCandidates(String q, CandidateStatus status, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<User> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> preds = new java.util.ArrayList<>();
            preds.add(cb.equal(root.get("role"), Role.CANDIDATE));
            if (status != null) preds.add(cb.equal(root.get("status"), status));
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase().trim() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("headline"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("city"), "")), like)));
            }
            return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return userRepository.findAll(spec, pageable).map(CandidateSummaryResponse::fromEntity);
    }

    public record StatusCounts(long all, long active, long underReview, long rejected) {}

    @Transactional(readOnly = true)
    public StatusCounts counts() {
        return new StatusCounts(
                userRepository.countByRole(Role.CANDIDATE),
                userRepository.countByRoleAndStatus(Role.CANDIDATE, CandidateStatus.ACTIVE),
                userRepository.countByRoleAndStatus(Role.CANDIDATE, CandidateStatus.UNDER_REVIEW),
                userRepository.countByRoleAndStatus(Role.CANDIDATE, CandidateStatus.REJECTED));
    }

    @Transactional(readOnly = true)
    public CandidateDetailResponse getCandidate(Long id) {
        return CandidateDetailResponse.fromEntity(requireCandidate(id));
    }

    @Transactional
    public CandidateDetailResponse updateStatus(Long id, CandidateStatus status) {
        User candidate = requireCandidate(id);
        if (candidate.getStatus() != status) {
            candidate.setStatus(status);
            notificationService.candidateStatusChanged(candidate, status);
        }
        return CandidateDetailResponse.fromEntity(candidate);
    }

    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadResumeFor(Long candidateId) {
        User candidate = requireCandidate(candidateId);
        ResumeService.ResumeDownload download = resumeService.loadFor(candidate);
        log.info("Admin fetched resume for candidateId={} key={}", candidateId, download.filename());
        return download;
    }

    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadPhotoFor(Long candidateId) {
        User c = requireCandidate(candidateId);
        String key = c.getPhotoFile();
        if (key == null || key.isBlank()) throw new NotFoundException("No photo on file");
        String ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
        String type = switch (ext) { case "png" -> "image/png"; case "webp" -> "image/webp"; default -> "image/jpeg"; };
        return new ResumeService.ResumeDownload(storage.resolve(key), type, key);
    }

    private User requireCandidate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Candidate not found: " + id));
        if (user.getRole() != Role.CANDIDATE) {
            throw new NotFoundException("Candidate not found: " + id);
        }
        return user;
    }
}
