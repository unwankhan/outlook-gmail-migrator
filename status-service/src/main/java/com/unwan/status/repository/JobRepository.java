package com.unwan.status.repository;

import com.unwan.status.model.MigrationJob;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends MongoRepository<MigrationJob, String> {
    Optional<MigrationJob> findByJobId(String jobId);
    List<MigrationJob> findByUserId(String userId);  // ✅ SECURITY: User-specific
    List<MigrationJob> findByUserIdOrderByStartedAtDesc(String userId);  // ✅ SECURITY: User-specific
    List<MigrationJob> findByUserEmail(String userEmail);

}