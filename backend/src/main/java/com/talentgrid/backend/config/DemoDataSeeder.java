package com.talentgrid.backend.config;

import com.talentgrid.backend.application.Application;
import com.talentgrid.backend.application.ApplicationRepository;
import com.talentgrid.backend.application.ApplicationStatus;
import com.talentgrid.backend.application.ApplicationStatusHistory;
import com.talentgrid.backend.application.ApplicationStatusHistoryRepository;
import com.talentgrid.backend.company.Company;
import com.talentgrid.backend.company.CompanyRepository;
import com.talentgrid.backend.company.CompanyService;
import com.talentgrid.backend.job.Job;
import com.talentgrid.backend.job.JobRepository;
import com.talentgrid.backend.notification.Notification;
import com.talentgrid.backend.notification.NotificationRepository;
import com.talentgrid.backend.notification.NotificationType;
import com.talentgrid.backend.resume.ResumeStorage;
import com.talentgrid.backend.savedjob.SavedJob;
import com.talentgrid.backend.savedjob.SavedJobRepository;
import com.talentgrid.backend.subscription.Subscription;
import com.talentgrid.backend.subscription.SubscriptionPlan;
import com.talentgrid.backend.subscription.SubscriptionRepository;
import com.talentgrid.backend.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Seeds one fully populated candidate and one verified employer so every screen has data.
 * Runs after jobs and insights, only when {@code app.demo.seed=true}, and only once.
 *
 * <pre>
 *   candidate  priya.demo@talentgrid.com / Demo1234!
 *   employer   rahul.demo@talentgrid.com / Demo1234!
 * </pre>
 */
@Component
@Order(4)
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    public static final String CANDIDATE_EMAIL = "priya.demo@talentgrid.com";
    public static final String EMPLOYER_EMAIL  = "rahul.demo@talentgrid.com";
    public static final String PASSWORD        = "Demo1234!";

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository historyRepository;
    private final SavedJobRepository savedJobRepository;
    private final NotificationRepository notificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final ResumeStorage storage;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.seed:true}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || userRepository.existsByEmail(CANDIDATE_EMAIL)) return;

        User employer = seedEmployer();
        Company company = seedCompany(employer);
        Job employerJob = seedEmployerJob(employer, company);
        User priya = seedCandidate();
        seedFiles(priya);
        seedApplications(priya, employerJob, employer);
        seedSavedJobs(priya);
        seedSubscription(priya);
        seedNotifications(priya);

        log.info("Seeded demo data: candidate {} and employer {}. Password is in CLAUDE.md / application.properties.",
                CANDIDATE_EMAIL, EMPLOYER_EMAIL);
    }

    // ---------------------------------------------------------------- employer

    private User seedEmployer() {
        return userRepository.save(User.builder()
                .fullName("Rahul Mehta")
                .email(EMPLOYER_EMAIL)
                .phone("+91 98200 45678")
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .role(Role.EMPLOYER)
                .status(CandidateStatus.ACTIVE)
                .build());
    }

    private Company seedCompany(User owner) {
        return companyRepository.save(Company.builder()
                .owner(owner)
                .name("Nimbus Technologies")
                .logoInitials(CompanyService.initials("Nimbus Technologies"))
                .website("nimbus-tech.example")
                .industry("IT Services & Consulting")
                .size("201-500")
                .city("Hyderabad")
                .description("Nimbus builds cloud migration and data platforms for BFSI clients across India and the Gulf.\n\n"
                        + "Our delivery organisation runs 14 programmes with a flat structure and a strong PMO practice. "
                        + "We hire project and programme managers who own outcomes, not just schedules.")
                .build());
    }

    private Job seedEmployerJob(User employer, Company company) {
        Job job = Job.builder()
                .title("Technical Program Manager")
                .company(company.getName())
                .companyLogoInitials(company.getLogoInitials())
                .location("Hyderabad")
                .category("manager")
                .employmentType("Full-time")
                .experienceMin(7).experienceMax(12)
                .salaryMin(26).salaryMax(38)
                .openings(2)
                .skills(new ArrayList<>(List.of("Program Management", "Cloud Migration", "SAFe", "Stakeholder Management", "Risk Management")))
                .description("Own two cloud-migration programmes end to end for a large private bank: scope, budget, vendor "
                        + "coordination and executive reporting. You will run PI planning across four scrum teams and a "
                        + "shared platform team, and present monthly to the client steering committee.")
                .responsibilities(new ArrayList<>(List.of(
                        "Lead programme planning, budgeting and benefits tracking",
                        "Run PI planning and manage cross-team dependencies",
                        "Own risk and issue management with the client PMO",
                        "Report progress to CXO-level stakeholders")))
                .requirements(new ArrayList<>(List.of(
                        "7+ years in project or programme management, 3+ in technology delivery",
                        "SAFe RTE or PMP certification",
                        "Experience with cloud migration programmes (AWS or Azure)",
                        "Comfortable presenting to executive audiences")))
                .education("Bachelor's degree in Engineering or equivalent")
                .aboutCompany(company.getDescription())
                .active(true)
                .postedBy(employer)
                .companyProfile(company)
                .build();
        return jobRepository.save(job);
    }

    // --------------------------------------------------------------- candidate

    private User seedCandidate() {
        User u = User.builder()
                .fullName("Priya Sharma")
                .email(CANDIDATE_EMAIL)
                .phone("+91 98450 12345")
                .passwordHash(passwordEncoder.encode(PASSWORD))
                .role(Role.CANDIDATE)
                .status(CandidateStatus.ACTIVE)
                .headline("Senior Project Manager · PMP · SAFe RTE")
                .city("Bengaluru")
                .totalExp(9)
                .about("Nine years delivering technology programmes for banking and e-commerce clients. I have run "
                        + "portfolios up to ₹40 crore, led PI planning for release trains of five teams, and built two PMOs "
                        + "from scratch. I am looking for a programme leadership role where delivery outcomes are measured "
                        + "in business numbers, not just milestones.")
                .skills(new ArrayList<>(List.of("Agile", "PMP", "SAFe", "JIRA", "Stakeholder Management",
                        "Risk Management", "Budget Management", "Confluence", "Vendor Management")))
                .build();

        u.getExperience().add(Experience.builder().user(u)
                .title("Senior Project Manager").company("Infosys").location("Bengaluru")
                .startDate(LocalDate.of(2021, 4, 1)).current(true)
                .description("Lead a ₹18 crore core-banking modernisation programme for a private bank. Cut release "
                        + "cycle from 8 weeks to 3 and delivered phase one 6 weeks early.")
                .build());
        u.getExperience().add(Experience.builder().user(u)
                .title("Project Manager").company("Flipkart").location("Bengaluru")
                .startDate(LocalDate.of(2018, 6, 1)).endDate(LocalDate.of(2021, 3, 31)).current(false)
                .description("Managed seller-onboarding platform delivery across four scrum teams. Introduced flow "
                        + "metrics that halved cycle-time variance.")
                .build());
        u.getExperience().add(Experience.builder().user(u)
                .title("Project Coordinator").company("Wipro").location("Hyderabad")
                .startDate(LocalDate.of(2016, 7, 1)).endDate(LocalDate.of(2018, 5, 31)).current(false)
                .description("Coordinated a 30-person infrastructure programme; owned RAID log, status reporting and vendor SLAs.")
                .build());

        u.getEducation().add(Education.builder().user(u)
                .institution("Indian Institute of Management, Indore").degree("MBA").fieldOfStudy("Operations")
                .startYear(2014).endYear(2016).grade("7.8 CGPA").build());
        u.getEducation().add(Education.builder().user(u)
                .institution("Visvesvaraya Technological University").degree("B.E.").fieldOfStudy("Computer Science")
                .startYear(2010).endYear(2014).grade("First class with distinction").build());

        return userRepository.save(u);
    }

    private void seedFiles(User u) {
        try (var pdf = new ByteArrayInputStream(resumePdf(u))) {
            u.setResumeFile(storage.store(u.getId(), "pdf", pdf));
        } catch (IOException e) {
            log.warn("Demo resume not stored: {}", e.getMessage());
        }
        try (var png = new ByteArrayInputStream(avatarPng("PS"))) {
            u.setPhotoFile(storage.store(u.getId(), "png", png));
        } catch (IOException e) {
            log.warn("Demo photo not stored: {}", e.getMessage());
        }
        userRepository.save(u);
    }

    private void seedApplications(User priya, Job employerJob, User employer) {
        apply(priya, byTitle("Senior Project Manager"), ApplicationStatus.SHORTLISTED,
                "I have led two core-banking programmes of similar scale and would welcome a conversation.");
        apply(priya, byTitle("Program Manager"), ApplicationStatus.UNDER_REVIEW, null);
        apply(priya, byTitle("PMO Manager"), ApplicationStatus.REJECTED, null);
        apply(priya, Optional.of(employerJob), ApplicationStatus.APPLIED,
                "Cloud migration for BFSI is exactly my current programme. Happy to share outcomes on a call.");

        notificationRepository.save(Notification.builder().user(employer)
                .type(NotificationType.APPLICATION_RECEIVED)
                .message(priya.getFullName() + " applied for " + employerJob.getTitle() + ".")
                .link("/employer/dashboard").build());
    }

    /** Saves the application and a plausible dated timeline leading to its current stage. */
    private void apply(User user, Optional<Job> job, ApplicationStatus status, String coverLetter) {
        job.ifPresent(j -> {
            Application saved = applicationRepository.save(Application.builder()
                    .user(user).job(j).status(status).coverLetter(coverLetter).build());

            List<ApplicationStatus> path = switch (status) {
                case APPLIED      -> List.of(ApplicationStatus.APPLIED);
                case UNDER_REVIEW -> List.of(ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW);
                case SHORTLISTED  -> List.of(ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.SHORTLISTED);
                case REJECTED     -> List.of(ApplicationStatus.APPLIED, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED);
            };
            int daysAgo = path.size() * 3;
            for (ApplicationStatus s : path) {
                historyRepository.save(ApplicationStatusHistory.builder()
                        .application(saved).status(s)
                        .note(com.talentgrid.backend.application.ApplicationTracker.defaultNote(s))
                        .changedAt(Instant.now().minus(daysAgo, ChronoUnit.DAYS))
                        .build());
                daysAgo -= 3;
            }
        });
    }

    private void seedSavedJobs(User priya) {
        for (String title : List.of("Scrum Master", "Agile Coach")) {
            byTitle(title).ifPresent(j -> savedJobRepository.save(SavedJob.builder().user(priya).job(j).build()));
        }
    }

    private void seedSubscription(User priya) {
        subscriptionRepository.save(Subscription.builder()
                .user(priya).plan(SubscriptionPlan.PRO)
                .expiresAt(Instant.now().plus(23, ChronoUnit.DAYS))
                .build());
    }

    private void seedNotifications(User priya) {
        List<Notification> items = List.of(
                Notification.builder().user(priya).type(NotificationType.ACCOUNT_STATUS)
                        .message("Your profile has been approved. You can now apply to roles.").link("/profile").read(true).build(),
                Notification.builder().user(priya).type(NotificationType.SUBSCRIPTION)
                        .message("Welcome to PRO. Unlimited applications are now active.").link("/subscription").read(true).build(),
                Notification.builder().user(priya).type(NotificationType.APPLICATION_STATUS)
                        .message("Your application for Senior Project Manager at Infos was shortlisted.").link("/applications").build(),
                Notification.builder().user(priya).type(NotificationType.APPLICATION_STATUS)
                        .message("Your application for PMO Manager at Accenture was not taken forward.").link("/applications").build());
        notificationRepository.saveAll(items);
    }

    // ------------------------------------------------------------------ helpers

    private Optional<Job> byTitle(String title) {
        return jobRepository.findAll().stream().filter(j -> title.equals(j.getTitle())).findFirst();
    }

    /** A minimal but valid single-page PDF with the candidate's name and headline. */
    private static byte[] resumePdf(User u) {
        String text = "BT /F1 18 Tf 60 740 Td (" + esc(u.getFullName()) + ") Tj 0 -28 Td /F1 11 Tf ("
                + esc(u.getHeadline()) + ") Tj 0 -20 Td (" + esc(u.getEmail() + "  |  " + u.getPhone() + "  |  " + u.getCity())
                + ") Tj 0 -36 Td (Skills: " + esc(String.join(", ", u.getSkills())) + ") Tj ET";
        String stream = "<< /Length " + text.getBytes(StandardCharsets.ISO_8859_1).length + " >>\nstream\n" + text + "\nendstream";
        List<String> objs = List.of(
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
                stream,
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
        StringBuilder sb = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objs.size(); i++) {
            offsets.add(sb.length());
            sb.append(i + 1).append(" 0 obj\n").append(objs.get(i)).append("\nendobj\n");
        }
        int xref = sb.length();
        sb.append("xref\n0 ").append(objs.size() + 1).append("\n0000000000 65535 f \n");
        for (int off : offsets) sb.append(String.format("%010d 00000 n \n", off));
        sb.append("trailer\n<< /Size ").append(objs.size() + 1).append(" /Root 1 0 R >>\nstartxref\n").append(xref).append("\n%%EOF\n");
        return sb.toString().getBytes(StandardCharsets.ISO_8859_1);
    }

    private static String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }

    /** Teal square with white initials, so the profile photo slot is visibly filled. */
    private static byte[] avatarPng(String initials) throws IOException {
        int size = 256;
        BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(new Color(0x0E, 0x7C, 0x7B));
        g.fillRect(0, 0, size, size);
        g.setColor(Color.WHITE);
        g.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 110));
        FontMetrics fm = g.getFontMetrics();
        int x = (size - fm.stringWidth(initials)) / 2;
        int y = (size - fm.getHeight()) / 2 + fm.getAscent();
        g.drawString(initials, x, y);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }
}
