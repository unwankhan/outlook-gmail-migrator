package com.unwan.gateway.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class JobStatus {
    // Getters and Setters
    private String jobId;
    private String status;
    private int progress;
    private String message;
    private String userEmail;
    private String migrationType;
    // ✅ ADDED
    private int totalItems;        // ✅ ADDED
    // ✅ ADDED
    private int processedItems;    // ✅ ADDED
    private String startedAt;
    private String updatedAt;

    public JobStatus() {}

}