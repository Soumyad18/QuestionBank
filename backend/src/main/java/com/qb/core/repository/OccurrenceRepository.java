package com.qb.core.repository;

import com.qb.core.entity.QuestionOccurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

public interface OccurrenceRepository extends JpaRepository<QuestionOccurrence, UUID> {

    List<QuestionOccurrence> findByQuestionId(UUID questionId);

    List<QuestionOccurrence> findBySessionId(UUID sessionId);

    /**
     * Find all companies where a specific question was asked.
     */
    @Query("""
            SELECT DISTINCT c.name FROM QuestionOccurrence qo
            JOIN qo.session s
            JOIN s.company c
            WHERE qo.question.id = :questionId
            """)
    List<String> findCompanyNamesByQuestionId(@Param("questionId") UUID questionId);

    /**
     * Find session info (company, round, date) for a question — filtered by optional companySlug and round.
     */
    @Query(value = """
            SELECT DISTINCT c.name, s.round, s.interview_date
            FROM question_occurrences qo
            JOIN interview_sessions s ON s.id = qo.session_id
            JOIN companies c ON c.id = s.company_id
            WHERE qo.question_id = :questionId
              AND (CAST(:companySlug AS TEXT) IS NULL OR c.slug = CAST(:companySlug AS TEXT))
              AND (CAST(:round AS TEXT) IS NULL OR LOWER(s.round) = LOWER(CAST(:round AS TEXT)))
            ORDER BY s.interview_date DESC
            """, nativeQuery = true)
    List<Object[]> findSessionInfoByQuestionId(
            @Param("questionId") UUID questionId,
            @Param("companySlug") String companySlug,
            @Param("round") String round
    );
}
