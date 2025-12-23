package com.unwan.gateway.resolver;

import com.unwan.gateway.model.JobStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Controller
public class QueryResolver {

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @QueryMapping
    public JobStatus getJobStatus(@Argument String jobId, @ContextValue String authorization) {
        try {
            System.out.println("Getting job status for jobId: " + jobId);

            // Extract user ID from JWT token
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                throw new RuntimeException("Unauthorized: Invalid or missing token");
            }

            // Call status service with user ID
            String statusServiceUrl = "http://status-service:8083/api/status/job/" + jobId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-User-Id", userId);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JobStatus> response = restTemplate.exchange(
                    statusServiceUrl,
                    HttpMethod.GET,
                    entity,
                    JobStatus.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("Job not found or access denied");
            }

        } catch (Exception e) {
            throw new RuntimeException("Access denied: " + e.getMessage());
        }
    }

    @QueryMapping
    public List<JobStatus> getUserJobs(@ContextValue String authorization) {
        try {
            System.out.println("Getting user jobs");

            // Extract user ID from JWT token
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                throw new RuntimeException("Unauthorized: Invalid or missing token");
            }

            // ✅ FIXED: Correct URL with userId as path variable
            String statusServiceUrl = "http://status-service:8083/api/status/user/jobs/" + userId;

            HttpHeaders headers = new HttpHeaders();
            // Remove X-User-Id header since we're using path variable
            // headers.set("X-User-Id", userId);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<JobStatus[]> response = restTemplate.exchange(
                    statusServiceUrl,
                    HttpMethod.GET,
                    entity,
                    JobStatus[].class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return Arrays.asList(response.getBody());
            } else {
                throw new RuntimeException("Failed to fetch user jobs");
            }

        } catch (Exception e) {
            throw new RuntimeException("Access denied: " + e.getMessage());
        }
    }

    private String extractUserIdFromToken(String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                System.err.println("No Bearer token found in header");
                return null;
            }

            String token = authorizationHeader.substring(7);

            if (token.isEmpty()) {
                System.err.println("Token is empty");
                return null;
            }

            // Call auth service to validate token
            String url = "http://auth-service:8081/api/auth/validate-token";

            String requestBody = String.format("{\"token\":\"%s\"}", token);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);

                Boolean isValid = (Boolean) responseMap.get("valid");
                String userId = (String) responseMap.get("userId");

                if (isValid != null && isValid && userId != null && !userId.isEmpty()) {
                    return userId;
                } else {
                    System.err.println("Token validation failed: " + responseMap.get("message"));
                    return null;
                }
            } else {
                System.err.println("Auth service returned non-200 status: " + response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            System.err.println("Error extracting user ID from token: " + e.getMessage());
            return null;
        }
    }
}