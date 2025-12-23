package com.unwan.auth.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Date;


@Setter
@Getter
@Document(collection = "users")
public class User {
    // Getters and Setters
    @Id
    private String id;
    // ✅ ADDED
    private String userId;  // ✅ ADDED: Unique user identifier
    private String name;
    private String email;
    private String password;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;


    public User() {
        this.createdAt = LocalDateTime.now();
        this.userId = "user-" + System.currentTimeMillis(); // Auto-generate user ID
    }

    public User(String email, String password, String name) {
        this();
        this.email = email;
        this.password = password;
        this.name = name;
    }

    @Override
    public String toString() {
        return "id=" + id + ", userId=" + userId + ", name=" + name + ", email=" + email
                + ", createdAt=" + createdAt + ", lastLogin=" + lastLogin;
    }
}