package com.unwan.auth.controller;

import com.unwan.auth.model.OAuthToken;
import com.unwan.auth.repository.OAuthTokenRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    @Autowired
    private OAuthTokenRepository oauthTokenRepository;

    @PostMapping("/outlook/token")
    public ResponseEntity<?> saveOutlookToken(@RequestBody OutlookTokenRequest request) {
        //System.out.println(request+" tokennnnnn");
        OAuthToken token = new OAuthToken(
                request.getUserId(),
                "outlook",
                request.getAccessToken(),
                request.getRefreshToken(),
                new Date(System.currentTimeMillis() + 3600 * 1000)
        );

        oauthTokenRepository.save(token);
        return ResponseEntity.ok("Outlook token saved successfully");
    }

    @PostMapping("/gmail/token")
    public ResponseEntity<?> saveGmailToken(@RequestBody GmailTokenRequest request) {
        //System.out.println(request+" tokennnnnn");
        OAuthToken token = new OAuthToken(
                request.getUserId(),
                "google",
                request.getAccessToken(),
                request.getRefreshToken(),
                new Date(System.currentTimeMillis() + 3600 * 1000)
        );

        oauthTokenRepository.save(token);
        return ResponseEntity.ok("Gmail token saved successfully");
    }

    @GetMapping("/tokens/{userId}")
    public ResponseEntity<?> getUserTokens(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();

        oauthTokenRepository.findByUserIdAndProvider(userId, "outlook")
                .ifPresent(token -> response.put("outlook", token));

        oauthTokenRepository.findByUserIdAndProvider(userId, "google")
                .ifPresent(token -> response.put("gmail", token));

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tokens/{userId}")
    public ResponseEntity<?> deleteUserTokens(@PathVariable String userId) {
        oauthTokenRepository.deleteByUserIdAndProvider(userId, "outlook");
        oauthTokenRepository.deleteByUserIdAndProvider(userId, "google");
        return ResponseEntity.ok("Tokens deleted successfully");
    }

    @Setter
    @Getter
    private static
    class OutlookTokenRequest {
        private String userId;
        private String accessToken;
        private String refreshToken;


    }
    @Setter
    @Getter
    private static
    class GmailTokenRequest {
        private String userId;
        private String accessToken;
        private String refreshToken;


    }
}





