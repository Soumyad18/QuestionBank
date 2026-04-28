package com.qb.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.qb.ai.dto.*;
import com.qb.ai.dto.DigestCommitRequest.CommitQuestion;
import com.qb.ai.dto.DigestCommitRequest.CommitSession;
import com.qb.ai.dto.DigestParseResponse.*;
import com.qb.ai.llm.GeminiClient;
import com.qb.core.entity.*;
import com.qb.core.repository.OccurrenceRepository;
import com.qb.core.repository.QuestionRepository;
import com.qb.core.service.CategoryService;
import com.qb.core.service.CompanyService;
import com.qb.core.service.RelevancyScoreService;
import com.qb.core.service.TagService;
import com.qb.core.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Orchestrates the two-step digest workflow:
 * 1. PARSE: Raw text → Gemini AI → Structured sessions + fuzzy match
 * 2. COMMIT: Admin-approved data → Database insert/link
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DigestService {

    private final GeminiClient geminiClient;
    private final FuzzyMatchService fuzzyMatchService;
    private final CompanyService companyService;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final QuestionRepository questionRepo;
    private final SessionRepository sessionRepo;
    private final OccurrenceRepository occurrenceRepo;
    private final RelevancyScoreService relevancyScoreService;

    // ─── STEP 1: PARSE ───────────────────────────────────────────────

    /**
     * Parse raw interview text using AI and enhance with fuzzy matching.
     * This is Step 1 of the digest flow — returns preview data for admin review.
     */
    public DigestParseResponse parse(String rawText) {
        // 1. Fetch category list from DB for constrained classification
        String categoryList = String.join(", ", categoryService.getAllCategoryNames());

        // 2. Call Gemini to extract structured data
        JsonNode aiResult = geminiClient.parseInterviewText(rawText, categoryList);

        // 2. Convert AI output to response DTOs + run fuzzy matching
        List<ParsedSession> sessions = new ArrayList<>();
        int tempCounter = 0;

        for (JsonNode sessionNode : aiResult.path("sessions")) {
            List<ParsedQuestion> questions = new ArrayList<>();

            for (JsonNode qNode : sessionNode.path("questions")) {
                tempCounter++;
                String questionText = qNode.path("text").asText();

                // Fuzzy match against existing questions in DB
                ExistingMatch match = fuzzyMatchService.findBestMatch(questionText).orElse(null);

                List<String> tags = new ArrayList<>();
                qNode.path("suggestedTags").forEach(t -> tags.add(t.asText()));

                questions.add(new ParsedQuestion(
                        "t" + tempCounter,
                        questionText,
                        qNode.path("category").asText("General"),
                        tags,
                        match
                ));
            }

            sessions.add(new ParsedSession(
                    sessionNode.path("candidateName").asText("Unknown"),
                    sessionNode.path("company").asText("Unknown"),
                    sessionNode.path("round").asText("L1"),
                    sessionNode.path("date").asText(null),
                    sessionNode.path("interviewer").asText(null),
                    questions
            ));
        }

        log.info("Parsed {} sessions with {} total questions", sessions.size(), tempCounter);
        return new DigestParseResponse(sessions);
    }

    // ─── STEP 2: COMMIT ──────────────────────────────────────────────

    /**
     * Commit admin-approved digest data to the database.
     * Creates companies, sessions, questions, tags, and occurrences.
     */
    @Caching(evict = {
            @CacheEvict(value = "questions",       allEntries = true),
            @CacheEvict(value = "question",        allEntries = true),
            @CacheEvict(value = "companies",       allEntries = true),
            @CacheEvict(value = "tags",             allEntries = true),
            @CacheEvict(value = "sessions",        allEntries = true),
            @CacheEvict(value = "admin-dashboard", allEntries = true)
    })
    @Transactional
    public DigestCommitResponse commit(DigestCommitRequest request) {
        AtomicInteger sessionsCreated = new AtomicInteger(0);
        AtomicInteger questionsCreated = new AtomicInteger(0);
        AtomicInteger questionsLinked = new AtomicInteger(0);
        AtomicInteger tagsCreated = new AtomicInteger(0);

        for (CommitSession cs : request.sessions()) {
            // 1. Find or create company
            Company company = companyService.findOrCreateByName(cs.companyName());

            // 2. Create interview session
            InterviewSession session = InterviewSession.builder()
                    .candidateName(cs.candidateName())
                    .company(company)
                    .round(cs.round().toLowerCase())
                    .interviewDate(cs.date() != null ? LocalDate.parse(cs.date()) : null)
                    .interviewerName(cs.interviewerName())
                    .build();
            sessionRepo.save(session);
            sessionsCreated.incrementAndGet();

            // 3. Process each question
            for (CommitQuestion cq : cs.questions()) {
                Question question;

                if (cq.existingQuestionId() != null) {
                    // Link to existing canonical question
                    question = questionRepo.findById(cq.existingQuestionId())
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "Question not found: " + cq.existingQuestionId()));
                    questionsLinked.incrementAndGet();
                } else {
                    // Create new canonical question
                    Set<Tag> tags = new HashSet<>();
                    if (cq.tags() != null) {
                        for (String tagName : cq.tags()) {
                            Tag tag = tagService.findOrCreate(tagName);
                            tags.add(tag);
                        }
                    }

                    // Resolve category — validate against DB, fallback to General
                    com.qb.core.entity.Category category = categoryService.findOrCreateByName(cq.category());

                    question = Question.builder()
                            .text(cq.text())
                            .category(category)
                            .tags(tags)
                            .occurrenceCount(0)
                            .build();
                    questionRepo.save(question);
                    questionsCreated.incrementAndGet();
                    tagsCreated.addAndGet((int) tags.stream()
                            .filter(t -> t.getId() == null) // Newly created
                            .count());
                }

                // 4. Create occurrence (links question ↔ session)
                question.incrementOccurrenceCount();
                questionRepo.save(question);

                QuestionOccurrence occurrence = QuestionOccurrence.builder()
                        .question(question)
                        .session(session)
                        .build();
                occurrenceRepo.save(occurrence);
            }
        }

        log.info("Digest committed: {} sessions, {} new questions, {} linked, {} tags",
                sessionsCreated.get(), questionsCreated.get(), questionsLinked.get(), tagsCreated.get());

        // Recompute relevancy scores for all questions since occurrence counts changed
        relevancyScoreService.recomputeAll();

        return new DigestCommitResponse(
                sessionsCreated.get(),
                questionsCreated.get(),
                questionsLinked.get(),
                tagsCreated.get()
        );
    }
}
