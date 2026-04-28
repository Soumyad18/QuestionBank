package com.qb.core.service;

import com.qb.auth.model.UserProfile;
import com.qb.auth.repository.UserProfileRepository;
import com.qb.core.dto.UserProfileDTO;
import com.qb.core.entity.InterviewSession;
import com.qb.core.exception.ResourceNotFoundException;
import com.qb.core.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserProfileRepository userProfileRepo;
    private final SessionRepository     sessionRepo;

    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllUsers() {
        return userProfileRepo.findAll().stream()
                .map(this::toDTO)
                .sorted((a, b) -> a.createdAt().compareTo(b.createdAt()) * -1)
                .toList();
    }

    @Caching(evict = {
            @CacheEvict(value = "admin-dashboard", allEntries = true)
    })
    @Transactional
    public UserProfileDTO toggleAdmin(UUID userId) {
        UserProfile user = userProfileRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setAdmin(!user.isAdmin());
        return toDTO(userProfileRepo.save(user));
    }

    @Caching(evict = {
            @CacheEvict(value = "sessions",        allEntries = true),
            @CacheEvict(value = "admin-dashboard", allEntries = true)
    })
    @Transactional
    public void linkCandidate(UUID sessionId, UUID candidateId) {
        InterviewSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session", sessionId));

        // Validate candidate exists
        if (candidateId != null) {
            userProfileRepo.findById(candidateId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", candidateId));
        }

        session.setCandidateId(candidateId);
        sessionRepo.save(session);
    }

    private UserProfileDTO toDTO(UserProfile u) {
        long sessionCount = userProfileRepo.countSessionsByUserId(u.getId());
        return new UserProfileDTO(
                u.getId(), u.getName(), u.getEmail(),
                u.getPhone(), u.isAdmin(), sessionCount, u.getCreatedAt()
        );
    }
}
