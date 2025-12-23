package com.unwan.status.model;

import lombok.Data;

@Data
public class JobStatus {
    private String jobId;
    private String status;
    private int progress;
    private String message;
    private String userEmail;
    private String migrationType;
    private int totalItems = 0;
    private int processedItems =0 ;
    private String startedAt;
    private String updatedAt;
    private String userId;
 // ✅ NEW
    // Default Constructor
    public JobStatus() {}

    // Constructor from MigrationJob entity
    public JobStatus(MigrationJob job) {
        this.jobId = job.getJobId();
        this.status = job.getStatus();
        this.progress = job.getProgress();
        this.message = job.getMessage();
        this.userEmail = job.getUserEmail();
        this.migrationType = job.getMigrationType();
        this.totalItems = job.getTotalItems();
        this.processedItems = job.getProcessedItems();
        this.startedAt = job.getStartedAt() != null ? job.getStartedAt().toString() : "";
        this.updatedAt = job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : "";
        this.userId = job.getUserId();
    }


    // toString method for debugging
    @Override
    public String toString() {
        return "JobStatus{" +
                "jobId='" + jobId + '\'' +
                ", status='" + status + '\'' +
                ", progress=" + progress +
                ", message='" + message + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", migrationType='" + migrationType + '\'' +
                ", totalItems=" + totalItems +
                ", processedItems=" + processedItems +
                ", startedAt='" + startedAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                '}';
    }
}