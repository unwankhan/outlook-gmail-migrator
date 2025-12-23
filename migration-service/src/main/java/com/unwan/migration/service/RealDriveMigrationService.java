package com.unwan.migration.service;

import com.microsoft.graph.requests.DriveItemCollectionPage;
import com.microsoft.graph.requests.GraphServiceClient;

import com.unwan.migration.model.DriveFile;
import okhttp3.Request;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class RealDriveMigrationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<DriveFile> fetchOneDriveFiles(String accessToken) {
        System.out.println("🔄 Fetching OneDrive files...");
        System.out.println("🔑 OneDrive Token: " + (accessToken != null ? accessToken.substring(0, 20) + "..." : "NULL"));

        try {
            GraphServiceClient<Request> graphClient = GraphServiceClient
                    .builder()
                    .authenticationProvider(url -> CompletableFuture.completedFuture(accessToken))
                    .buildClient();

            // ✅ IMPROVED: Better field selection
            DriveItemCollectionPage driveItems = graphClient
                    .me()
                    .drive()
                    .root()
                    .children()
                    .buildRequest()
                    .select("id,name,file,folder,size,webUrl,createdDateTime,lastModifiedDateTime,fileSystemInfo,parentReference")
                    .top(100)
                    .get();

            List<DriveFile> files = driveItems.getCurrentPage().stream()
                    .map(item -> {
                        DriveFile file = new DriveFile();
                        file.setId(item.id != null ? item.id : UUID.randomUUID().toString());
                        file.setName(item.name != null ? item.name : "Unknown File");

                        // ✅ IMPROVED: Better type detection
                        if (item.file != null) {
                            file.setType("file");
                            if (item.name != null && item.name.contains(".")) {
                                file.setFileExtension(item.name.substring(item.name.lastIndexOf(".") + 1));
                            }
                            System.out.println("📄 File detected: " + file.getName() + " (Size: " + item.size + " bytes)");
                        } else if (item.folder != null) {
                            file.setType("folder");
                            System.out.println("📁 Folder detected: " + file.getName());
                        } else {
                            file.setType("unknown");
                            System.out.println("❓ Unknown type: " + file.getName());
                        }

                        if (item.size != null) {
                            file.setSize(item.size);
                        } else {
                            file.setSize(0);
                        }

                        // ✅ FIXED: Store item ID for proper download
                        file.setDownloadUrl(item.id); // We'll use ID for proper Graph API download
                        file.setAdditionalData("Source: OneDrive | ItemID: " + item.id);

                        if (item.createdDateTime != null) {
                            file.setCreatedTime(item.createdDateTime.toString());
                        } else {
                            file.setCreatedTime(new Date().toString());
                        }

                        return file;
                    })
                    .collect(Collectors.toList());

            System.out.println("✅ Successfully fetched " + files.size() + " items from OneDrive");
            return files;

        } catch (Exception e) {
            System.err.println("❌ OneDrive files fetch failed: " + e.getMessage());
            e.printStackTrace();
            return Arrays.asList();
        }
    }

    public String pushToGoogleDrive(List<DriveFile> files, String oneDriveToken, String googleToken) {
        System.out.println("🔄 Starting Google Drive migration for " + files.size() + " files");
        System.out.println("🔑 OneDrive Token: " + (oneDriveToken != null ? oneDriveToken.substring(0, 20) + "..." : "NULL"));
        System.out.println("🔑 Google Token: " + (googleToken != null ? googleToken.substring(0, 20) + "..." : "NULL"));

        int successCount = 0;
        int totalFiles = files.size();

        for (int i = 0; i < totalFiles; i++) {
            DriveFile file = files.get(i);
            System.out.println("\n📁 Processing item " + (i+1) + "/" + totalFiles + ": " + file.getName() + " (" + file.getType() + ")");
            System.out.println("📊 File size: " + file.getSize() + " bytes");
            System.out.println("🆔 Item ID: " + file.getDownloadUrl());

            // Skip folders for now
            if ("folder".equals(file.getType())) {
                System.out.println("⏭️ Skipping folder: " + file.getName());
                successCount++;
                continue;
            }

            boolean success = uploadToGoogleDrive(file, oneDriveToken, googleToken);
            if (success) {
                successCount++;
                System.out.println("✅ Successfully migrated file: " + file.getName());
            } else {
                System.err.println("❌ Failed to migrate file: " + file.getName());
            }

            // Rate limiting
            try {
                System.out.println("⏳ Waiting 2 seconds before next request...");
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                System.err.println("⚠️ Thread sleep interrupted: " + e.getMessage());
            }
        }

        String result = "Drive migration: " + successCount + "/" + totalFiles + " files migrated";
        System.out.println("\n🎉 " + result);
        return result;
    }

    // ✅ COMPLETE FIX: Proper download using Graph API
    private boolean uploadToGoogleDrive(DriveFile file, String oneDriveToken, String googleToken) {
        try {
            System.out.println("📤 Starting upload process for: " + file.getName());

            // Step 1: Download file content from OneDrive using Graph API
            byte[] fileContent = downloadFileFromOneDrive(file, oneDriveToken);
            if (fileContent == null) {
                System.err.println("❌ Failed to download file content from OneDrive: " + file.getName());
                return false;
            }

            System.out.println("✅ Successfully downloaded file content: " + fileContent.length + " bytes");

            // Step 2: Upload to Google Drive
            boolean success = uploadFileToGoogleDrive(file, fileContent, googleToken);

            if (success) {
                System.out.println("✅ File completely migrated to Google Drive: " + file.getName());
            } else {
                System.err.println("❌ Google Drive upload failed for file: " + file.getName());
            }

            return success;

        } catch (Exception e) {
            System.err.println("❌ Google Drive upload failed for file '" + file.getName() + "': " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // ✅ COMPLETE FIX: Download using Microsoft Graph API with proper authentication
    private byte[] downloadFileFromOneDrive(DriveFile file, String accessToken) {
        try {
            if (file.getDownloadUrl() == null || file.getDownloadUrl().isEmpty()) {
                System.err.println("❌ No item ID available for file: " + file.getName());
                return null;
            }

            String itemId = file.getDownloadUrl();
            System.out.println("📥 Downloading file from OneDrive using Graph API: " + file.getName());
            System.out.println("🆔 Using Item ID: " + itemId);

            // ✅ FIXED: Use Microsoft Graph API endpoint with proper authentication
            String downloadUrl = "https://graph.microsoft.com/v1.0/me/drive/items/" + itemId + "/content";
            System.out.println("🔗 Graph API Download URL: " + downloadUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    downloadUrl,
                    HttpMethod.GET,
                    entity,
                    byte[].class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                System.out.println("✅ Successfully downloaded file via Graph API: " + file.getName() + " (" + response.getBody().length + " bytes)");
                return response.getBody();
            } else {
                System.err.println("❌ Graph API download failed. Status: " + response.getStatusCode());
                System.err.println("Response headers: " + response.getHeaders());

                // Try alternative method if direct download fails
                return downloadWithGraphClient(file, accessToken);
            }

        } catch (Exception e) {
            System.err.println("❌ Graph API download failed for '" + file.getName() + "': " + e.getMessage());
            // Fallback to Graph Client method
            return downloadWithGraphClient(file, accessToken);
        }
    }

    // ✅ ALTERNATIVE METHOD: Download using GraphServiceClient
    private byte[] downloadWithGraphClient(DriveFile file, String accessToken) {
        try {
            System.out.println("🔄 Trying alternative download method using GraphServiceClient for: " + file.getName());

            GraphServiceClient<Request> graphClient = GraphServiceClient
                    .builder()
                    .authenticationProvider(url -> CompletableFuture.completedFuture(accessToken))
                    .buildClient();

            // Download using GraphServiceClient
            InputStream stream = graphClient
                    .me()
                    .drive()
                    .items(file.getDownloadUrl())
                    .content()
                    .buildRequest()
                    .get();

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[4096];
            int bytesRead;
            int totalBytes = 0;

            while ((bytesRead = stream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, bytesRead);
                totalBytes += bytesRead;
            }

            byte[] fileContent = buffer.toByteArray();
            System.out.println("✅ Successfully downloaded via GraphServiceClient: " + file.getName() + " (" + fileContent.length + " bytes)");

            stream.close();
            buffer.close();

            return fileContent;

        } catch (Exception e) {
            System.err.println("❌ GraphServiceClient download also failed for '" + file.getName() + "': " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // ✅ IMPROVED: Upload to Google Drive with better error handling
    private boolean uploadFileToGoogleDrive(DriveFile file, byte[] fileContent, String accessToken) {
        try {
            System.out.println("🚀 Uploading to Google Drive: " + file.getName() + " (" + fileContent.length + " bytes)");

            // For small files (<5MB), use simple upload
            if (fileContent.length < 5 * 1024 * 1024) {
                return simpleUploadToGoogleDrive(file, fileContent, accessToken);
            } else {
                // For larger files, use resumable upload
                return resumableUploadToGoogleDrive(file, fileContent, accessToken);
            }

        } catch (Exception e) {
            System.err.println("❌ Google Drive upload failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }


private boolean simpleUploadToGoogleDrive(DriveFile file, byte[] fileContent, String accessToken) {
        try {
            System.out.println("📤 Using simple upload for small file: " + file.getName());

            String url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

            HttpHeaders headers = new HttpHeaders();
            String boundary = "-------" + System.currentTimeMillis();
            headers.setContentType(MediaType.parseMediaType("multipart/related; boundary=" + boundary));
            headers.setBearerAuth(accessToken);

            String metadata = buildFileMetadataJson(file);
            byte[] body = buildMultipartRequestBodyBytes(metadata, fileContent, boundary, file);

            HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            boolean success = response.getStatusCode().is2xxSuccessful();
            if (success) {
                System.out.println("✅ Simple upload successful: " + file.getName());
                System.out.println("📄 Response: " + response.getBody());
            } else {
                System.err.println("❌ Simple upload failed. Status: " + response.getStatusCode());
                System.err.println("Error: " + response.getBody());
            }
            return success;

        } catch (Exception e) {
            System.err.println("❌ Simple upload failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }




    // ✅ NEW: build multipart body as byte[] (safe for binary files)
    private byte[] buildMultipartRequestBodyBytes(String metadata, byte[] fileContent, String boundary, DriveFile file) {
        String lineBreak = "\r\n";
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            // Metadata part
            out.write(("--" + boundary + lineBreak).getBytes(StandardCharsets.UTF_8));
            out.write("Content-Type: application/json; charset=UTF-8".getBytes(StandardCharsets.UTF_8));
            out.write((lineBreak + lineBreak).getBytes(StandardCharsets.UTF_8));
            out.write(metadata.getBytes(StandardCharsets.UTF_8));
            out.write(lineBreak.getBytes(StandardCharsets.UTF_8));

            // File part
            out.write(("--" + boundary + lineBreak).getBytes(StandardCharsets.UTF_8));
            out.write(("Content-Type: " + getMimeType(file.getName()) + lineBreak + lineBreak).getBytes(StandardCharsets.UTF_8));
            out.write(fileContent); // raw bytes (no String conversion!)
            out.write(lineBreak.getBytes(StandardCharsets.UTF_8));

            // Closing boundary
            out.write(("--" + boundary + "--").getBytes(StandardCharsets.UTF_8));

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build multipart body: " + e.getMessage(), e);
        } finally {
            try { out.close(); } catch (Exception ignored) {}
        }
    }


    // ✅ RESUMABLE UPLOAD: For files >= 5MB
    private boolean resumableUploadToGoogleDrive(DriveFile file, byte[] fileContent, String accessToken) {
        try {
            System.out.println("📤 Using resumable upload for large file: " + file.getName());

            String uploadUrl = initiateResumableUpload(file, accessToken);
            if (uploadUrl == null) {
                System.err.println("❌ Failed to initiate resumable upload");
                return false;
            }

            return completeResumableUpload(uploadUrl, fileContent, accessToken);

        } catch (Exception e) {
            System.err.println("❌ Resumable upload failed: " + e.getMessage());
            return false;
        }
    }

    // ✅ INITIATE RESUMABLE UPLOAD
    private String initiateResumableUpload(DriveFile file, String accessToken) {
        try {
            String url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            headers.add("X-Upload-Content-Type", getMimeType(file.getName()));
            headers.add("X-Upload-Content-Length", String.valueOf(file.getSize() > 0 ? file.getSize() : 1024));

            String metadata = buildFileMetadataJson(file);
            System.out.println("📨 Upload metadata: " + metadata);

            HttpEntity<String> entity = new HttpEntity<>(metadata, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                String uploadUrl = response.getHeaders().getFirst("Location");
                System.out.println("✅ Resumable upload initiated: " + uploadUrl);
                return uploadUrl;
            } else {
                System.err.println("❌ Failed to initiate upload. Status: " + response.getStatusCode());
                System.err.println("Response: " + response.getBody());
                return null;
            }

        } catch (Exception e) {
            System.err.println("❌ Upload initiation failed: " + e.getMessage());
            return null;
        }
    }

    // ✅ COMPLETE RESUMABLE UPLOAD
    private boolean completeResumableUpload(String uploadUrl, byte[] fileContent, String accessToken) {
        try {
            System.out.println("📤 Uploading file content (" + fileContent.length + " bytes)...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentLength(fileContent.length);
            headers.setBearerAuth(accessToken);

            HttpEntity<byte[]> entity = new HttpEntity<>(fileContent, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.PUT,
                    entity,
                    String.class
            );

            boolean success = response.getStatusCode().is2xxSuccessful();
            if (success) {
                System.out.println("✅ File content uploaded successfully!");
                System.out.println("📄 Upload response: " + response.getBody());
            } else {
                System.err.println("❌ Upload failed. Status: " + response.getStatusCode());
                System.err.println("Error: " + response.getBody());
            }

            return success;

        } catch (Exception e) {
            System.err.println("❌ File content upload failed: " + e.getMessage());
            return false;
        }
    }

    // ✅ BUILD MULTIPART REQUEST BODY
    private String buildMultipartRequestBody(String metadata, byte[] fileContent, String boundary, DriveFile file) {
        StringBuilder body = new StringBuilder();

        // Metadata part
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Type: application/json; charset=UTF-8\r\n\r\n");
        body.append(metadata).append("\r\n");

        // File content part
        body.append("--").append(boundary).append("\r\n");
        body.append("Content-Type: ").append(getMimeType(file.getName())).append("\r\n\r\n");
        body.append(new String(fileContent)).append("\r\n");

        body.append("--").append(boundary).append("--");

        return body.toString();
    }

    // ✅ REPLACED: safe metadata JSON (no read-only fields, appProperties values are strings)
    private String buildFileMetadataJson(DriveFile file) {
        StringBuilder json = new StringBuilder();
        json.append("{");

        json.append("\"name\":").append(toJsonString(file.getName()));
        json.append(",\"mimeType\":").append(toJsonString(getMimeType(file.getName())));

        String description = "Migrated from OneDrive | Original created: " + file.getCreatedTime();
        json.append(",\"description\":").append(toJsonString(description));

        // Remove fileExtension (read-only) — DO NOT include it here

        // appProperties values must be strings
        json.append(",\"appProperties\": {");
        json.append("\"migrationSource\":").append(toJsonString("OneDrive")).append(",");
        json.append("\"originalCreatedTime\":").append(toJsonString(file.getCreatedTime())).append(",");
        json.append("\"originalSize\":").append(toJsonString(String.valueOf(file.getSize()))).append(",");
        json.append("\"migratedAt\":").append(toJsonString(String.valueOf(System.currentTimeMillis())));
        json.append("}");

        json.append("}");
        return json.toString();
    }


    // ✅ MIME TYPE DETECTION
    private String getMimeType(String fileName) {
        if (fileName == null) return "application/octet-stream";

        String lowerName = fileName.toLowerCase();

        if (lowerName.endsWith(".txt")) return "text/plain";
        if (lowerName.endsWith(".pdf")) return "application/pdf";
        if (lowerName.endsWith(".doc")) return "application/msword";
        if (lowerName.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lowerName.endsWith(".xls")) return "application/vnd.ms-excel";
        if (lowerName.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (lowerName.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
        if (lowerName.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
        if (lowerName.endsWith(".png")) return "image/png";
        if (lowerName.endsWith(".gif")) return "image/gif";
        if (lowerName.endsWith(".zip")) return "application/zip";
        if (lowerName.endsWith(".mp4")) return "video/mp4";
        if (lowerName.endsWith(".mp3")) return "audio/mpeg";

        return "application/octet-stream";
    }

    // ✅ JSON STRING ESCAPE
    private String toJsonString(String str) {
        if (str == null || str.isEmpty()) return "\"\"";
        return "\"" + str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }

}