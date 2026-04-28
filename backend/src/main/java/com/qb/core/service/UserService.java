package com.qb.core.service;

import com.qb.auth.model.UserProfile;
import com.qb.auth.repository.UserProfileRepository;
import com.qb.core.dto.UserDashboardStatsDTO;
import com.qb.core.dto.UserProfileDTO;
import com.qb.core.dto.UserSessionDetailsDTO;
import com.qb.core.entity.InterviewSession;
import com.qb.core.entity.QuestionOccurrence;
import com.qb.core.entity.Tag;
import com.qb.core.exception.ResourceNotFoundException;
import com.qb.core.repository.OccurrenceRepository;
import com.qb.core.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserProfileRepository userProfileRepo;
    private final SessionRepository     sessionRepo;
    private final OccurrenceRepository  occurrenceRepo;

    @Transactional(readOnly = true)
    public UserProfileDTO getProfile(UUID userId) {
        UserProfile user = userProfileRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        long sessionCount = userProfileRepo.countSessionsByUserId(userId);
        return new UserProfileDTO(
                user.getId(), user.getName(), user.getEmail(),
                user.getPhone(), user.isAdmin(), sessionCount, user.getCreatedAt()
        );
    }

    @Transactional
    public UserProfileDTO updateProfile(UUID userId, String name, String phone) {
        UserProfile user = userProfileRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (name != null && !name.isBlank()) user.setName(name.trim());
        if (phone != null) user.setPhone(phone.trim().isEmpty() ? null : phone.trim());
        userProfileRepo.save(user);
        long sessionCount = userProfileRepo.countSessionsByUserId(userId);
        return new UserProfileDTO(
                user.getId(), user.getName(), user.getEmail(),
                user.getPhone(), user.isAdmin(), sessionCount, user.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public UserDashboardStatsDTO getDashboardStats(UUID userId) {
        long totalSessions   = sessionRepo.findByCandidateId(userId).size();
        long totalCompanies  = sessionRepo.countDistinctCompaniesByCandidateId(userId);
        var  lastDate        = sessionRepo.findLatestInterviewDateByCandidateId(userId).orElse(null);
        return new UserDashboardStatsDTO(totalSessions, totalCompanies, lastDate);
    }

    @Transactional(readOnly = true)
    public List<UserSessionDetailsDTO> getMySessions(UUID userId) {
        List<InterviewSession> sessions = sessionRepo.findByCandidateId(userId);

        return sessions.stream().map(s -> {
            List<QuestionOccurrence> occurrences = occurrenceRepo.findBySessionId(s.getId());

            List<UserSessionDetailsDTO.QuestionSummary> questions = occurrences.stream()
                    .map(occ -> {
                        var q = occ.getQuestion();
                        List<String> tags = q.getTags().stream()
                                .map(Tag::getName).sorted().toList();
                        return new UserSessionDetailsDTO.QuestionSummary(
                                q.getId(),
                                q.getText(),
                                q.getCategory() != null ? q.getCategory().getName() : "General",
                                q.getRelevancyLabel(),
                                tags
                        );
                    })
                    .toList();

            return new UserSessionDetailsDTO(
                    s.getId(),
                    s.getCompany().getName(),
                    s.getCompany().getSlug(),
                    s.getRound(),
                    s.getInterviewDate(),
                    s.getInterviewerName(),
                    questions
            );
        }).toList();
    }
}
