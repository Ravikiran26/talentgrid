package com.talentgrid.backend.application;

import com.talentgrid.backend.application.dto.ApplicationResponse;
import com.talentgrid.backend.application.dto.CreateApplicationRequest;
import com.talentgrid.backend.exception.ConflictException;
import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobService jobService;

    @Transactional
    public ApplicationResponse apply(User user, CreateApplicationRequest req) {
        Job job = jobService.requireById(req.jobId());
        if (!job.isActive()) {
            throw new NotFoundException("Job not found: " + req.jobId());
        }
        if (applicationRepository.existsByUserIdAndJobId(user.getId(), req.jobId())) {
            throw new ConflictException("You have already applied to this job");
        }

        Application app = Application.builder()
                .user(user)
                .job(job)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(req.coverLetter())
                .resumeUrl(req.resumeUrl())
                .build();

        return ApplicationResponse.fromEntity(applicationRepository.save(app));
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> listMine(User user, Pageable pageable) {
        return applicationRepository.findByUserId(user.getId(), pageable)
                .map(ApplicationResponse::fromEntity);
    }
}
