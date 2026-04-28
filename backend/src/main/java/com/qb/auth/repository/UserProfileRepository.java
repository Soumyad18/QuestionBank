package com.qb.auth.repository;

import com.qb.auth.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    @Query("SELECT COUNT(s) FROM InterviewSession s WHERE s.candidateId = :userId")
    long countSessionsByUserId(@Param("userId") UUID userId);
}
