package com.talentgrid.backend.savedjob;

import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobService;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedJobService {

    private final SavedJobRepository repository;
    private final JobService jobService;

    @Transactional(readOnly = true)
    public List<Long> ids(User user) {
        return repository.findJobIdsByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public List<JobResponse> list(User user) {
        return repository.findByUserIdOrderBySavedAtDesc(user.getId()).stream()
                .map(SavedJob::getJob)
                .filter(Job::isActive)
                .map(JobResponse::fromEntity)
                .toList();
    }

    /** Idempotent: saving twice is a no-op. */
    @Transactional
    public void save(User user, Long jobId) {
        if (repository.existsByUserIdAndJobId(user.getId(), jobId)) return;
        Job job = jobService.requireById(jobId);
        repository.save(SavedJob.builder().user(user).job(job).build());
    }

    @Transactional
    public void remove(User user, Long jobId) {
        repository.findByUserIdAndJobId(user.getId(), jobId).ifPresent(repository::delete);
    }
}
