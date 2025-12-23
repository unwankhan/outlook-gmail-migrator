package com.unwan.gateway.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class MigrationResponse {
    // Getters and Setters
    private String status;
    private String message;
    private String jobId;

    public MigrationResponse() {}

}