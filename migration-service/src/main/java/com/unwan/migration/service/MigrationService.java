//migration-service/src/main/java/com/unwan/migration/service/MigrationService.java
package com.unwan.migration.service;

import com.unwan.migration.model.MigrationRequest;
import com.unwan.migration.model.MigrationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class MigrationService {

    @Autowired
    private RealMailMigrationService realMailMigrationService;

    @Autowired
    private RealContactMigrationService realContactMigrationService;

    @Autowired
    private RealCalendarMigrationService realCalendarMigrationService;

    @Autowired
    private RealDriveMigrationService realDriveMigrationService;

    @Autowired
    private RestTemplate restTemplate;

    private final String STATUS_SERVICE_URL = "http://status-service:8083/api/status";

    private final ExecutorService migrationExecutor = Executors.newCachedThreadPool();

    private final ConcurrentHashMap<String, Boolean> userLocks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Boolean> pauseFlags = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Boolean> cancelFlags = new ConcurrentHashMap<>();

    public MigrationResponse startMigration(MigrationRequest request) {
        if (userLocks.containsKey(request.getUserId()) && userLocks.get(request.getUserId())) {
            return new MigrationResponse("failed", "You already have a migration in progress. Please wait for it to complete.", "");
        }

        userLocks.put(request.getUserId(), true);
        String jobId = "job-" + System.currentTimeMillis();

        try {
            createJobInStatusService(jobId, request.getUserId(), request.getEmail(), request.getMigrationType());

            migrationExecutor.submit(() -> {
                try {
                    switch (request.getMigrationType().toLowerCase()) {
                        case "mail":
                            migrateMailData(request, jobId);
                            break;
                        case "contacts":
                            migrateContactData(request, jobId);
                            break;
                        case "calendar":
                            migrateCalendarData(request, jobId);
                            break;
                        case "drive":
                            migrateDriveData(request, jobId);
                            break;
                        case "all":
                            migrateAllData(request, jobId);
                            break;
                        default:
                            updateJobStatus(jobId, "failed", 0, "Unknown migration type", request.getUserId(), request.getEmail());
                    }
                } catch (Exception e) {
                    updateJobStatus(jobId, "failed", 0, "Migration error: " + e.getMessage(), request.getUserId(), request.getEmail());
                } finally {
                    userLocks.put(request.getUserId(), false);
                    pauseFlags.remove(jobId);
                    cancelFlags.remove(jobId);
                }
            });

            return new MigrationResponse("started", "Migration started successfully", jobId);
        } catch (Exception e) {
            userLocks.put(request.getUserId(), false);
            return new MigrationResponse("failed", "Failed to start migration: " + e.getMessage(), jobId);
        }
    }

    private boolean shouldPause(String jobId) {
        return pauseFlags.getOrDefault(jobId, false);
    }

    private boolean shouldCancel(String jobId) {
        return cancelFlags.getOrDefault(jobId, false);
    }

    private void waitIfPaused(String jobId) {
        while (shouldPause(jobId)) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    private String migrateMailData(MigrationRequest request, String jobId) {
        try {
            updateJobStatus(jobId, "in_progress", 5, "Fetching Outlook folders", request.getUserId(), request.getEmail());

            var folders = realMailMigrationService.fetchOutlookFolders(request.getOutlookAccessToken());
            updateJobStatus(jobId, "in_progress", 10, "Found " + folders.size() + " folders", request.getUserId(), request.getEmail());

            int totalEmails = 0;
            int migratedEmails = 0;

            for (String folder : folders) {
                var emails = realMailMigrationService.fetchOutlookMails(request.getOutlookAccessToken(), folder);
                totalEmails += emails.size();
            }

            updateJobStatusWithItems(jobId, "in_progress", 15,
                    "Starting migration of " + totalEmails + " emails",
                    totalEmails, 0, request.getUserId(), request.getEmail());

            for (String folder : folders) {
                if (shouldCancel(jobId)) {
                    updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
                    return "cancelled";
                }
                waitIfPaused(jobId);

                updateJobStatus(jobId, "in_progress", 20, "Processing folder: " + folder, request.getUserId(), request.getEmail());

                var emails = realMailMigrationService.fetchOutlookMails(request.getOutlookAccessToken(), folder);

                int batchSize = 10;
                for (int i = 0; i < emails.size(); i += batchSize) {
                    if (shouldCancel(jobId)) {
                        updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
                        return "cancelled";
                    }
                    waitIfPaused(jobId);

                    int end = Math.min(i + batchSize, emails.size());
                    var batch = emails.subList(i, end);

                    String result = realMailMigrationService.pushToGmail(batch, request.getGmailAccessToken());
                    migratedEmails += batch.size();

                    int progress = 20 + (int) ((double) migratedEmails / totalEmails * 70);

                    updateJobStatusWithItems(jobId, "in_progress", progress,
                            "Migrated " + migratedEmails + " out of " + totalEmails + " emails (" + folder + ")",
                            totalEmails, migratedEmails, request.getUserId(), request.getEmail());

                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }

            String finalMessage = "Mail migration completed: " + migratedEmails + "/"+ totalEmails + " emails migrated";
            updateJobStatus(jobId, "completed", 100, finalMessage, request.getUserId(), request.getEmail());
            return finalMessage;

        } catch (Exception e) {
            updateJobStatus(jobId, "failed", 0, "Mail migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
            throw e;
        }
    }

//    private String migrateContactData(MigrationRequest request, String jobId) {
//        try {
//            updateJobStatus(jobId, "in_progress", 5, "Fetching Outlook contacts", request.getUserId(), request.getEmail());
//
//            var contacts = realContactMigrationService.fetchOutlookContacts(request.getOutlookAccessToken());
//            int totalContacts = contacts.size();
//
//            updateJobStatusWithItems(jobId, "in_progress", 20,
//                    "Found " + totalContacts + " contacts, starting migration",
//                    totalContacts, 0, request.getUserId(), request.getEmail());
//
//            int batchSize = 5;
//            int migratedContacts = 0;
//
//            for (int i = 0; i < contacts.size(); i += batchSize) {
//                if (shouldCancel(jobId)) {
//                    updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
//                    return "Cancelled";
//                }
//                waitIfPaused(jobId);
//
//                int end = Math.min(i + batchSize, contacts.size());
//                var batch = contacts.subList(i, end);
//
//                String result = realContactMigrationService.pushToGoogleContacts(batch, request.getGmailAccessToken());
//                migratedContacts += batch.size();
//
//                int progress = 20 + (int) ((double) migratedContacts / totalContacts * 75);
//                updateJobStatusWithItems(jobId, "in_progress", progress,
//                        "Migrated " + migratedContacts + " out of " + totalContacts + " contacts",
//                        totalContacts, migratedContacts, request.getUserId(), request.getEmail());
//
//                try {
//                    Thread.sleep(1000);
//                } catch (InterruptedException e) {
//                    Thread.currentThread().interrupt();
//                    break;
//                }
//            }
//
//            String result = "Contacts migration completed: " + migratedContacts + "/" + totalContacts + " contacts migrated";
//            updateJobStatus(jobId, "completed", 100, result, request.getUserId(), request.getEmail());
//            return result;
//
//        } catch (Exception e) {
//            updateJobStatus(jobId, "failed", 0, "Contact migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
//            throw e;
//        }
//    }

    // Contacts migration method ko update karo
    private String migrateContactData(MigrationRequest request, String jobId) {
        try {
            updateJobStatus(jobId, "in_progress", 5, "Fetching Outlook contacts", request.getUserId(), request.getEmail());

            var contacts = realContactMigrationService.fetchOutlookContacts(request.getOutlookAccessToken());
            int totalContacts = contacts.size();

            updateJobStatusWithItems(jobId, "in_progress", 10,
                    "Found " + totalContacts + " contacts, starting migration",
                    totalContacts, 0, request.getUserId(), request.getEmail());

            // Migrate in batches for better progress tracking
            int batchSize = 2; // Small batches for frequent updates
            int migratedContacts = 0;

            for (int i = 0; i < contacts.size(); i += batchSize) {
                if (shouldCancel(jobId)) {
                    updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
                    return "Cancelled";
                }
                waitIfPaused(jobId);

                int end = Math.min(i + batchSize, contacts.size());
                var batch = contacts.subList(i, end);

                // ✅ ACTUAL MIGRATION - yeh line execute honi chahiye
                String result = realContactMigrationService.pushToGoogleContacts(batch, request.getGmailAccessToken());
                migratedContacts += batch.size();

                // ✅ REAL PROGRESS CALCULATION
                int progress = 10 + (int) ((double) migratedContacts / totalContacts * 85);

                updateJobStatusWithItems(jobId, "in_progress", progress,
                        "Migrated " + migratedContacts + " out of " + totalContacts + " contacts",
                        totalContacts, migratedContacts, request.getUserId(), request.getEmail());

                // Small delay to show progress smoothly
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            String result = "Contacts migration completed: " + migratedContacts + "/" + totalContacts + " contacts migrated";
            updateJobStatus(jobId, "completed", 100, result, request.getUserId(), request.getEmail());
            return result;

        } catch (Exception e) {
            updateJobStatus(jobId, "failed", 0, "Contact migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
            throw e;
        }
    }

    private String migrateCalendarData(MigrationRequest request, String jobId) {
        try {
            updateJobStatus(jobId, "in_progress", 5, "Fetching Outlook calendar events", request.getUserId(), request.getEmail());

            var events = realCalendarMigrationService.fetchOutlookEvents(request.getOutlookAccessToken());
            int totalEvents = events.size();

            updateJobStatusWithItems(jobId, "in_progress", 20,
                    "Found " + totalEvents + " events, starting migration",
                    totalEvents, 0, request.getUserId(), request.getEmail());

            int batchSize = 5;
            int migratedEvents = 0;

            for (int i = 0; i < events.size(); i += batchSize) {
                if (shouldCancel(jobId)) {
                    updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
                    return "Cancelled";
                }
                waitIfPaused(jobId);

                int end = Math.min(i + batchSize, events.size());
                var batch = events.subList(i, end);

                String result = realCalendarMigrationService.pushToGoogleCalendar(batch, request.getGmailAccessToken());
                migratedEvents += batch.size();

                int progress = 20 + (int) ((double) migratedEvents / totalEvents * 75);
                updateJobStatusWithItems(jobId, "in_progress", progress,
                        "Migrated " + migratedEvents + " out of " + totalEvents + " events",
                        totalEvents, migratedEvents, request.getUserId(), request.getEmail());

                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            String result = "Calendar migration completed: " + migratedEvents + "/" + totalEvents + " events migrated";
            updateJobStatus(jobId, "completed", 100, result, request.getUserId(), request.getEmail());
            return result;

        } catch (Exception e) {
            updateJobStatus(jobId, "failed", 0, "Calendar migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
            throw e;
        }
    }

    private String migrateDriveData(MigrationRequest request, String jobId) {
        try {
            updateJobStatus(jobId, "in_progress", 5, "Fetching OneDrive files", request.getUserId(), request.getEmail());

            var files = realDriveMigrationService.fetchOneDriveFiles(request.getOutlookAccessToken());
            int totalFiles = files.size();

            updateJobStatusWithItems(jobId, "in_progress", 20,
                    "Found " + totalFiles + " files, starting migration",
                    totalFiles, 0, request.getUserId(), request.getEmail());

            int batchSize = 3;
            int migratedFiles = 0;

            for (int i = 0; i < files.size(); i += batchSize) {
                if (shouldCancel(jobId)) {
                    updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", request.getUserId(), request.getEmail());
                    return "Cancelled";
                }
                waitIfPaused(jobId);

                int end = Math.min(i + batchSize, files.size());
                var batch = files.subList(i, end);

                String result = realDriveMigrationService.pushToGoogleDrive(batch, request.getOutlookAccessToken(), request.getGmailAccessToken());
                migratedFiles += batch.size();

                int progress = 20 + (int) ((double) migratedFiles / totalFiles * 75);
                updateJobStatusWithItems(jobId, "in_progress", progress,
                        "Migrated " + migratedFiles + " out of " + totalFiles + " files",
                        totalFiles, migratedFiles, request.getUserId(), request.getEmail());

                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }

            String result = "Drive migration completed: " + migratedFiles + "/" + totalFiles + " files migrated";
            updateJobStatus(jobId, "completed", 100, result, request.getUserId(), request.getEmail());
            return result;

        } catch (Exception e) {
            updateJobStatus(jobId, "failed", 0, "Drive migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
            throw e;
        }
    }

    private String migrateAllData(MigrationRequest request, String jobId) {
        try {
            StringBuilder result = new StringBuilder();
            updateJobStatus(jobId, "in_progress", 5, "Starting all migrations", request.getUserId(), request.getEmail());

            updateJobStatus(jobId, "in_progress", 10, "Migrating mails", request.getUserId(), request.getEmail());
            String mailResult = migrateMailData(request, jobId);
            result.append("Mail: ").append(mailResult).append("; ");

            updateJobStatus(jobId, "in_progress", 50, "Migrating contacts", request.getUserId(), request.getEmail());
            String contactResult = migrateContactData(request, jobId);
            result.append("Contacts: ").append(contactResult).append("; ");

            updateJobStatus(jobId, "in_progress", 75, "Migrating calendar", request.getUserId(), request.getEmail());
            String calendarResult = migrateCalendarData(request, jobId);
            result.append("Calendar: ").append(calendarResult).append("; ");

            updateJobStatus(jobId, "in_progress", 90, "Migrating drive", request.getUserId(), request.getEmail());
            String driveResult = migrateDriveData(request, jobId);
            result.append("Drive: ").append(driveResult);

            updateJobStatus(jobId, "completed", 100, "All migrations completed successfully", request.getUserId(), request.getEmail());
            return result.toString();

        } catch (Exception e) {
            updateJobStatus(jobId, "failed", 0, "All migration failed: " + e.getMessage(), request.getUserId(), request.getEmail());
            throw e;
        }
    }

    public void pauseMigration(String jobId) {
        pauseFlags.put(jobId, true);
        updateJobStatus(jobId, "paused", 0, "Migration paused", "system", "system@migrator.com");
    }

    public void resumeMigration(String jobId) {
        pauseFlags.put(jobId, false);
        updateJobStatus(jobId, "in_progress", 0, "Migration resumed", "system", "system@migrator.com");
    }

    public void cancelMigration(String jobId) {
        cancelFlags.put(jobId, true);
        pauseFlags.put(jobId, false);
        updateJobStatus(jobId, "cancelled", 0, "Migration cancelled", "system", "system@migrator.com");
    }

    private void createJobInStatusService(String jobId, String userId, String userEmail, String migrationType) {
        try {
            String url = STATUS_SERVICE_URL + "/job";
            String requestBody = String.format(
                    "{\"jobId\":\"%s\",\"userId\":\"%s\",\"userEmail\":\"%s\",\"migrationType\":\"%s\"}",
                    jobId, userId, userEmail, migrationType
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception e) {
            System.err.println("Failed to create job: " + e.getMessage());
        }
    }

    private void updateJobStatus(String jobId, String status, int progress, String message, String userId, String userEmail) {
        try {
            String url = STATUS_SERVICE_URL + "/job/" + jobId;
            String requestBody = String.format(
                    "{\"status\":\"%s\",\"progress\":%d,\"message\":\"%s\"}",
                    status, progress, message
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        } catch (Exception e) {
            System.err.println("Failed to update job status: " + e.getMessage());
        }
    }

    private void updateJobStatusWithItems(String jobId, String status, int progress,
                                          String message, int totalItems, int processedItems,
                                          String userId, String userEmail) {
        try {
            String url = STATUS_SERVICE_URL + "/job/" + jobId + "/items";
            String requestBody = String.format(
                    "{\"status\":\"%s\",\"progress\":%d,\"message\":\"%s\",\"totalItems\":%d,\"processedItems\":%d}",
                    status, progress, message, totalItems, processedItems
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);

            System.out.println("✅ Progress update sent to status service: " + progress + "%");

        } catch (Exception e) {
            System.err.println("❌ Failed to update job with items: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public MigrationResponse getStatus(String jobId) {
        try {
            String url = STATUS_SERVICE_URL + "/job/" + jobId;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            String body = response.getBody();
            if (body != null && body.contains("\"status\"")) {
                return new MigrationResponse("success", "Status retrieved", jobId);
            }
            return new MigrationResponse("unknown", "Invalid response", jobId);
        } catch (Exception e) {
            return new MigrationResponse("error", "Unable to get status: " + e.getMessage(), jobId);
        }
    }


}
