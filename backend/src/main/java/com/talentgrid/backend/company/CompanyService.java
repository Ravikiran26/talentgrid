package com.talentgrid.backend.company;

import com.talentgrid.backend.exception.NotFoundException;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.job.dto.JobResponse;
import com.talentgrid.backend.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompanyService {

    private final CompanyRepository repository;
    private final JobRepository jobRepository;

    @Transactional(readOnly = true)
    public Optional<Company> findForOwner(User owner) {
        return repository.findByOwnerId(owner.getId());
    }

    @Transactional(readOnly = true)
    public Optional<CompanyResponse> mine(User owner) {
        return repository.findByOwnerId(owner.getId()).map(c -> CompanyResponse.fromEntity(c, activeJobs(c)));
    }

    /** Creates the profile on first save, updates it afterwards. Existing jobs follow the new name. */
    @Transactional
    public CompanyResponse save(User owner, CompanyRequest req) {
        Company c = repository.findByOwnerId(owner.getId())
                .orElseGet(() -> Company.builder().owner(owner).build());
        c.setName(req.name().trim());
        c.setLogoInitials(initials(req.name()));
        c.setWebsite(blankToNull(req.website()));
        c.setIndustry(blankToNull(req.industry()));
        c.setSize(blankToNull(req.size()));
        c.setCity(blankToNull(req.city()));
        c.setDescription(blankToNull(req.description()));
        Company saved = repository.save(c);

        for (Job job : jobRepository.findByCompanyId(saved.getId())) {
            job.setCompany(saved.getName());
            job.setCompanyLogoInitials(saved.getLogoInitials());
            if (job.getAboutCompany() == null || job.getAboutCompany().isBlank()) {
                job.setAboutCompany(saved.getDescription());
            }
        }
        log.info("Company profile saved id={} owner={}", saved.getId(), owner.getId());
        return CompanyResponse.fromEntity(saved, activeJobs(saved));
    }

    @Transactional(readOnly = true)
    public CompanyResponse getPublic(Long id) {
        Company c = repository.findById(id).orElseThrow(() -> new NotFoundException("Company not found: " + id));
        return CompanyResponse.fromEntity(c, activeJobs(c));
    }

    private List<JobResponse> activeJobs(Company c) {
        return jobRepository.findByCompanyIdAndActiveTrueOrderByPostedAtDesc(c.getId())
                .stream().map(JobResponse::fromEntity).toList();
    }

    public static String initials(String name) {
        StringBuilder sb = new StringBuilder();
        for (String w : name.trim().split("\\s+")) {
            if (!w.isEmpty() && Character.isLetterOrDigit(w.charAt(0))) sb.append(Character.toUpperCase(w.charAt(0)));
            if (sb.length() == 2) break;
        }
        return sb.length() == 0 ? "CO" : sb.toString();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
