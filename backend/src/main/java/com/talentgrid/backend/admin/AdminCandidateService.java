package com.talentgrid.backend.admin;

import com.talentgrid.backend.admin.dto.CandidateDetailResponse;
import com.talentgrid.backend.admin.dto.CandidateSummaryResponse;
import com.talentgrid.backend.exception.NotFoundException;
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

    @Transactional(readOnly = true)
    public Page<CandidateSummaryResponse> listCandidates(Pageable pageable) {
        return userRepository.findAllByRole(Role.CANDIDATE, pageable)
                .map(CandidateSummaryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CandidateDetailResponse getCandidate(Long id) {
        return CandidateDetailResponse.fromEntity(requireCandidate(id));
    }

    @Transactional
    public CandidateDetailResponse updateStatus(Long id, CandidateStatus status) {
        User candidate = requireCandidate(id);
        candidate.setStatus(status);
        return CandidateDetailResponse.fromEntity(candidate);
    }

    @Transactional(readOnly = true)
    public ResumeService.ResumeDownload loadResumeFor(Long candidateId) {
        User candidate = requireCandidate(candidateId);
        ResumeService.ResumeDownload download = resumeService.loadFor(candidate);
        log.info("Admin fetched resume for candidateId={} key={}", candidateId, download.filename());
        return download;
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
