package com.unwan.auth.repository;

import com.unwan.auth.model.OAuthToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface OAuthTokenRepository extends MongoRepository<OAuthToken, String> {
    Optional<OAuthToken> findByUserIdAndProvider(String userId, String provider);  // ✅ CHANGED
    List<OAuthToken> findByUserId(String userId);  // ✅ NEW: Get all tokens for user
    void deleteByUserIdAndProvider(String userId, String provider);  // ✅ CHANGED
    List<OAuthToken> findByUserIdAndIsConnectedTrue(String userId);  // ✅ NEW: Get connected tokens
}