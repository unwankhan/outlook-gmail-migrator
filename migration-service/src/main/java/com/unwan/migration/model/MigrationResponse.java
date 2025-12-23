package com.unwan.migration.model;

import lombok.Getter;
import lombok.Setter;


public class MigrationResponse {
    // Getters and Setters
    private String status; // "success", "failed", "in_progress"
    private String message;
    private String jobId;

    // Constructors
    public MigrationResponse() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public MigrationResponse(String status, String message, String jobId) {
        this.status = status;
        this.message = message;
        this.jobId = jobId;
    }

    @Override
    public String toString(){
        return "MigrationResponse Data "+"status: " + status + ", message: " + message + ", jobId: " + jobId;
    }

}