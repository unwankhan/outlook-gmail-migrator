package com.unwan.auth.model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;


@Setter
@Getter
@Document(collection = "oauth_tokens")
public class OAuthToken {
    // Getters and Setters
    @Id
    private String id;
    // ✅ CHANGED
    private String userId;          // ✅ CHANGED: Now uses userId instead of userEmail
    private String provider;
    private String accessToken;
    private String refreshToken;
    private Date expiryDate;
    private Date createdAt;
    private boolean isConnected;


    public OAuthToken() {}

    public OAuthToken(String userId, String provider, String accessToken, String refreshToken, Date expiryDate) {
        this.userId = userId;
        this.provider = provider;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiryDate = expiryDate;
        this.createdAt = new Date();
        this.isConnected = true;
    }
}