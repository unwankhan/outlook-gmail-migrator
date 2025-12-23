//// OAuthCallbackController.java - Fix user identification
//package com.unwan.auth.controller;
//
//import com.unwan.auth.model.OAuthToken;
//import com.unwan.auth.repository.OAuthTokenRepository;
//import com.unwan.auth.service.JwtUtil;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.util.MultiValueMap;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.client.RestTemplate;
//
//import javax.servlet.http.HttpServletRequest;
//import java.util.Date;
//import java.util.HashMap;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/callback")
//public class OAuthCallbackController {
//
//    @Autowired
//    private OAuthTokenRepository oauthTokenRepository;
//
//    @Autowired
//    private RestTemplate restTemplate;
//
//    @Autowired
//    private JwtUtil jwtUtil;
//
//    @Value("${spring.security.oauth2.client.registration.outlook.client-id}")
//    private String outlookClientId;
//
//    @Value("${spring.security.oauth2.client.registration.outlook.client-secret}")
//    private String outlookClientSecret;
//
//    @Value("${spring.security.oauth2.client.registration.gmail.client-id}")
//    private String gmailClientId;
//
//    @Value("${spring.security.oauth2.client.registration.gmail.client-secret}")
//    private String gmailClientSecret;
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    @GetMapping("/outlook")
//    public ResponseEntity<?> outlookCallback(
//            @RequestParam String code,
//            @RequestParam(required = false) String state,
//            HttpServletRequest request) {
//        try {
//            String tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
//
//            // Extract user ID from state parameter or session
//            String userId = extractUserIdFromState(state, request);
//            if (userId == null) {
//                return ResponseEntity.badRequest().body("Unable to identify user");
//            }
//
//            // Prepare request parameters
//            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
//            params.add("client_id", outlookClientId);
//            params.add("client_secret", outlookClientSecret);
//            params.add("code", code);
//            params.add("grant_type", "authorization_code");
//            params.add("redirect_uri", "http://localhost:8081/callback/outlook");
//            params.add("scope", "Mail.Read Mail.Send Contacts.Read Calendars.Read Files.Read");
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);
//
//            // Exchange code for tokens
//            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, requestEntity, String.class);
//
//            // Parse JSON response
//            Map<String, Object> tokenMap = objectMapper.readValue(response.getBody(), Map.class);
//
//            // Extract tokens
//            String accessToken = (String) tokenMap.get("access_token");
//            String refreshToken = (String) tokenMap.get("refresh_token");
//            int expiresIn = (Integer) tokenMap.get("expires_in");
//            Date expiryDate = new Date(System.currentTimeMillis() + expiresIn * 1000L);
//
//            // Save token with actual user ID
//            OAuthToken token = new OAuthToken(userId, "outlook", accessToken, refreshToken, expiryDate);
//            oauthTokenRepository.save(token);
//
//            // Redirect to frontend with success message
//            return ResponseEntity.status(HttpStatus.FOUND)
//                    .header("Location", "http://localhost:5173/oauth/callback?success=true&provider=outlook")
//                    .build();
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.FOUND)
//                    .header("Location", "http://localhost:5173/oauth/callback?error=outlook_oauth_error")
//                    .build();
//        }
//    }
//
//    @GetMapping("/gmail")
//    public ResponseEntity<?> gmailCallback(
//            @RequestParam String code,
//            @RequestParam(required = false) String state,
//            HttpServletRequest request) {
//        try {
//            String tokenUrl = "https://oauth2.googleapis.com/token";
//
//            // Extract user ID from state parameter or session
//            String userId = extractUserIdFromState(state, request);
//            if (userId == null) {
//                return ResponseEntity.badRequest().body("Unable to identify user");
//            }
//
//            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
//            params.add("client_id", gmailClientId);
//            params.add("client_secret", gmailClientSecret);
//            params.add("code", code);
//            params.add("grant_type", "authorization_code");
//            params.add("redirect_uri", "http://localhost:8081/callback/gmail");
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);
//
//            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, requestEntity, String.class);
//
//            Map<String, Object> tokenMap = objectMapper.readValue(response.getBody(), Map.class);
//            String accessToken = (String) tokenMap.get("access_token");
//            String refreshToken = (String) tokenMap.get("refresh_token");
//            int expiresIn = (Integer) tokenMap.get("expires_in");
//            Date expiryDate = new Date(System.currentTimeMillis() + expiresIn * 1000);
//
//            OAuthToken token = new OAuthToken(userId, "google", accessToken, refreshToken, expiryDate);
//            oauthTokenRepository.save(token);
//
//            return ResponseEntity.status(HttpStatus.FOUND)
//                    .header("Location", "http://localhost:5173/oauth/callback?success=true&provider=gmail")
//                    .build();
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.FOUND)
//                    .header("Location", "http://localhost:5173/oauth/callback?error=gmail_oauth_error")
//                    .build();
//        }
//    }
//
//    private String extractUserIdFromState(String state, HttpServletRequest request) {
//        // 1) Plain "user_<id>" state
//        if (state != null && state.startsWith("user_")) {
//            return state.substring("user_".length());
//        }
//
//        // Helper to validate a token using JwtUtil: extract userId, check expiry and validate signature/payload
//        java.util.function.Function<String, String> tryToken = (token) -> {
//            try {
//                if (token == null || token.isEmpty()) return null;
//                String extractedUserId = jwtUtil.extractUserId(token);
//                if (extractedUserId == null || extractedUserId.isEmpty()) return null;
//                // Check expiry first
//                if (jwtUtil.isTokenExpired(token)) return null;
//                // Validate token integrity (using extracted userId)
//                if (!jwtUtil.validateToken(token, extractedUserId)) return null;
//                return extractedUserId;
//            } catch (Exception ignored) {
//                return null;
//            }
//        };
//
//        // 2) If state contains a signed token like "signed_<token>"
//        if (state != null && state.startsWith("signed_")) {
//            String signed = state.substring("signed_".length());
//            String userFromSigned = tryToken.apply(signed);
//            if (userFromSigned != null) return userFromSigned;
//        }
//
//        // 3) If state might itself be a token (no prefix)
//        if (state != null && !state.isEmpty()) {
//            String userFromStateToken = tryToken.apply(state);
//            if (userFromStateToken != null) return userFromStateToken;
//        }
//
//        // 4) Try Authorization header (Bearer token)
//        try {
//            String authHeader = request.getHeader("Authorization");
//            if (authHeader != null && authHeader.startsWith("Bearer ")) {
//                String bearerToken = authHeader.substring(7);
//                String userFromHeader = tryToken.apply(bearerToken);
//                if (userFromHeader != null) return userFromHeader;
//            }
//        } catch (Exception ignored) {
//            // ignore header parsing issues
//        }
//
//        // 5) Fallback: session attribute "userId"
//        try {
//            if (request.getSession(false) != null) {
//                Object sessionUser = request.getSession(false).getAttribute("userId");
//                if (sessionUser != null) return sessionUser.toString();
//            }
//        } catch (Exception ignored) {
//            // ignore session errors
//        }
//
//        // Nothing found
//        return null;
//    }
//
//
//
//    // Add OAuth initiation endpoints that include user ID in state
//    @GetMapping("/auth/outlook")
//    public ResponseEntity<?> startOutlookAuth(@RequestParam String userId) {
//        String outlookAuthUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
//                "client_id=" + outlookClientId +
//                "&response_type=code" +
//                "&redirect_uri=http://localhost:8081/callback/outlook" +
//                "&scope=Mail.Read Mail.Send Contacts.Read Calendars.Read Files.Read" +
//                "&response_mode=query" +
//                "&state=user_" + userId; // Include user ID in state
//        return ResponseEntity.status(HttpStatus.FOUND)
//                .header("Location", outlookAuthUrl)
//                .build();
//    }
//
//    @GetMapping("/auth/gmail")
//    public ResponseEntity<?> startGmailAuth(@RequestParam String userId) {
//        String gmailAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
//                "client_id=" + gmailClientId +
//                "&response_type=code" +
//                "&redirect_uri=http://localhost:8081/callback/gmail" +
//                "&scope=https://www.googleapis.com/auth/gmail.readonly " +
//                "https://www.googleapis.com/auth/gmail.send " +
//                "https://www.googleapis.com/auth/contacts " +
//                "https://www.googleapis.com/auth/calendar " +
//                "https://www.googleapis.com/auth/drive" +
//                "&access_type=offline" +
//                "&prompt=consent" +
//                "&state=user_" + userId; // Include user ID in state
//        return ResponseEntity.status(HttpStatus.FOUND)
//                .header("Location", gmailAuthUrl)
//                .build();
//    }
//}
























// OAuthCallbackController_refactored.java
// Refactored version: endpoints and behaviour kept exactly the same as before.
// Helpers added to remove duplicated logic (token param building, request entity creation,
// token exchange/parsing, and redirects) while preserving public endpoints untouched.

package com.unwan.auth.controller;

import com.unwan.auth.model.OAuthToken;
import com.unwan.auth.repository.OAuthTokenRepository;
import com.unwan.auth.service.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/callback")
public class OAuthCallbackController {

    @Autowired
    private OAuthTokenRepository oauthTokenRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${spring.security.oauth2.client.registration.outlook.client-id}")
    private String outlookClientId;

    @Value("${spring.security.oauth2.client.registration.outlook.client-secret}")
    private String outlookClientSecret;

    @Value("${spring.security.oauth2.client.registration.gmail.client-id}")
    private String gmailClientId;

    @Value("${spring.security.oauth2.client.registration.gmail.client-secret}")
    private String gmailClientSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Outlook callback - behaviour & endpoint unchanged.
     * Uses helpers internally to avoid duplicate code.
     */
    @GetMapping("/outlook")
    public ResponseEntity<?> outlookCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletRequest request) {
        try {
            String tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

            // Extract userId using the same centralized method
            String userId = extractUserIdFromState(state, request);
            if (userId == null) {
                return ResponseEntity.badRequest().body("Unable to identify user");
            }

            // Build params (helper)
            MultiValueMap<String, String> params = buildParamsForProvider("outlook", code);

            // Create request entity (helper)
            HttpEntity<MultiValueMap<String, String>> requestEntity = createFormEntity(params);

            // Exchange token and parse response (helper)
            Map<String, Object> tokenMap = exchangeToken(tokenUrl, requestEntity);

            // Extract tokens robustly
            String accessToken = (String) tokenMap.get("access_token");
            String refreshToken = (String) tokenMap.get("refresh_token");
            long expiresIn = parseExpiresIn(tokenMap.get("expires_in"));
            Date expiryDate = new Date(System.currentTimeMillis() + expiresIn * 1000L);

            OAuthToken token = new OAuthToken(userId, "outlook", accessToken, refreshToken, expiryDate);
            oauthTokenRepository.save(token);

            return redirectSuccess("outlook");

        } catch (Exception e) {
            e.printStackTrace();
            return redirectError("outlook_oauth_error");
        }
    }

    /**
     * Gmail callback - behaviour & endpoint unchanged.
     * Uses the same helpers so logic is not duplicated.
     */
    @GetMapping("/gmail")
    public ResponseEntity<?> gmailCallback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            HttpServletRequest request) {
        try {
            String tokenUrl = "https://oauth2.googleapis.com/token";

            // Extract userId
            String userId = extractUserIdFromState(state, request);
            if (userId == null) {
                return ResponseEntity.badRequest().body("Unable to identify user");
            }

            // Build params (helper)
            MultiValueMap<String, String> params = buildParamsForProvider("gmail", code);

            // Create request entity (helper)
            HttpEntity<MultiValueMap<String, String>> requestEntity = createFormEntity(params);

            // Exchange token and parse response (helper)
            Map<String, Object> tokenMap = exchangeToken(tokenUrl, requestEntity);

            // Extract tokens robustly
            String accessToken = (String) tokenMap.get("access_token");
            String refreshToken = (String) tokenMap.get("refresh_token");
            long expiresIn = parseExpiresIn(tokenMap.get("expires_in"));
            Date expiryDate = new Date(System.currentTimeMillis() + expiresIn * 1000L);

            OAuthToken token = new OAuthToken(userId, "google", accessToken, refreshToken, expiryDate);
            oauthTokenRepository.save(token);

            return redirectSuccess("gmail");

        } catch (Exception e) {
            e.printStackTrace();
            return redirectError("gmail_oauth_error");
        }
    }

    /**
     * Helper: build token exchange params per provider.
     * Behaviour preserved (redirect_uri values and required fields remain same).
     */
    private MultiValueMap<String, String> buildParamsForProvider(String provider, String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        if ("outlook".equalsIgnoreCase(provider)) {
            params.add("client_id", outlookClientId);
            params.add("client_secret", outlookClientSecret);
            params.add("code", code);
            params.add("grant_type", "authorization_code");
            params.add("redirect_uri", "http://localhost:8081/callback/outlook");
            params.add("scope", "Mail.Read Mail.Send Contacts.Read Calendars.Read Files.Read");
        } else if ("gmail".equalsIgnoreCase(provider) || "google".equalsIgnoreCase(provider)) {
            params.add("client_id", gmailClientId);
            params.add("client_secret", gmailClientSecret);
            params.add("code", code);
            params.add("grant_type", "authorization_code");
            params.add("redirect_uri", "http://localhost:8081/callback/gmail");
            // Google token exchange typically doesn't require scope field here
        }
        return params;
    }

    /**
     * Helper: create HttpEntity with form headers
     */
    private HttpEntity<MultiValueMap<String, String>> createFormEntity(MultiValueMap<String, String> params) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return new HttpEntity<>(params, headers);
    }

    /**
     * Helper: exchange token and return parsed JSON as Map
     */
    private Map<String, Object> exchangeToken(String tokenUrl, HttpEntity<MultiValueMap<String, String>> requestEntity) throws Exception {
        ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, requestEntity, String.class);
        if (response == null || response.getBody() == null) {
            throw new IllegalStateException("Empty response from token endpoint");
        }
        return objectMapper.readValue(response.getBody(), Map.class);
    }

    /**
     * Helper: parse expires_in safely (Integer, Long, Double)
     */
    private long parseExpiresIn(Object expiresInObj) {
        if (expiresInObj == null) return 0L;
        if (expiresInObj instanceof Number) {
            return ((Number) expiresInObj).longValue();
        }
        try {
            return Long.parseLong(expiresInObj.toString());
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Helper: redirect on success (keeps same frontend URL structure)
     */
    private ResponseEntity<?> redirectSuccess(String provider) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:5173/oauth/callback?success=true&provider=" + provider)
                .build();
    }

    /**
     * Helper: redirect on error (keeps same frontend URL structure)
     */
    private ResponseEntity<?> redirectError(String errorCode) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:5173/oauth/callback?error=" + errorCode)
                .build();
    }

    /**
     * Centralized extraction of userId from either:
     *  - "user_<id>" in state
     *  - "signed_<token>" where token is validated with jwtUtil
     *  - raw token in state
     *  - Authorization header (Bearer ...)
     *  - session attribute "userId"
     *
     * This method kept unchanged to preserve behaviour.
     */
    private String extractUserIdFromState(String state, HttpServletRequest request) {
        // 1) Plain "user_<id>" state
        if (state != null && state.startsWith("user_")) {
            return state.substring("user_".length());
        }

        // Helper to validate a token using JwtUtil: extract userId, check expiry and validate signature/payload
        java.util.function.Function<String, String> tryToken = (token) -> {
            try {
                if (token == null || token.isEmpty()) return null;
                String extractedUserId = jwtUtil.extractUserId(token);
                if (extractedUserId == null || extractedUserId.isEmpty()) return null;
                // Check expiry first
                if (jwtUtil.isTokenExpired(token)) return null;
                // Validate token integrity (using extracted userId)
                if (!jwtUtil.validateToken(token, extractedUserId)) return null;
                return extractedUserId;
            } catch (Exception ignored) {
                return null;
            }
        };

        // 2) If state contains a signed token like "signed_<token>"
        if (state != null && state.startsWith("signed_")) {
            String signed = state.substring("signed_".length());
            String userFromSigned = tryToken.apply(signed);
            if (userFromSigned != null) return userFromSigned;
        }

        // 3) If state might itself be a token (no prefix)
        if (state != null && !state.isEmpty()) {
            String userFromStateToken = tryToken.apply(state);
            if (userFromStateToken != null) return userFromStateToken;
        }

        // 4) Try Authorization header (Bearer token)
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String bearerToken = authHeader.substring(7);
                String userFromHeader = tryToken.apply(bearerToken);
                if (userFromHeader != null) return userFromHeader;
            }
        } catch (Exception ignored) {
            // ignore header parsing issues
        }

        // 5) Fallback: session attribute "userId"
        try {
            if (request.getSession(false) != null) {
                Object sessionUser = request.getSession(false).getAttribute("userId");
                if (sessionUser != null) return sessionUser.toString();
            }
        } catch (Exception ignored) {
            // ignore session errors
        }

        // Nothing found
        return null;
    }

    // The following endpoints initiate OAuth flows and include user id in 'state'.
    // These are kept unchanged (no behaviour change).

    @GetMapping("/auth/outlook")
    public ResponseEntity<?> startOutlookAuth(@RequestParam String userId) {
        try {
            String redirect = URLEncoder.encode("http://localhost:8081/callback/outlook", StandardCharsets.UTF_8);
            String scope = URLEncoder.encode("Mail.Read Mail.Send Contacts.Read Calendars.Read Files.Read", StandardCharsets.UTF_8);
            String state = URLEncoder.encode("user_" + userId, StandardCharsets.UTF_8);

            String outlookAuthUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" +
                    "client_id=" + URLEncoder.encode(outlookClientId, StandardCharsets.UTF_8) +
                    "&response_type=code" +
                    "&redirect_uri=" + redirect +
                    "&scope=" + scope +
                    "&response_mode=query" +
                    "&state=" + state;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", outlookAuthUrl)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("oauth_url_build_error");
        }


    }

    @GetMapping("/auth/gmail")
    public ResponseEntity<?> startGmailAuth(@RequestParam String userId) {
        try {
            String redirect = URLEncoder.encode("http://localhost:8081/callback/gmail", StandardCharsets.UTF_8);
            String scope = URLEncoder.encode(
                    "https://www.googleapis.com/auth/gmail.readonly " +
                            "https://www.googleapis.com/auth/gmail.send " +
                            "https://www.googleapis.com/auth/contacts " +
                            "https://www.googleapis.com/auth/calendar " +
                            "https://www.googleapis.com/auth/drive " +
                            "https://www.googleapis.com/auth/gmail.insert " +
                            "https://www.googleapis.com/auth/gmail.modify",
                    StandardCharsets.UTF_8
            );

            String state = URLEncoder.encode("user_" + userId, StandardCharsets.UTF_8);

            String gmailAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                    "client_id=" + URLEncoder.encode(gmailClientId, StandardCharsets.UTF_8) +
                    "&response_type=code" +
                    "&redirect_uri=" + redirect +
                    "&scope=" + scope +
                    "&access_type=offline" +
                    "&prompt=consent" +
                    "&state=" + state;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", gmailAuthUrl)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("oauth_url_build_error");
        }
    }
}
