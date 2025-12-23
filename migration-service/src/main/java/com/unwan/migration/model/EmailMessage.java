package com.unwan.migration.model;

import lombok.Getter;
import lombok.Setter;


public class EmailMessage {
    // Getters and Setters
    private String id;
    private String subject;
    private String from;
    private String to;
    private String body;
    private String receivedDateTime;
    private String folder;
    private boolean read;
    private boolean hasAttachments;

    // Constructors
    public EmailMessage() {}

    public EmailMessage(String subject, String from, String to, String body, String receivedDateTime) {
        this.subject = subject;
        this.from = from;
        this.to = to;
        this.body = body;
        this.receivedDateTime = receivedDateTime;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getReceivedDateTime() {
        return receivedDateTime;
    }

    public void setReceivedDateTime(String receivedDateTime) {
        this.receivedDateTime = receivedDateTime;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public boolean isHasAttachments() {
        return hasAttachments;
    }

    public void setHasAttachments(boolean hasAttachments) {
        this.hasAttachments = hasAttachments;
    }
}