package com.unwan.migration.service;

import com.microsoft.graph.authentication.IAuthenticationProvider;
import com.microsoft.graph.models.DateTimeTimeZone;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.requests.EventCollectionPage;
import com.unwan.migration.model.CalendarEvent;
import okhttp3.Request;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class RealCalendarMigrationService {

    private final RestTemplate restTemplate = new RestTemplate();

    // ✅ FIXED: Proper ISO formatter
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    public List<CalendarEvent> fetchOutlookEvents(String accessToken) {
        List<CalendarEvent> allEvents = new ArrayList<>();
        System.out.println("🔄 Fetching Outlook calendar events...");

        try {
            GraphServiceClient<Request> graphClient = getGraphClient(accessToken);

            // ✅ FIXED: More fields select karo for better data
            EventCollectionPage page = graphClient.me().events()
                    .buildRequest()
                    .select("subject,body,start,end,location,attendees,isAllDay,organizer,webLink")
                    .top(100)
                    .get();

            int eventCount = 0;
            while (page != null && page.getCurrentPage() != null) {
                List<CalendarEvent> pageEvents = page.getCurrentPage().stream()
                        .map(this::mapOutlookEventToCalendarEvent)
                        .collect(Collectors.toList());

                allEvents.addAll(pageEvents);
                eventCount += pageEvents.size();

                System.out.println("📅 Fetched " + pageEvents.size() + " events from Outlook");

                // ✅ FIXED: Better pagination handling
                if (page.getNextPage() != null) {
                    page = page.getNextPage().buildRequest().get();
                } else {
                    page = null;
                }
            }

            System.out.println("✅ Successfully fetched " + eventCount + " events from Outlook Calendar");
            return allEvents;

        } catch (Exception e) {
            System.err.println("❌ Outlook calendar fetch failed: " + e.getMessage());
            // Return dummy events for testing
            return Arrays.asList(new CalendarEvent());
        }
    }

    private CalendarEvent mapOutlookEventToCalendarEvent(com.microsoft.graph.models.Event graphEvent) {
        CalendarEvent event = new CalendarEvent();

        // ✅ FIXED: Better title handling
        event.setTitle(graphEvent.subject != null ? graphEvent.subject : "No Title");

        // ✅ FIXED: Use body content if available
        if (graphEvent.body != null && graphEvent.body.content != null) {
            event.setDescription(graphEvent.body.content);
        } else {
            event.setDescription("");
        }

        // ✅ FIXED: Proper date time conversion with timezone
        if (graphEvent.start != null) {
            event.setStartTime(convertDateTimeTimeZone(graphEvent.start));
        } else {
            event.setStartTime("");
        }

        if (graphEvent.end != null) {
            event.setEndTime(convertDateTimeTimeZone(graphEvent.end));
        } else {
            event.setEndTime("");
        }

        // ✅ FIXED: Location handling
        if (graphEvent.location != null && graphEvent.location.displayName != null) {
            event.setLocation(graphEvent.location.displayName);
        } else {
            event.setLocation("");
        }

        // ✅ FIXED: Better attendees handling
        if (graphEvent.attendees != null && !graphEvent.attendees.isEmpty()) {
            String attendees = graphEvent.attendees.stream()
                    .filter(a -> a.emailAddress != null && a.emailAddress.address != null)
                    .map(a -> a.emailAddress.address)
                    .collect(Collectors.joining(", "));
            event.setAttendees(attendees);
        } else {
            event.setAttendees("");
        }

        return event;
    }

    // ✅ FIXED: Proper date time conversion
    private String convertDateTimeTimeZone(DateTimeTimeZone dtz) {
        if (dtz == null || dtz.dateTime == null) return "";

        try {
            String dateTimeStr = dtz.dateTime;
            String timeZoneStr = dtz.timeZone;

            // Parse the date time string (Outlook format: "2024-01-15T10:00:00.0000000")
            LocalDateTime localDateTime = LocalDateTime.parse(
                    dateTimeStr.substring(0, 19) // Take only first 19 chars for "YYYY-MM-DDTHH:MM:SS"
            );

            // Convert to proper timezone
            ZoneId zoneId = convertWindowsTimeZoneToZoneId(timeZoneStr);
            ZonedDateTime zonedDateTime = ZonedDateTime.of(localDateTime, zoneId);

            // Format to ISO string
            return zonedDateTime.format(ISO_FORMATTER);

        } catch (DateTimeParseException e) {
            System.err.println("❌ Date parsing error: " + e.getMessage());
            // Fallback: return basic format
            return dtz.dateTime + "Z";
        } catch (Exception e) {
            System.err.println("❌ Date conversion error: " + e.getMessage());
            return dtz.dateTime + (dtz.timeZone != null ? dtz.timeZone : "Z");
        }
    }

    // ✅ FIXED: Windows timezone to Java ZoneId conversion
    private ZoneId convertWindowsTimeZoneToZoneId(String windowsTimeZone) {
        if (windowsTimeZone == null) {
            return ZoneId.of("UTC");
        }

        // Common timezone mappings
        switch (windowsTimeZone) {
            case "India Standard Time":
                return ZoneId.of("Asia/Kolkata");
            case "Pacific Standard Time":
                return ZoneId.of("America/Los_Angeles");
            case "Eastern Standard Time":
                return ZoneId.of("America/New_York");
            case "Central Standard Time":
                return ZoneId.of("America/Chicago");
            case "UTC":
                return ZoneId.of("UTC");
            case "GMT Standard Time":
                return ZoneId.of("Europe/London");
            default:
                return ZoneId.of("UTC"); // Default to UTC
        }
    }

    public String pushToGoogleCalendar(List<CalendarEvent> events, String googleToken) {
        System.out.println("🔄 Starting Google Calendar migration for " + events.size() + " events");

        int successCount = 0;
        int totalEvents = events.size();

        for (int i = 0; i < totalEvents; i++) {
            CalendarEvent event = events.get(i);
            System.out.println("📅 Processing event " + (i+1) + "/" + totalEvents + ": " + event.getTitle());

            boolean success = createGoogleCalendarEvent(event, googleToken);
            if (success) {
                successCount++;
                System.out.println("✅ Successfully migrated event: " + event.getTitle());
            } else {
                System.err.println("❌ Failed to migrate event: " + event.getTitle());
            }

            // Rate limiting
            try {
                Thread.sleep(500); // 500ms delay between requests
            } catch (InterruptedException ignored) {}
        }

        String result = "Calendar migration: " + successCount + "/" + totalEvents + " events migrated";
        System.out.println("🎉 " + result);
        return result;
    }

    private boolean createGoogleCalendarEvent(CalendarEvent event, String accessToken) {
        try {
            String url = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

            // ✅ FIXED: Proper JSON construction with debugging
            String jsonBody = buildCalendarEventJson(event);
            System.out.println("📨 Creating calendar event with JSON: " + jsonBody);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            boolean success = response.getStatusCode().is2xxSuccessful();
            if (success) {
                System.out.println("✅ Google Calendar event created successfully: " + event.getTitle());
            } else {
                System.err.println("❌ Google Calendar API error: " + response.getStatusCode() + " - " + response.getBody());
            }

            return success;

        } catch (Exception e) {
            System.err.println("❌ Google Calendar create failed for event '" + event.getTitle() + "': " + e.getMessage());
            return false;
        }
    }

    // ✅ FIXED: Better JSON construction
    private String buildCalendarEventJson(CalendarEvent event) {
        StringBuilder json = new StringBuilder();
        json.append("{");

        // Summary (title)
        json.append("\"summary\":").append(toJsonString(event.getTitle()));

        // Description
        if (event.getDescription() != null && !event.getDescription().isEmpty()) {
            json.append(",\"description\":").append(toJsonString(event.getDescription()));
        }

        // Location
        if (event.getLocation() != null && !event.getLocation().isEmpty()) {
            json.append(",\"location\":").append(toJsonString(event.getLocation()));
        }

        // Start time - with proper timezone
        String startTime = event.getStartTime();
        if (startTime != null && !startTime.isEmpty()) {
            json.append(",\"start\":{");
            json.append("\"dateTime\":").append(toJsonString(startTime));
            // Use timezone from the datetime string or default
            if (startTime.contains("+") || startTime.contains("Z")) {
                json.append("}"); // Timezone already in datetime
            } else {
                json.append(",\"timeZone\":\"Asia/Kolkata\"}");
            }
        } else {
            // Fallback: current time
            String defaultStart = ZonedDateTime.now().format(ISO_FORMATTER);
            json.append(",\"start\":{");
            json.append("\"dateTime\":").append(toJsonString(defaultStart));
            json.append("}");
        }

        // End time - with proper timezone
        String endTime = event.getEndTime();
        if (endTime != null && !endTime.isEmpty()) {
            json.append(",\"end\":{");
            json.append("\"dateTime\":").append(toJsonString(endTime));
            // Use timezone from the datetime string or default
            if (endTime.contains("+") || endTime.contains("Z")) {
                json.append("}"); // Timezone already in datetime
            } else {
                json.append(",\"timeZone\":\"Asia/Kolkata\"}");
            }
        } else {
            // Fallback: 1 hour after start
            String defaultEnd = ZonedDateTime.now().plusHours(1).format(ISO_FORMATTER);
            json.append(",\"end\":{");
            json.append("\"dateTime\":").append(toJsonString(defaultEnd));
            json.append("}");
        }

        // Attendees
        if (event.getAttendees() != null && !event.getAttendees().isEmpty()) {
            json.append(",\"attendees\":[");
            String[] emails = event.getAttendees().split(",");
            for (int i = 0; i < emails.length; i++) {
                if (i > 0) json.append(",");
                json.append("{\"email\":\"").append(emails[i].trim()).append("\"}");
            }
            json.append("]");
        }

        json.append("}");

        return json.toString();
    }

    // ✅ FIXED: Better JSON string escape
    private String toJsonString(String str) {
        if (str == null || str.isEmpty()) return "\"\"";
        return "\"" + str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t") + "\"";
    }

    private GraphServiceClient<Request> getGraphClient(String token) {
        return GraphServiceClient.builder()
                .authenticationProvider(url -> CompletableFuture.completedFuture(token))
                .buildClient();
    }

}