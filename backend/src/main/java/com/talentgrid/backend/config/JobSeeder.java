package com.talentgrid.backend.config;

import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class JobSeeder implements CommandLineRunner {

    private final JobRepository jobRepository;

    @Override
    public void run(String... args) {
        if (jobRepository.count() > 0) {
            return;
        }

        List<JobSpec> specs = List.of(
                new JobSpec("Senior Project Manager", "Infosys", "Bengaluru", "manager", "Full-time",
                        6, 10, 18, 28,
                        List.of("Agile", "PMP", "JIRA", "Stakeholder Management", "Risk Management")),
                new JobSpec("Scrum Master", "Flipkart", "Bengaluru", "scrum-master", "Full-time",
                        4, 7, 16, 24,
                        List.of("Scrum", "Kanban", "JIRA", "Agile Coaching", "Confluence")),
                new JobSpec("PMO Manager", "Accenture", "Mumbai", "pmo", "Full-time",
                        8, 12, 22, 35,
                        List.of("PMO", "Portfolio Management", "Prince2", "MS Project", "PowerBI")),
                new JobSpec("IT Project Manager", "Wipro", "Hyderabad", "manager", "Full-time",
                        5, 9, 14, 22,
                        List.of("Agile", "Waterfall", "JIRA", "Budget Management", "Stakeholder Management")),
                new JobSpec("Program Manager", "LTIMindtree", "Bengaluru", "manager", "Full-time",
                        10, 15, 28, 42,
                        List.of("Program Management", "SAFe", "PMP", "Vendor Management", "OKRs")),
                new JobSpec("Agile Coach", "ThoughtWorks", "Bengaluru", "consultant", "Full-time",
                        7, 12, 24, 38,
                        List.of("SAFe", "Scrum", "Kanban", "Agile Transformation", "Coaching")),
                new JobSpec("Project Coordinator", "Cognizant", "Chennai", "coordinator", "Full-time",
                        2, 5, 6, 10,
                        List.of("JIRA", "MS Project", "Confluence", "Status Reporting", "RAID")),
                new JobSpec("Release Manager", "HCL Technologies", "Noida", "manager", "Full-time",
                        5, 8, 14, 20,
                        List.of("Release Management", "ServiceNow", "CI/CD", "DevOps", "ITSM")),
                new JobSpec("Digital Transformation PM", "TCS", "Mumbai", "manager", "Full-time",
                        8, 12, 20, 32,
                        List.of("Digital Transformation", "SAP", "Change Management", "Cloud Migration", "PMP")),
                new JobSpec("Product Delivery Manager", "Swiggy", "Bengaluru", "manager", "Full-time",
                        6, 10, 22, 34,
                        List.of("Product Management", "Agile", "OKRs", "Stakeholder Management", "Roadmapping")),
                new JobSpec("PMO Analyst", "Deloitte India", "Hyderabad", "pmo", "Full-time",
                        3, 6, 10, 16,
                        List.of("PMO", "MS Project", "PowerBI", "RAID", "Governance")),
                new JobSpec("IT Project Coordinator", "Tech Mahindra", "Pune", "coordinator", "Full-time",
                        1, 3, 5, 8,
                        List.of("JIRA", "Agile", "Confluence", "MS Project", "Coordination")),
                new JobSpec("Senior Scrum Master", "Razorpay", "Bengaluru", "scrum-master", "Full-time",
                        5, 8, 18, 28,
                        List.of("Scrum", "SAFe", "JIRA", "Sprint Planning", "Agile Coaching")),
                new JobSpec("Contract Project Manager", "Capgemini", "Delhi NCR", "manager", "Contract",
                        6, 10, 20, 30,
                        List.of("PMP", "Prince2", "Risk Management", "MS Project", "Waterfall")),
                new JobSpec("PMO Director", "HDFC Bank", "Mumbai", "director", "Full-time",
                        12, null, 40, 60,
                        List.of("Portfolio Management", "PMO", "Executive Reporting", "Governance", "Strategy")),

                // Several organisations run more than one search at a time, so the
                // platform figures read like a real marketplace rather than a 1:1 list.
                new JobSpec("Programme Director", "Infosys", "Pune", "director", "Full-time",
                        14, null, 45, 65,
                        List.of("Portfolio Management", "Programme Governance", "P&L", "Executive Reporting", "SAFe")),
                new JobSpec("Scrum Master", "Infosys", "Hyderabad", "scrum-master", "Full-time",
                        4, 8, 15, 23,
                        List.of("Scrum", "JIRA", "Sprint Planning", "Agile Coaching", "Confluence")),
                new JobSpec("Portfolio Manager", "Accenture", "Bengaluru", "pmo", "Full-time",
                        10, 14, 30, 44,
                        List.of("Portfolio Management", "Benefits Realisation", "Governance", "PowerBI", "Prince2")),
                new JobSpec("Transformation Lead", "TCS", "Bengaluru", "consultant", "Full-time",
                        9, 14, 26, 40,
                        List.of("Change Management", "Operating Model", "Cloud Migration", "Stakeholder Management", "PMP")),
                new JobSpec("Agile Delivery Manager", "Wipro", "Pune", "manager", "Full-time",
                        7, 11, 19, 29,
                        List.of("SAFe", "Agile", "JIRA", "Release Planning", "Coaching")),
                new JobSpec("Project Manager", "Deloitte India", "Mumbai", "manager", "Full-time",
                        6, 9, 18, 26,
                        List.of("PMP", "Risk Management", "Stakeholder Management", "MS Project", "Governance"))
        );

        for (int i = 0; i < specs.size(); i++) {
            JobSpec s = specs.get(i);
            Job job = Job.builder()
                    .title(s.title())
                    .company(s.company())
                    .location(s.location())
                    .category(s.category())
                    .employmentType(s.employmentType())
                    .experienceMin(s.expMin())
                    .experienceMax(s.expMax())
                    .salaryMin(s.salaryMin())
                    .salaryMax(s.salaryMax())
                    .skills(new ArrayList<>(s.skills()))
                    .openings((i % 3) + 1)
                    .active(true)
                    .build();
            jobRepository.save(job);
        }

        log.info("Seeded {} jobs", specs.size());
    }

    private record JobSpec(
            String title,
            String company,
            String location,
            String category,
            String employmentType,
            Integer expMin,
            Integer expMax,
            Integer salaryMin,
            Integer salaryMax,
            List<String> skills
    ) {}
}
