package com.qb.core.service;

import com.qb.core.dto.QuestionDTO;
import com.qb.core.entity.EmailLog;
import com.qb.core.repository.EmailLogRepository;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Sends transactional emails via Gmail SMTP with PDF attachment.
 * Logs every send to email_logs table.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender     mailSender;
    private final PdfService         pdfService;
    private final EmailLogRepository emailLogRepo;

    @Value("${app.email.sender-email}")
    private String senderEmail;

    @Value("${app.email.sender-name:QuestionBank}")
    private String senderName;

    public record SendResult(int emailsSent, List<String> errors) {}

    public SendResult sendInterviewPrepEmails(
            UUID sentByUserId,
            List<Map<String, String>> recipients,   // [{email, name, company, round, date}]
            List<QuestionDTO> questions,
            Map<String, String> filters
    ) {
        int sent = 0;
        List<String> errors = new java.util.ArrayList<>();
        List<String> recipientEmails = new java.util.ArrayList<>();

        for (Map<String, String> recipient : recipients) {
            String email   = recipient.get("email");
            String name    = recipient.getOrDefault("name", "Candidate");
            String company = recipient.getOrDefault("company", "");
            String round   = recipient.getOrDefault("round", "");
            String date    = recipient.getOrDefault("date", "");

            try {
                // Generate PDF for this recipient
                byte[] pdfBytes = pdfService.generateQuestionListPdf(name, company, round, date, questions);

                String subject = String.format("Interview Prep — %s %s", company, round.toUpperCase());

                // Build and send MIME message with attachment
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, senderName);
                helper.setTo(email);
                helper.setSubject(subject);
                helper.setText(buildHtmlBody(name, company, round, date, questions.size()), true);
                helper.addAttachment("interview-prep.pdf",
                        new ByteArrayDataSource(pdfBytes, "application/pdf"));

                mailSender.send(message);

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
