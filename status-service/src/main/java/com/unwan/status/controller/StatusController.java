package com.unwan.status.controller;

import com.unwan.status.model.JobStatus;
import com.unwan.status.model.MigrationJob;
import com.unwan.status.service.StatusService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.unwan.status.config.RestTemplateConfig;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/status")
public class StatusController {

    @Autowired
    private StatusService statusService;

    @Autowired
    private RestTemplate restTemplate; // ✅ Added

    @PostMapping("/job")
    public ResponseEntity<JobStatus> createJob(@RequestBody CreateJobRequest request) {
        // ✅ UPDATED: Now passing userId to constructor
        MigrationJob job = statusService.createJob(
                request.getJobId(),
                request.getUserId(),     // ✅ Added
                request.getUserEmail(),
                request.getMigrationType()
        );

        return ResponseEntity.ok(new JobStatus(job));
    }


    @PutMapping("/job/{jobId}")
    public ResponseEntity<JobStatus> updateJob(
            @PathVariable String jobId,
            @RequestBody UpdateJobRequest request) {

        MigrationJob job = statusService.updateJob(
                jobId,
                request.getStatus(),
                request.getProgress(),
                request.getMessage()
        );

        if (job != null) {
            return ResponseEntity.ok(new JobStatus(job));
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // ✅ NEW: Update job with items count
    @PutMapping("/job/{jobId}/items")
    public ResponseEntity<JobStatus> updateJobWithItems(
            @PathVariable String jobId,
            @RequestBody UpdateJobItemsRequest request) {

        MigrationJob job = statusService.updateJobWithItems(
                jobId,
                request.getStatus(),
                request.getProgress(),
                request.getMessage(),
                request.getTotalItems(),
                request.getProcessedItems()
        );

        if (job != null) {
            return ResponseEntity.ok(new JobStatus(job));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ NEW: Pause job
    @PostMapping("/job/{jobId}/pause")
    public ResponseEntity<JobStatus> pauseJob(@PathVariable String jobId) {
        MigrationJob job = statusService.pauseJob(jobId);

        if (job != null) {
            return ResponseEntity.ok(new JobStatus(job));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ NEW: Resume job
    @PostMapping("/job/{jobId}/resume")
    public ResponseEntity<JobStatus> resumeJob(@PathVariable String jobId) {
        MigrationJob job = statusService.resumeJob(jobId);

        if (job != null) {
            return ResponseEntity.ok(new JobStatus(job));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ NEW: Cancel job
    @PostMapping("/job/{jobId}/cancel")
    public ResponseEntity<JobStatus> cancelJob(@PathVariable String jobId) {
        MigrationJob job = statusService.cancelJob(jobId);

        if (job != null) {
            return ResponseEntity.ok(new JobStatus(job));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE GET USER JOBS ENDPOINT:
    @GetMapping("/user/jobs/{userId}")
    public ResponseEntity<List<JobStatus>> getUserJobs(@PathVariable String userId) {
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).build();
        }
        List<JobStatus> jobs = statusService.getUserJobs(userId);
        return ResponseEntity.ok(jobs);
    }

    // UPDATE GET JOB STATUS ENDPOINT:
    @GetMapping("/job/{jobId}")
    public ResponseEntity<JobStatus> getJobStatus(
            @PathVariable String jobId,
            @RequestHeader("X-User-Id") String userId) {

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        JobStatus jobStatus = statusService.getJobStatus(jobId, userId);

        if (jobStatus != null) {
            return ResponseEntity.ok(jobStatus);
        } else {
            return ResponseEntity.status(403).build();
        }
    }
}

// Request DTOs
@Setter
@Getter
class CreateJobRequest {
    private String jobId;
    // ✅ ADDED
    private String userId;      // ✅ ADDED
    private String userEmail;
    private String migrationType;

}

@Setter
@Getter
class UpdateJobRequest {
    private String status;
    private int progress;
    private String message;

}

// ✅ NEW: Update job with items request
@Setter
@Getter
class UpdateJobItemsRequest {
    private String status;
    private int progress;
    private String message;
    private int totalItems;
    private int processedItems;

}