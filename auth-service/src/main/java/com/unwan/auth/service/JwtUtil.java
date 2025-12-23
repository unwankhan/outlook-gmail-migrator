package com.unwan.auth.service;

import org.springframework.stereotype.Component;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String SECRET = "unwan-migrator-2024-secure-key-256-bits-length";
    private final long EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

    public String generateToken(String email, String userId) {
        try {
            Map<String, String> tokenData = new HashMap<>();
            tokenData.put("userId", userId);
            tokenData.put("email", email);
            tokenData.put("issuedAt", String.valueOf(System.currentTimeMillis()));
            tokenData.put("expiresAt", String.valueOf(System.currentTimeMillis() + EXPIRATION_TIME));

            String jsonData = "{\"userId\":\"" + userId + "\",\"email\":\"" + email +
                    "\",\"iat\":" + System.currentTimeMillis() +
                    ",\"exp\":" + (System.currentTimeMillis() + EXPIRATION_TIME) + "}";

            return Base64.getEncoder().encodeToString(jsonData.getBytes()) +
                    "." + Base64.getEncoder().encodeToString(SECRET.getBytes());
        } catch (Exception e) {
            return "secure-token-" + userId + "-" + System.currentTimeMillis();
        }
    }

    public boolean validateToken(String token, String userId) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return false;

            String payload = new String(Base64.getDecoder().decode(parts[0]));
            return payload.contains("\"userId\":\"" + userId + "\"");
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUserId(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return null;

            String payload = new String(Base64.getDecoder().decode(parts[0]));

            // Simple JSON parsing for userId
            if (payload.contains("\"userId\":\"")) {
                String[] userIdParts = payload.split("\"userId\":\"")[1].split("\"");
                return userIdParts[0];
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public String extractEmail(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return null;

            String payload = new String(Base64.getDecoder().decode(parts[0]));

            if (payload.contains("\"email\":\"")) {
                String[] emailParts = payload.split("\"email\":\"")[1].split("\"");
                return emailParts[0];
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 2) return true;

            String payload = new String(Base64.getDecoder().decode(parts[0]));

            if (payload.contains("\"exp\":")) {
                String[] expParts = payload.split("\"exp\":")[1].split("[,\\}]");
                long expiryTime = Long.parseLong(expParts[0]);
                return System.currentTimeMillis() > expiryTime;
            }
            return true;
        } catch (Exception e) {
            return true;
        }
    }
}