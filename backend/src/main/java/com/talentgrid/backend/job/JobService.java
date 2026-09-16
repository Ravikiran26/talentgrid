package com.talentgrid.backend.job;

import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.dto.CreateJobRequest;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.job.dto.UpdateJobRequest;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public Page<JobResponse> search(String q, String category, String location, Pageable pageable) {
        Specification<Job> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            preds.add(cb.isTrue(root.get("active")));

            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase().trim() + "%";
                preds.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("company")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            if (category != null && !category.isBlank()) {
                preds.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase().trim()));
            }
            if (location != null && !location.isBlank()) {
                preds.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase().trim() + "%"));
            }
            return cb.and(preds.toArray(new Predicate[0]));
        };

        return jobRepository.findAll(spec, pageable).map(JobResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public JobResponse getById(Long id) {
        Job job = requireById(id);
        if (!job.isActive()) {
            throw new NotFoundException("Job not found: " + id);
        }
        return JobResponse.fromEntity(job);
    }

    public Job requireById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Job not found: " + id));
    }

    @Transactional
    public JobResponse create(CreateJobRequest req) {
        return JobResponse.fromEntity(jobRepository.save(buildJob(req)));
    }

    @Transactional
    public JobResponse createFor(com.talentgrid.backend.user.User poster, CreateJobRequest req) {
        Job job = buildJob(req);
        job.setPostedBy(poster);
        return JobResponse.fromEntity(jobRepository.save(job));
    }

    private Job buildJob(CreateJobRequest req) {
        return Job.builder()
                .title(req.title())
                .company(req.company())
                .companyLogoInitials(req.companyLogoInitials())
                .location(req.location())
                .category(req.category())
                .employmentType(req.employmentType())
                .experienceMin(req.experienceMin())
                .experienceMax(req.experienceMax())
                .salaryMin(req.salaryMin())
                .salaryMax(req.salaryMax())
                .openings(req.openings())
                .skills(req.skills() == null ? new ArrayList<>() : new ArrayList<>(req.skills()))
                .description(req.description())
                .responsibilities(req.responsibilities() == null ? new ArrayList<>() : new ArrayList<>(req.responsibilities()))
                .requirements(req.requirements() == null ? new ArrayList<>() : new ArrayList<>(req.requirements()))
                .education(req.education())
                .aboutCompany(req.aboutCompany())
                .active(true)
                .build();
    }

    @Transactional
    public JobResponse update(Long id, UpdateJobRequest req) {
        Job job = requireById(id);

        if (req.title() != null) job.setTitle(req.title());
        if (req.company() != null) job.setCompany(req.company());
        if (req.companyLogoInitials() != null) job.setCompanyLogoInitials(req.companyLogoInitials());
        if (req.location() != null) job.setLocation(req.location());
        if (req.category() != null) job.setCategory(req.category());
        if (req.employmentType() != null) job.setEmploymentType(req.employmentType());
        if (req.experienceMin() != null) job.setExperienceMin(req.experienceMin());
        if (req.experienceMax() != null) job.setExperienceMax(req.experienceMax());
        if (req.salaryMin() != null) job.setSalaryMin(req.salaryMin());
        if (req.salaryMax() != null) job.setSalaryMax(req.salaryMax());
        if (req.openings() != null) job.setOpenings(req.openings());
        if (req.skills() != null) {
            job.getSkills().clear();
            job.getSkills().addAll(req.skills());
        }
        if (req.description() != null) job.setDescription(req.description());
        if (req.responsibilities() != null) {
            job.getResponsibilities().clear();
            job.getResponsibilities().addAll(req.responsibilities());
        }
        if (req.requirements() != null) {
            job.getRequirements().clear();
            job.getRequirements().addAll(req.requirements());
        }
        if (req.education() != null) job.setEducation(req.education());
        if (req.aboutCompany() != null) job.setAboutCompany(req.aboutCompany());

        return JobResponse.fromEntity(job);
    }

    @Transactional
    public JobResponse deactivate(Long id) {
        Job job = requireById(id);
        job.setActive(false);
        return JobResponse.fromEntity(job);
    }
}
