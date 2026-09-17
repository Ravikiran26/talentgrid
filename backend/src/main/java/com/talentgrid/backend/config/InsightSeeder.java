package com.talentgrid.backend.config;

import com.talentgrid.backend.insight.Insight;
import com.talentgrid.backend.insight.InsightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/** Seeds the first three Career Insights articles on an empty table. Idempotent. */
@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class InsightSeeder implements CommandLineRunner {

    private final InsightRepository repository;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        Instant now = Instant.now();
        List<Insight> seed = List.of(
            Insight.builder()
                .slug("what-hiring-managers-expect-from-senior-pmo-professionals")
                .title("What hiring managers now expect from senior PMO professionals")
                .category("PMO Leadership").readTime("6 min read")
                .excerpt("Governance alone no longer gets you shortlisted. Hiring panels are weighting portfolio-level financial fluency, benefits realisation and executive storytelling far higher than certification count.")
                .body("""
                    For most of the last decade, a senior PMO hire was judged on process. Could you stand up a stage-gate model, run a RAID log with discipline and produce a status pack the steering committee would actually read? Those skills still matter, but in the interviews we sit in on today they are treated as the entry ticket, not the differentiator.

                    ## Financial fluency is now table stakes

                    Hiring managers increasingly ask PMO candidates to walk through a portfolio's cost base, not just its schedule. Expect questions like "how did you re-baseline when the run-rate slipped 15 percent" or "which programmes did you recommend stopping, and how did you make that case". Candidates who can speak about capitalisation, benefits tracking and the difference between forecast and committed spend get a second interview far more often.

                    ## Benefits realisation, not delivery

                    The strongest signal we see in shortlists is a candidate who can name the business outcome a programme produced, in the organisation's own numbers. "Delivered on time" is a weak answer. "Cut onboarding time from eleven days to four, which the COO cited in the annual review" is the answer that wins.

                    ## Executive storytelling

                    Senior PMO roles report into leaders who read a one-page summary and nothing else. Panels now test this directly: several of our clients ask candidates to condense a ten-slide status deck into a single paragraph, live. Practise it. The people who do this well describe the decision the executive needs to make first, the evidence second, and the detail last.

                    ## What to change in your profile this week

                    Lead each experience entry with an outcome and a number. Move certifications to the bottom. Add one sentence per role on how you influenced a funding or stop decision. Those three edits move profiles from "under review" to "shortlisted" more reliably than anything else we have measured.
                    """.stripIndent().trim())
                .publishedAt(now.minus(2, ChronoUnit.DAYS)).build(),
            Insight.builder()
                .slug("what-indian-employers-pay-pmp-certified-project-managers-2026")
                .title("What Indian employers actually pay PMP-certified Project Managers in 2026")
                .category("Salary Trends").readTime("4 min read")
                .excerpt("Salary bands across Hyderabad, Bengaluru, Pune and Gurugram, by experience tier, drawn from roles posted on TalentGrid this year.")
                .body("""
                    Salary conversations for project managers in India are still driven by anecdotes. Here is what the roles posted on TalentGrid in the first three quarters of 2026 actually offered, grouped by experience tier and city. All figures are annual fixed pay in lakhs, excluding variable and stock.

                    ## 4 to 7 years

                    Bengaluru and Hyderabad cluster between 14 and 22 lakhs for product and technology programmes. Pune and Chennai sit two to three lakhs lower for comparable scope. Gurugram roles at consulting firms reach the top of the band but usually expect travel.

                    ## 8 to 12 years

                    This is where the PMP starts to matter in the offer, not just the screen. Roles at this tier ranged from 22 to 35 lakhs, with the widest spread in Bengaluru. Candidates who also carried SAFe or a cloud certification were offered, on average, three lakhs more than those with PMP alone.

                    ## 12 years and above

                    Programme and portfolio roles ran from 28 to 45 lakhs fixed. At this level city matters less than sector: financial services and global capability centres paid at the top of the band, IT services at the bottom.

                    ## How to use these numbers

                    Quote the band for your tier and city when a recruiter asks for expectations, then anchor to the top of it with one outcome from your last role. Employers on our platform rarely reject a candidate for asking within band, and they reliably reject candidates who cannot explain why they deserve the top of it.
                    """.stripIndent().trim())
                .publishedAt(now.minus(9, ChronoUnit.DAYS)).build(),
            Insight.builder()
                .slug("agile-leadership-in-the-ai-era-what-scrum-masters-need-next")
                .title("Agile leadership in the AI era: what Scrum Masters need next")
                .category("Agile Delivery").readTime("5 min read")
                .excerpt("Facilitation is table stakes. Here is what differentiates the RTE and delivery-lead candidates who get offers.")
                .body("""
                    Scrum Master hiring has changed faster in the last eighteen months than in the previous five years. Teams are smaller, tooling does more of the ceremony work, and the role is being folded into delivery-lead and Release Train Engineer positions. The candidates still getting offers have made three shifts.

                    ## From facilitating to forecasting

                    Running a clean retrospective is no longer enough. Hiring managers want Scrum Masters who own the delivery forecast: cycle-time distributions, throughput trends and a credible answer to "when will this be done". If you cannot pull that from your team's tooling today, learn to.

                    ## From one team to a train

                    Most openings we see at 6 years and above are multi-team. They expect you to run PI planning, manage cross-team dependencies and negotiate scope with product leadership. SAFe RTE certification helps at the screen; a story about un-blocking a four-team dependency wins the interview.

                    ## From process to engineering fluency

                    You do not need to write code, but you do need to talk credibly about CI pipelines, test automation coverage and why a release train is slow. Candidates who can discuss DORA metrics with an engineering manager are shortlisted at roughly twice the rate of those who cannot.

                    ## Practical next steps

                    Add a delivery-metrics section to your profile with two or three real numbers. Rewrite your headline to say what you deliver, not which ceremonies you run. And when asked about AI tooling in interviews, describe how you used it to remove work from the team rather than how it threatens the role.
                    """.stripIndent().trim())
                .publishedAt(now.minus(16, ChronoUnit.DAYS)).build()
        );
        repository.saveAll(seed);
        log.info("Seeded {} career insights", seed.size());
    }
}
