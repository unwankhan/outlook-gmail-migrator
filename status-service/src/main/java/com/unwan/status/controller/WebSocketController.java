//package com.unwan.status.controller;
//
//import com.unwan.status.model.JobStatus;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Controller;
//
//@Controller
//public class WebSocketController {
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;
//
//    // User-specific progress updates
//    public void sendProgressUpdate(String userId, JobStatus jobStatus) {
//        messagingTemplate.convertAndSendToUser(userId, "/topic/progress", jobStatus);
//    }
//
//    // Global progress updates (admin/supervisor ke liye)
//    public void broadcastProgressUpdate(JobStatus jobStatus) {
//        messagingTemplate.convertAndSend("/topic/migration-progress", jobStatus);
//    }
//
//    @MessageMapping("/migration-progress")
//    public void handleProgressUpdate(JobStatus jobStatus) {
//        // Client se message aaye to handle karo
//        broadcastProgressUpdate(jobStatus);
//    }
//}














// status-service/src/main/java/com/unwan/status/controller/WebSocketController.java
package com.unwan.status.controller;

import com.unwan.status.model.JobStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    public void sendProgressUpdate(String userId, JobStatus jobStatus) {
        try {
            System.out.println("📤 Sending WebSocket update to user: " + userId +
                    ", job: " + jobStatus.getJobId() +
                    ", progress: " + jobStatus.getProgress() + "%");

            // User-specific destination
            String userDestination = "/user/" + userId + "/queue/progress";
            messagingTemplate.convertAndSendToUser(userId, "/queue/progress", jobStatus);

            // Global broadcast
            messagingTemplate.convertAndSend("/topic/migration-progress", jobStatus);

            System.out.println("✅ WebSocket message sent to: " + userDestination);
        } catch (Exception e) {
            System.err.println("❌ Failed to send WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }


    // Global progress updates
    public void broadcastProgressUpdate(JobStatus jobStatus) {
        try {
            messagingTemplate.convertAndSend("/topic/migration-progress", jobStatus);
        } catch (Exception e) {
            System.err.println("❌ Failed to broadcast WebSocket message: " + e.getMessage());
        }
    }

    @MessageMapping("/migration-progress")
    public void handleProgressUpdate(JobStatus jobStatus) {
        // Client se message aaye to handle karo
        broadcastProgressUpdate(jobStatus);
    }
}