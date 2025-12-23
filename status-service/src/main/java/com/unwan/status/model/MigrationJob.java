package com.unwan.status.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
@Data
@Document(collection = "migration_jobs")
public class MigrationJob {
    @Id
    private String id;

    private String jobId;
    private String userId;  // ✅ SECURITY: User ownership
    private String userEmail;
    private String migrationType;
    private String status;
    private int progress;
    private String message;
    private int totalItems;
    private int processedItems;
    private String resumeToken;
    private Date startedAt;
    private Date updatedAt;
    private Date completedAt;

    // Constructors
    public MigrationJob() {}


    public MigrationJob(String jobId, String userId, String userEmail, String migrationType) {
        this.jobId = jobId;
        this.userId = userId;  // ✅ SECURITY: Store user ID
        this.userEmail = userEmail;
        this.migrationType = migrationType;
        this.status = "pending";
        this.progress = 0;
        this.totalItems = 0;
        this.processedItems = 0;
        this.startedAt = new Date();
        this.updatedAt = new Date();
    }


    // MigrationJob.java me setProcessedItems() method update karo:
    public void setProcessedItems(int processedItems) {
        this.processedItems = processedItems;
        calculateProgress(); // ✅ Auto call
        this.updatedAt = new Date();
    }
    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
        calculateProgress(); // ✅ Auto call
    }
    public void calculateProgress() {
        if (totalItems > 0) {
            this.progress = (int) ((double) processedItems / totalItems * 100);
        } else {
            this.progress = 0;
        }
    }

    // Add this method if not present
    public void updateProgress() {
        calculateProgress();
        this.updatedAt = new Date();
    }
}