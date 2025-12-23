package com.unwan.migration.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.requests.MessageCollectionPage;
import com.microsoft.graph.requests.MailFolderCollectionPage;
import com.unwan.migration.model.EmailMessage;
import okhttp3.Request;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class RealMailMigrationService {
    private final RestTemplate restTemplate = new RestTemplate();



    private final Map<String, String> OUTLOOK_FOLDER_IDS = Map.of(
            "inbox", "inbox",
            "sentitems", "sentitems",
            "deleteditems", "deleteditems",
            "drafts", "drafts",
            "junkemail", "junkemail",
            "archive", "archive",
            "outbox", "outbox"
    );

    public List<EmailMessage> fetchOutlookMails(String accessToken, String folderName) {
        // ✅ FIXED: Use folder ID instead of display name
        String folderId = getFolderId(folderName);

        try {
            GraphServiceClient<Request> graphClient = GraphServiceClient
                    .builder()
                    .authenticationProvider(url -> CompletableFuture.completedFuture(accessToken))
                    .buildClient();

            MessageCollectionPage messages = graphClient
                    .me()
                    .mailFolders(folderId)
                    .messages()
                    .buildRequest()
                    .select("subject,from,toRecipients,body,receivedDateTime,isRead,hasAttachments")
                    .top(50)
                    .get();

            return messages.getCurrentPage().stream()
                    .map(msg -> {
                        EmailMessage email = new EmailMessage();
                        email.setSubject(msg.subject != null ? msg.subject : "No Subject");

                        if (msg.from != null && msg.from.emailAddress != null) {
                            email.setFrom(msg.from.emailAddress.address);
                        }

                        if (msg.toRecipients != null && !msg.toRecipients.isEmpty()) {
                            email.setTo(msg.toRecipients.stream()
                                    .filter(recipient -> recipient.emailAddress != null)
                                    .map(recipient -> recipient.emailAddress.address)
                                    .collect(Collectors.joining(", ")));
                        }

                        if (msg.body != null) {
                            email.setBody(msg.body.content != null ? msg.body.content : "");
                        }

                        email.setReceivedDateTime(msg.receivedDateTime != null ?
                                msg.receivedDateTime.toString() : new Date().toString());
                        return email;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("❌ Outlook mail fetch failed for folder " + folderId + ": " + e.getMessage());
            // Return dummy emails for testing
            return Arrays.asList();
        }
    }


    private String getFolderId(String folderName) {
        String lowerFolder = folderName.toLowerCase().replace(" ", "");
        return OUTLOOK_FOLDER_IDS.getOrDefault(lowerFolder, "inbox"); // Default to inbox
    }

    // ✅ FIXED: Proper Gmail import with debugging
    public String pushToGmail(List<EmailMessage> emails, String gmailToken) {
        System.out.println("🔄 Starting Gmail migration for " + emails.size() + " emails");

        int successCount = 0;
        int totalEmails = emails.size();

        for (int i = 0; i < totalEmails; i++) {
            EmailMessage email = emails.get(i);
            System.out.println("📧 Processing email " + (i+1) + ": " + email.getSubject());
            //insert method call
            boolean success = tryGmailInsert(email, gmailToken);
            if (success) {
                successCount++;
                System.out.println("✅ Successfully migrated email: " + email.getSubject());
            } else {
                System.err.println("❌ Failed to migrate email: " + email.getSubject());
            }

            // Rate limiting
            try {
                Thread.sleep(1000); // 1 second delay
            } catch (InterruptedException ignored) {}
        }



        String result = "Gmail migration: " + successCount + "/" + totalEmails + " emails migrated";
        System.out.println("🎉 " + result);
        return result;
    }

//    // ✅ FIXED: Working Gmail import method
//    private boolean insertGmailMessage(EmailMessage email, String accessToken) {
//        try {
//            // Dono methods try karte hain - import aur insert
////            boolean importSuccess = tryGmailImport(email, accessToken);
////            if (importSuccess) return true;
//
//            // Agar import fail ho toh insert try karo
//            return
//
//        } catch (Exception e) {
//            System.err.println("❌ Gmail migration failed: " + e.getMessage());
//            return false;
//        }
//    }



    private boolean tryGmailInsert(EmailMessage email, String accessToken) {
        try {
            String url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/import";
            String rawMessage = createProperMimeMessage(email);
            System.out.println("📨 Raw MIME message length: " + rawMessage.length());

            // use URL-safe base64 (without padding is fine)
            String encodedMessage = Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(rawMessage.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> bodyMap = new HashMap<>();
            bodyMap.put("raw", encodedMessage);

            // label mapping: folder -> Gmail label(s)
            List<String> labels = new ArrayList<>();
            labels.add("INBOX"); // default
            String folder = email.getFolder() != null ? email.getFolder().toLowerCase() : "";
            if (folder.contains("sent")) {
                labels = List.of("SENT");
            } else if (folder.contains("draft")) {
                labels = List.of("DRAFT");
            } else if (folder.contains("trash") || folder.contains("deleted")) {
                labels = List.of("TRASH");
            } else if (folder.contains("archive")) {
                labels = Arrays.asList("INBOX","CATEGORY_UPDATES"); // example
            }

            // unread mapping
            if (!email.isRead()) {
                // keep it unread by adding UNREAD
                if (!labels.contains("UNREAD")) labels.add("UNREAD");
            } else {
                // ensure UNREAD not present
                labels.remove("UNREAD");
            }

            bodyMap.put("labelIds", labels);

            ObjectMapper mapper = new ObjectMapper();
            String requestBody = mapper.writeValueAsString(bodyMap);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            boolean success = response.getStatusCode().is2xxSuccessful();
            System.out.println("📤 Gmail Insert response: " + response.getStatusCode() + " - Success: " + success);
            return success;

        } catch (Exception e) {
            System.err.println("❌ Gmail insert failed: " + e.getMessage());
            return false;
        }
    }

//    private boolean tryGmailInsert(EmailMessage email, String accessToken) {
//        try {
//            String url = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
//
//            String rawMessage = createProperMimeMessage(email);
//            String encodedMessage = Base64.getUrlEncoder().encodeToString(rawMessage.getBytes("UTF-8"));
//
//            String requestBody = String.format("{\"raw\": \"%s\"}", encodedMessage);
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_JSON);
//            headers.setBearerAuth(accessToken);
//
//            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
//
//            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//
//            boolean success = response.getStatusCode().is2xxSuccessful();
//            System.out.println("📥 Gmail insert response: " + response.getStatusCode() + " - Success: " + success);
//
//            return success;
//
//        } catch (Exception e) {
//            System.err.println("❌ Gmail insert failed: " + e.getMessage());
//            return false;
//        }
//    }

    private String createProperMimeMessage(EmailMessage email) {
        String messageId = "<" + UUID.randomUUID() + "@migration>";
        String dateHeader;
        // try to use original receivedDateTime if available (ISO-8601)
        try {
            if (email.getReceivedDateTime() != null && !email.getReceivedDateTime().isBlank()) {
                OffsetDateTime odt = OffsetDateTime.parse(email.getReceivedDateTime());
                dateHeader = DateTimeFormatter.RFC_1123_DATE_TIME.format(odt);
            } else {
                dateHeader = DateTimeFormatter.RFC_1123_DATE_TIME.format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
            }
        } catch (Exception e) {
            dateHeader = DateTimeFormatter.RFC_1123_DATE_TIME.format(java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC));
        }

        String from = email.getFrom() != null ? email.getFrom() : "migration@example.com";
        String to = email.getTo() != null ? email.getTo() : "user@example.com";
        String subject = email.getSubject() != null ? email.getSubject() : "No Subject";
        String htmlBody = email.getBody() != null ? email.getBody() : "";
        // basic html->text fallback (simple strip, for better results use Jsoup)
        String textBody = htmlBody.replaceAll("(?s)<[^>]*>", "").replaceAll("&nbsp;", " ").trim();
        if (textBody.isBlank()) textBody = "Email content migrated from Outlook";

        String boundary = "ALT-" + UUID.randomUUID().toString();

        StringBuilder sb = new StringBuilder();
        sb.append("MIME-Version: 1.0\r\n");
        sb.append("Message-ID: ").append(messageId).append("\r\n");
        sb.append("Date: ").append(dateHeader).append("\r\n");
        sb.append("From: ").append(from).append("\r\n");
        sb.append("To: ").append(to).append("\r\n");
        sb.append("Subject: ").append(subject).append("\r\n");
        sb.append("Content-Type: multipart/alternative; boundary=\"").append(boundary).append("\"\r\n");
        sb.append("\r\n");

        // plain part
        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Type: text/plain; charset=UTF-8\r\n");
        sb.append("Content-Transfer-Encoding: 7bit\r\n");
        sb.append("\r\n");
        sb.append(textBody).append("\r\n");
        sb.append("\r\n");

        // html part
        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Type: text/html; charset=UTF-8\r\n");
        sb.append("Content-Transfer-Encoding: 7bit\r\n");
        sb.append("\r\n");
        sb.append(htmlBody).append("\r\n");
        sb.append("\r\n");

        // end
        sb.append("--").append(boundary).append("--").append("\r\n");

        return sb.toString();
    }


    // ✅ FIXED: Fetch folders with proper error handling
    public List<String> fetchOutlookFolders(String accessToken) {
        try {
            GraphServiceClient<Request> graphClient = GraphServiceClient
                    .builder()
                    .authenticationProvider(url -> CompletableFuture.completedFuture(accessToken))
                    .buildClient();

            MailFolderCollectionPage folders = graphClient.me().mailFolders()
                    .buildRequest()
                    .select("id,displayName")
                    .get();

            List<String> folderNames = folders.getCurrentPage().stream()
                    .map(folder -> folder.displayName)
                    .collect(Collectors.toList());

            System.out.println("✅ Outlook folders found: " + folderNames);
            return folderNames;

        } catch (Exception e) {
            System.err.println("❌ Failed to fetch Outlook folders: " + e.getMessage());
            // Return common folder names as fallback
            return Arrays.asList("Inbox", "Sent Items", "Drafts", "Deleted Items", "Archive");
        }
    }

}
