package com.unwan.auth.controller;

import com.unwan.auth.model.AuthRequest;
import com.unwan.auth.model.User;
import com.unwan.auth.repository.UserRepository;
import com.unwan.auth.service.AuthService;
import com.unwan.auth.model.AuthResponse;
import com.unwan.auth.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        AuthResponse response = authService.register(user);
        System.out.println("Controller Name "+response.getName());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest.getEmail(), loginRequest.getPassword());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null || token.isEmpty()) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Token is required"));
            }

            String userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);

            if (userId == null || email == null) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Invalid token format"));
            }

            boolean isValid = jwtUtil.validateToken(token, userId) && !jwtUtil.isTokenExpired(token);

            Map<String, Object> response = new HashMap<>();
            response.put("valid", isValid);
            response.put("userId", userId);
            response.put("email", email);

            if (!isValid) {
                response.put("message", "Token is invalid or expired");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Token validation error: " + e.getMessage()));
        }
    }

    @PostMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Missing or invalid authorization header");
            }

            String token = authHeader.substring(7);
            String userId = jwtUtil.extractUserId(token);
            String email = jwtUtil.extractEmail(token);

            if (userId == null) {
                return ResponseEntity.badRequest().body("Invalid token");
            }

            Optional<User> user = userRepository.findByUserId(userId);
            if (user.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("userId", userId);
                response.put("email", email);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body("User not found");
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting current user: " + e.getMessage());
        }
    }

}

