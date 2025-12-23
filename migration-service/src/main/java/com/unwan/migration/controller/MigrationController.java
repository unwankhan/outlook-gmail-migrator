//package com.unwan.migration.controller;
//
//import com.unwan.migration.model.MigrationRequest;
//import com.unwan.migration.model.MigrationResponse;
//import com.unwan.migration.service.MigrationService;
//import com.unwan.migration.service.RealMailMigrationService;
//import com.unwan.migration.service.RealContactMigrationService;
//import com.unwan.migration.service.RealCalendarMigrationService;
//import com.unwan.migration.service.RealDriveMigrationService;
//import lombok.Getter;
//import lombok.Setter;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.*;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/migration")
//@CrossOrigin(origins = "http://localhost:5173")  // ✅ FIXED: CORS for Vite dev server (5173)
//public class MigrationController {
//    @Autowired
//    private MigrationService migrationService;
//    @Autowired
//    private RestTemplate restTemplate;
//
//    @Autowired
//    private RealMailMigrationService realMailMigrationService;
//    @Autowired
//    private RealContactMigrationService realContactMigrationService;
//    @Autowired
//    private RealCalendarMigrationService realCalendarMigrationService;
//    @Autowired
//    private RealDriveMigrationService realDriveMigrationService;
//
//    @PostMapping("/start")
//    public ResponseEntity<?> startMigration(@RequestBody MigrationRequest request, @RequestHeader("Authorization") String authHeader) {
//        System.out.println("First Time "+"\n"+request);
//        System.out.println("Auth Header from AXIOS"+authHeader);
//        try {
//            String token = authHeader.replace("Bearer ", "");
//            String authUrl = "http://auth-service:8081/api/auth/validate-token";
//            String validationRequest = String.format("{\"token\":\"%s\"}", token);
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_JSON);
//            HttpEntity<String> entity = new HttpEntity<>(validationRequest, headers);
//            ResponseEntity<TokenValidationResponse> validationResponse = restTemplate.postForEntity(
//                    authUrl, entity, TokenValidationResponse.class);
//            if (validationResponse.getBody() != null && validationResponse.getBody().isValid()) {
//                String userId = validationResponse.getBody().getUserId();
//                String email = validationResponse.getBody().getEmail();
//                request.setUserId(userId);
//                request.setEmail(email);
//                System.out.println("Second Time "+"\n"+request);
//                MigrationResponse response = migrationService.startMigration(request);
//                return ResponseEntity.status(200).body(response);
//            } else {
//                return ResponseEntity.status(401).body(new MigrationResponse("failed", "Invalid token", ""));
//            }
//        } catch (Exception e) {
//            return ResponseEntity.status(401).body(new MigrationResponse("failed", "Authentication failed", ""));
//        }
//    }
//
//    @GetMapping("/status/{jobId}")
//    public ResponseEntity<MigrationResponse> getStatus(@PathVariable String jobId) {
//        MigrationResponse response = migrationService.getStatus(jobId);
//        return ResponseEntity.ok(response);
//    }
//
//    // Preview endpoints with CORS (same @CrossOrigin on class covers)
//    @GetMapping("/outlook/folders")
//    public ResponseEntity<List<String>> getOutlookFolders(@RequestHeader("Authorization") String accessToken) {
//        String token = accessToken.replace("Bearer ", "");
//        List<String> folders = realMailMigrationService.fetchOutlookFolders(token);
//        return ResponseEntity.ok(folders);
//    }
//
//    @GetMapping("/outlook/emails/preview")
//    public ResponseEntity<?> previewEmails(
//            @RequestHeader("Authorization") String accessToken,
//            @RequestParam String folder) {
//        try {
//            String token = accessToken.replace("Bearer ", "");
//            var emails = realMailMigrationService.fetchOutlookMails(token, folder);
//            return ResponseEntity.ok(emails);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/outlook/contacts/preview")
//    public ResponseEntity<?> previewContacts(@RequestHeader("Authorization") String accessToken) {
//        try {
//            String token = accessToken.replace("Bearer ", "");
//            var contacts = realContactMigrationService.fetchOutlookContacts(token);
//            return ResponseEntity.ok(contacts);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/outlook/calendar/preview")
//    public ResponseEntity<?> previewCalendar(@RequestHeader("Authorization") String accessToken) {
//        try {
//            String token = accessToken.replace("Bearer ", "");
//            var events = realCalendarMigrationService.fetchOutlookEvents(token);
//            return ResponseEntity.ok(events);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
//        }
//    }
//
//    @GetMapping("/outlook/drive/preview")
//    public ResponseEntity<?> previewDrive(@RequestHeader("Authorization") String accessToken) {
//        try {
//            String token = accessToken.replace("Bearer ", "");
//            var files = realDriveMigrationService.fetchOneDriveFiles(token);
//            return ResponseEntity.ok(files);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
//        }
//    }
//
//    // TokenValidationResponse inner class same as before
//
//    @Setter
//    @Getter
//    static class TokenValidationResponse {
//        private boolean valid;
//
//        private String message;
//        private String userId;
//        private String email;
//
//    }
//}
//










// migration-service/src/main/java/com/unwan/migration/controller/MigrationController.java
package com.unwan.migration.controller;

import com.unwan.migration.model.MigrationRequest;
import com.unwan.migration.model.MigrationResponse;
import com.unwan.migration.service.MigrationService;
import com.unwan.migration.service.RealMailMigrationService;
import com.unwan.migration.service.RealContactMigrationService;
import com.unwan.migration.service.RealCalendarMigrationService;
import com.unwan.migration.service.RealDriveMigrationService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/migration")
@CrossOrigin(origins = "http://localhost:5173")
public class MigrationController {
    @Autowired
    private MigrationService migrationService;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RealMailMigrationService realMailMigrationService;
    @Autowired
    private RealContactMigrationService realContactMigrationService;
    @Autowired
    private RealCalendarMigrationService realCalendarMigrationService;
    @Autowired
    private RealDriveMigrationService realDriveMigrationService;

    @PostMapping("/start")
    public ResponseEntity<?> startMigration(@RequestBody MigrationRequest request, @RequestHeader("Authorization") String authHeader) {
        System.out.println("First Time "+"\n"+request);
        System.out.println("Auth Header from AXIOS"+authHeader);
        try {
            String token = authHeader.replace("Bearer ", "");
            String authUrl = "http://auth-service:8081/api/auth/validate-token";
            String validationRequest = String.format("{\"token\":\"%s\"}", token);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(validationRequest, headers);
            ResponseEntity<TokenValidationResponse> validationResponse = restTemplate.postForEntity(
                    authUrl, entity, TokenValidationResponse.class);
            if (validationResponse.getBody() != null && validationResponse.getBody().isValid()) {
                String userId = validationResponse.getBody().getUserId();
                String email = validationResponse.getBody().getEmail();
                request.setUserId(userId);
                request.setEmail(email);
                System.out.println("Second Time "+"\n"+request);
                MigrationResponse response = migrationService.startMigration(request);
                return ResponseEntity.status(200).body(response);
            } else {
                return ResponseEntity.status(401).body(new MigrationResponse("failed", "Invalid token", ""));
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MigrationResponse("failed", "Authentication failed", ""));
        }
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<MigrationResponse> getStatus(@PathVariable String jobId) {
        MigrationResponse response = migrationService.getStatus(jobId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/pause/{jobId}")
    public ResponseEntity<MigrationResponse> pauseMigration(@PathVariable String jobId) {
        try {
            migrationService.pauseMigration(jobId);
            return ResponseEntity.ok(new MigrationResponse("success", "Migration paused", jobId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MigrationResponse("error", "Failed to pause migration: " + e.getMessage(), jobId));
        }
    }

    @PostMapping("/resume/{jobId}")
    public ResponseEntity<MigrationResponse> resumeMigration(@PathVariable String jobId) {
        try {
            migrationService.resumeMigration(jobId);
            return ResponseEntity.ok(new MigrationResponse("success", "Migration resumed", jobId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MigrationResponse("error", "Failed to resume migration: " + e.getMessage(), jobId));
        }
    }

    @PostMapping("/cancel/{jobId}")
    public ResponseEntity<MigrationResponse> cancelMigration(@PathVariable String jobId) {
        try {
            migrationService.cancelMigration(jobId);
            return ResponseEntity.ok(new MigrationResponse("success", "Migration cancelled", jobId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MigrationResponse("error", "Failed to cancel migration: " + e.getMessage(), jobId));
        }
    }

    @GetMapping("/outlook/folders")
    public ResponseEntity<List<String>> getOutlookFolders(@RequestHeader("Authorization") String accessToken) {
        String token = accessToken.replace("Bearer ", "");
        List<String> folders = realMailMigrationService.fetchOutlookFolders(token);
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/outlook/emails/preview")
    public ResponseEntity<?> previewEmails(
            @RequestHeader("Authorization") String accessToken,
            @RequestParam String folder) {
        try {
            String token = accessToken.replace("Bearer ", "");
            var emails = realMailMigrationService.fetchOutlookMails(token, folder);
            return ResponseEntity.ok(emails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/outlook/contacts/preview")
    public ResponseEntity<?> previewContacts(@RequestHeader("Authorization") String accessToken) {
        try {
            String token = accessToken.replace("Bearer ", "");
            var contacts = realContactMigrationService.fetchOutlookContacts(token);
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/outlook/calendar/preview")
    public ResponseEntity<?> previewCalendar(@RequestHeader("Authorization") String accessToken) {
        try {
            String token = accessToken.replace("Bearer ", "");
            var events = realCalendarMigrationService.fetchOutlookEvents(token);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/outlook/drive/preview")
    public ResponseEntity<?> previewDrive(@RequestHeader("Authorization") String accessToken) {
        try {
            String token = accessToken.replace("Bearer ", "");
            var files = realDriveMigrationService.fetchOneDriveFiles(token);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Setter
    @Getter
    static class TokenValidationResponse {
        private boolean valid;
        private String message;
        private String userId;
        private String email;
    }
}
