package com.qb.core.service;

import com.qb.core.dto.QuestionDTO;
import com.qb.core.entity.EmailLog;
import com.qb.core.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Sends transactional emails via Brevo REST API with PDF attachment.
 * Logs every send to email_logs table.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Value("${app.email.brevo-api-key:not-set}")
    private String brevoApiKey;

    @Value("${app.email.sender-email:soumyaon7@gmail.com}")
    private String senderEmail;

    @Value("${app.email.sender-name:QuestionBank}")
    private String senderName;

    private final PdfService        pdfService;
    private final EmailLogRepository emailLogRepo;

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    public record SendResult(int emailsSent, List<String> errors) {}

    public SendResult sendInterviewPrepEmails(
            UUID sentByUserId,
            List<Map<String, String>> recipients,   // [{email, name, company, round, date}]
            List<QuestionDTO> questions,
            Map<String, String> filters
    ) {
        if ("not-set".equals(brevoApiKey)) {
            log.warn("BREVO_API_KEY not configured — skipping email send");
            return new SendResult(0, List.of("BREVO_API_KEY not configured"));
        }

        int sent = 0;
        List<String> errors = new java.util.ArrayList<>();
        List<String> recipientEmails = new java.util.ArrayList<>();

        RestClient client = RestClient.builder()
                .baseUrl(BREVO_URL)
                .defaultHeader("api-key", brevoApiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        for (Map<String, String> recipient : recipients) {
            String email    = recipient.get("email");
            String name     = recipient.getOrDefault("name", "Candidate");
            String company  = recipient.getOrDefault("company", "");
            String round    = recipient.getOrDefault("round", "");
            String date     = recipient.getOrDefault("date", "");

            try {
                // Generate PDF for this recipient
                byte[] pdfBytes = pdfService.generateQuestionListPdf(name, company, round, date, questions);
                String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

                String subject = String.format("Interview Prep — %s %s", company, round.toUpperCase());

                // Build Brevo request body
                Map<String, Object> body = Map.of(
                        "sender", Map.of("name", senderName, "email", senderEmail),
                        "to", List.of(Map.of("email", email, "name", name)),
                        "subject", subject,
                        "htmlContent", buildHtmlBody(name, company, round, date, questions.size()),
                        "attachment", List.of(Map.of(
                                "content", pdfBase64,
                                "name", "interview-prep.pdf"
                        ))
                );

                client.post()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();

                recipientEmails.add(email);
                sent++;
                log.info("Email sent to {} for {} {}", email, company, round);

            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", email, e.getMessage());
                errors.add(email + ": " + e.getMessage());
            }
        }

        // Log the batch
        if (sent > 0) {
            String subject = recipients.isEmpty() ? "Interview Prep"
                    : String.format("Interview Prep — %s", recipients.get(0).getOrDefault("company", ""));
            emailLogRepo.save(EmailLog.builder()
                    .sentBy(sentByUserId)
                    .subject(subject)
                    .recipientCount(sent)
                    .recipientEmails(recipientEmails)
                    .filters(filters)
                    .sentAt(Instant.now())
                    .build());
        }

        return new SendResult(sent, errors);
    }

    private String buildHtmlBody(String name, String company, String round, String date, int questionCount) {
        return String.format("""
                <div style="font-family: monospace; background: #0a0a0a; color: #eee; padding: 32px;">
                  <h2 style="color: #00f0ff;">Interview Prep — %s</h2>
                  <p>Hi <strong>%s</strong>,</p>
                  <p>Please find attached your interview preparation material for:</p>
                  <ul>
                    <li><strong>Company:</strong> %s</li>
                    <li><strong>Round:</strong> %s</li>
                    <li><strong>Date:</strong> %s</li>
                    <li><strong>Questions:</strong> %d</li>
                  </ul>
                  <p style="color: #888; font-size: 12px;">Sent by QuestionBank</p>
                </div>
                """, company, name, company, round.toUpperCase(), date, questionCount);
    }
}
