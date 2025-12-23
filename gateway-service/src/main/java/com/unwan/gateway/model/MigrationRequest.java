package com.unwan.gateway.model;

import lombok.Data;

@Data
public class MigrationRequest {
    private String email;
    private String migrationType;
    private String outlookAccessToken;
    private String gmailAccessToken;
    private String folder;

    public MigrationRequest() {
    }

    public MigrationRequest(String email, String migrationType, String outlookAccessToken, String gmailAccessToken) {
        this.email = email;
        this.migrationType = migrationType;
        this.outlookAccessToken = outlookAccessToken;
        this.gmailAccessToken = gmailAccessToken;
    }
}
