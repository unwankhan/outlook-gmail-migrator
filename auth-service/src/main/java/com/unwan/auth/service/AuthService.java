package com.unwan.auth.service;

import com.unwan.auth.model.AuthResponse;
import com.unwan.auth.model.User;
import com.unwan.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(User user) {
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return new AuthResponse(false, "User already exists", null, null, null);
        }


        // Encrypt password and save user
        //user.setPassword(passwordEncoder.encode(user.getPassword()));
        User newUser = new User(user.getEmail(), passwordEncoder.encode(user.getPassword()), user.getName());
        System.out.println("dekhe hota hai ya nhi"+"\n"+newUser);
        User savedUser = userRepository.save(newUser);

        // Generate JWT token
        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getUserId());
        System.out.println("Name "+savedUser.getName());
        return new AuthResponse(true, "User registered successfully", token, newUser.getUserId(), newUser.getName());
    }

    public AuthResponse login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            // Update last login
            User existingUser = user.get();
            existingUser.setLastLogin(LocalDateTime.now());
            userRepository.save(existingUser);

            // Generate JWT token
            String token = jwtUtil.generateToken(email, existingUser.getUserId());

            return new AuthResponse(true, "Login successful", token, existingUser.getUserId(), existingUser.getName());
        }

        return new AuthResponse(false, "Invalid credentials", null, null, null);
    }

    public boolean validateToken(String token, String userId) {
        return jwtUtil.validateToken(token, userId) && !jwtUtil.isTokenExpired(token);
    }
}