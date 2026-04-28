package com.qb.core.service;

import com.qb.core.dto.QuestionDTO;
import com.qb.core.dto.QuestionUpdateRequest;
import com.qb.core.entity.Category;
import com.qb.core.entity.Question;
import com.qb.core.entity.Tag;
import com.qb.core.exception.ResourceNotFoundException;
import com.qb.core.repository.CategoryRepository;
import com.qb.core.repository.CompanyRepository;
import com.qb.core.repository.OccurrenceRepository;
import com.qb.core.repository.QuestionRepository;
import com.qb.core.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository    questionRepo;
    private final TagRepository         tagRepo;
    private final OccurrenceRepository  occurrenceRepo;
    private final CompanyRepository     companyRepo;
    private final CategoryRepository    categoryRepo;
    private final RelevancyScoreService relevancyScoreService;

    /**
     * Search + filter questions with pagination.
     * Sorted by relevancy_score DESC at DB level.
     * Importance filter applied at DB level via relevancy_label column.
     */
    @Cacheable(value = "questions", key = "#search + '::' + #interviewType + '::' + #category + '::' + #companySlug + '::' + #round + '::' + #tagName + '::' + #importanceLabel + '::p' + #page + '::s' + #size")
    @Transactional(readOnly = true)
    public Page<QuestionDTO> searchQuestions(String search, String interviewType, String category,
                                             String companySlug, String round, String tagName,
                                             String importanceLabel, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);

        return questionRepo.searchQuestions(
                blankToNull(search), blankToNull(interviewType), blankToNull(category),
                blankToNull(companySlug), blankToNull(round),
                blankToNull(tagName), blankToNull(importanceLabel),
                pageable
        ).map(q -> toDTO(q, blankToNull(companySlug), blankToNull(round)));
    }

    /**
     * Get single question with full details.
     */
    @Cacheable(value = "question", key = "#id")
    @Transactional(readOnly = true)
    public QuestionDTO getById(UUID id) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));
        return toDTO(q, null, null);
    }

    /**
     * Update question (admin only).
     */
    @Caching(evict = {
            @CacheEvict(value = "questions", allEntries = true),
            @CacheEvict(value = "question",  key = "#id")
    })
    @Transactional
    public QuestionDTO updateQuestion(UUID id, QuestionUpdateRequest request) {
        Question q = questionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question", id));

        q.setText(request.text());

        // Resolve category by name
        Category category = categoryRepo.findByNameIgnoreCase(request.category())
                .orElseGet(() -> categoryRepo.findByNameIgnoreCase("General").orElseThrow());
        q.setCategory(category);

        if (request.tags() != null) {
            Set<Tag> tags = request.tags().stream()
                    .map(name -> tagRepo.findByNameIgnoreCase(name)
                            .orElseGet(() -> tagRepo.save(Tag.builder().name(name.toLowerCase()).build())))
                    .collect(Collectors.toSet());
            q.setTags(tags);
        }

        return toDTO(questionRepo.save(q), null, null);
    }

    /**
     * Delete question (admin only).
     */
    @Caching(evict = {
            @CacheEvict(value = "questions", allEntries = true),
            @CacheEvict(value = "question",  key = "#id")
    })
    @Transactional
    public void deleteQuestion(UUID id) {
        if (!questionRepo.existsById(id)) {
            throw new ResourceNotFoundException("Question", id);
        }
        questionRepo.deleteById(id);
    }

    /**
     * Get questions asked by a specific company.
     */
    @Transactional(readOnly = true)
    public List<QuestionDTO> getByCompanySlug(String slug) {
        return questionRepo.findByCompanySlug(slug).stream()
                .map(q -> toDTO(q, slug, null))
                .toList();
    }

    // --- Mapping ---

    private QuestionDTO toDTO(Question q, String companySlug, String round) {
        List<String> tagNames = q.getTags().stream()
                .map(Tag::getName)
                .sorted()
                .toList();

        List<String> companies = occurrenceRepo.findCompanyNamesByQuestionId(q.getId());

        List<QuestionDTO.SessionInfo> sessions = occurrenceRepo
                .findSessionInfoByQuestionId(q.getId(), companySlug, round)
                .stream()
                .map(row -> new QuestionDTO.SessionInfo(
                        (String) row[0],
                        (String) row[1],
                        row[2] != null ? ((java.sql.Date) row[2]).toLocalDate() : null
                ))
                .toList();

        return new QuestionDTO(
                q.getId(),
                q.getText(),
                q.getCategory() != null ? q.getCategory().getId() : null,
                q.getCategory() != null ? q.getCategory().getName() : null,
                q.getCategory() != null ? q.getCategory().getInterviewType() : null,
                q.getOccurrenceCount() != null ? q.getOccurrenceCount() : 0,
                tagNames,
                companies,
                sessions,
                q.getRelevancyLabel(),
                q.getCreatedAt(),
                q.getUpdatedAt()
        );
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
