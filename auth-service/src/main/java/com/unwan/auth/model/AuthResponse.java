package com.unwan.auth.model;


import lombok.Getter;
import lombok.Setter;

// ✅ REMOVE @Service annotation - This is a DTO, not a Service
@Setter
@Getter
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private String userId;

    public AuthResponse(){}

    private String name;

    public AuthResponse(boolean success, String message, String token, String userId , String name) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.name = name;
    }
}