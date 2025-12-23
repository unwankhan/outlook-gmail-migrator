//package com.unwan.status.service;
//
//import com.unwan.status.controller.WebSocketController;
//import com.unwan.status.model.JobStatus;
//import com.unwan.status.model.MigrationJob;
//import com.unwan.status.repository.JobRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.Date;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//public class StatusService {
//
//    @Autowired
//    private JobRepository repository;
//
//    @Autowired
//    private WebSocketController webSocketController;  // ✅ ADDED
//
//    public MigrationJob createJob(String jobId, String userId, String userEmail, String migrationType) {
//        MigrationJob job = new MigrationJob(jobId, userId, userEmail, migrationType);
//        MigrationJob saved = repository.save(job);
//        webSocketController.sendProgressUpdate(userId, new JobStatus(saved));  // ✅ WS
//        return saved;
//    }
//
//    public MigrationJob updateJob(String jobId, String status, int progress, String message) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job == null) return null;
//
//        job.setStatus(status);
//        job.setProgress(progress);
//        job.setMessage(message);
//        job.setUpdatedAt(new Date());
//        job.updateProgress();
//        MigrationJob saved = repository.save(job);
//        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));  // ✅ WS
//        return saved;
//    }
//
//    // ✅ UPDATED: WS broadcast
//    public MigrationJob updateJobWithItems(String jobId, String status, int progress, String message,
//                                           int totalItems, int processedItems) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job == null) return null;
//
//        job.setStatus(status);
//        job.setMessage(message);
//        job.setTotalItems(totalItems);
//        job.setProcessedItems(processedItems);
//        job.calculateProgress();  // ✅ Auto progress
//        job.setUpdatedAt(new Date());
//
//        MigrationJob saved = repository.save(job);
//        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));  // ✅ WS
//        return saved;
//    }
//
//    public MigrationJob pauseJob(String jobId) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job != null) {
//            job.setStatus("paused");
//            job.setUpdatedAt(new Date());
//            MigrationJob saved = repository.save(job);
//            webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
//            return saved;
//        }
//        return null;
//    }
//
//    public MigrationJob resumeJob(String jobId) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job != null) {
//            job.setStatus("in_progress");
//            job.setUpdatedAt(new Date());
//            MigrationJob saved = repository.save(job);
//            webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
//            return saved;
//        }
//        return null;
//    }
//
//    public MigrationJob cancelJob(String jobId) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job != null) {
//            job.setStatus("cancelled");
//            job.setUpdatedAt(new Date());
//            MigrationJob saved = repository.save(job);
//            webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
//            return saved;
//        }
//        return null;
//    }
//
//    public JobStatus getJobStatus(String jobId, String userId) {
//        MigrationJob job = repository.findByJobId(jobId).orElseGet(null);
//        if (job != null && job.getUserId().equals(userId)) {
//            return new JobStatus(job);
//        }
//        return null;
//    }
//
//    public List<JobStatus> getUserJobs(String userId) {
//        return repository.findByUserId(userId).stream()
//                .map(JobStatus::new)
//                .collect(Collectors.toList());
//    }
//}








// status-service/src/main/java/com/unwan/status/service/StatusService.java
package com.unwan.status.service;

import com.unwan.status.controller.WebSocketController;
import com.unwan.status.model.JobStatus;
import com.unwan.status.model.MigrationJob;
import com.unwan.status.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StatusService {

    @Autowired
    private JobRepository repository;

    @Autowired
    private WebSocketController webSocketController;

    public MigrationJob createJob(String jobId, String userId, String userEmail, String migrationType) {
        MigrationJob job = new MigrationJob(jobId, userId, userEmail, migrationType);
        MigrationJob saved = repository.save(job);

        // Send initial status via WebSocket
        webSocketController.sendProgressUpdate(userId, new JobStatus(saved));
        return saved;
    }

    public Optional<MigrationJob> getJob(String jobId) {
        return repository.findByJobId(jobId);
    }

    public MigrationJob updateJob(String jobId, String status, int progress, String message) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        job.setStatus(status);
        job.setProgress(progress);
        job.setMessage(message);
        job.setUpdatedAt(new Date());

        MigrationJob saved = repository.save(job);
        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
        return saved;
    }

    public MigrationJob updateJobWithItems(String jobId, String status, int progress, String message,
                                           int totalItems, int processedItems) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        job.setStatus(status);
        job.setMessage(message);
        job.setTotalItems(totalItems);
        job.setProcessedItems(processedItems);
        job.calculateProgress();
        job.setUpdatedAt(new Date());

        MigrationJob saved = repository.save(job);
        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
        return saved;
    }

    public MigrationJob pauseJob(String jobId) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        job.setStatus("paused");
        job.setMessage("Migration paused by user");
        job.setUpdatedAt(new Date());

        MigrationJob saved = repository.save(job);
        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
        return saved;
    }

    public MigrationJob resumeJob(String jobId) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        job.setStatus("in_progress");
        job.setMessage("Migration resumed");
        job.setUpdatedAt(new Date());

        MigrationJob saved = repository.save(job);
        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
        return saved;
    }

    public MigrationJob cancelJob(String jobId) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        job.setStatus("cancelled");
        job.setMessage("Migration cancelled by user");
        job.setUpdatedAt(new Date());

        MigrationJob saved = repository.save(job);
        webSocketController.sendProgressUpdate(job.getUserId(), new JobStatus(saved));
        return saved;
    }

    public JobStatus getJobStatus(String jobId, String userId) {
        Optional<MigrationJob> jobOpt = repository.findByJobId(jobId);
        if (jobOpt.isEmpty()) return null;

        MigrationJob job = jobOpt.get();
        if (!job.getUserId().equals(userId)) {
            return null;
        }
        return new JobStatus(job);
    }

    public List<JobStatus> getUserJobs(String userId) {
        return repository.findByUserIdOrderByStartedAtDesc(userId).stream()
                .map(JobStatus::new)
                .collect(Collectors.toList());
    }
}