package com.talentgrid.backend.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends transactional e-mail. Spring Boot only creates a {@link JavaMailSender} when
 * {@code spring.mail.host} is set, so without SMTP config every message is logged instead
 * of sent. Sending is async so a slow SMTP server never delays an API response.
 */
@Service
@Slf4j
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;
    private final boolean configured;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${app.mail.from}") String from,
                        @Value("${spring.mail.host:}") String host) {
        this.mailSender = mailSender;
        this.from = from;
        // Boot creates a JavaMailSender even for an empty host, so check the value ourselves.
        this.configured = host != null && !host.isBlank();
    }

    public boolean isConfigured() {
        return configured && mailSender.getIfAvailable() != null;
    }

    @Async
    public void send(String to, String subject, String body) {
        JavaMailSender sender = isConfigured() ? mailSender.getIfAvailable() : null;
        if (sender == null) {
            log.info("[MAIL NOT CONFIGURED] to={} subject=\"{}\"\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("Sent e-mail to={} subject=\"{}\"", to, subject);
        } catch (Exception e) {
            log.error("Failed to send e-mail to={} subject=\"{}\": {}", to, subject, e.getMessage());
        }
    }
}
