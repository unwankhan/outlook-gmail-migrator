package com.unwan.migration.model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
//@JsonIgnoreProperties(ignoreUnknown = true)
public class MigrationRequest {
    // Getters and Setters
    private String email;
    private String userId;
    private String migrationType;
    private String outlookAccessToken;
    private String gmailAccessToken;
    private String folder;
    private String userToken;

    public MigrationRequest() {}

    public MigrationRequest(String email, String userId, String migrationType,
                            String outlookAccessToken, String gmailAccessToken , String userToken) {
        this.email = email;
        this.userId = userId;
        this.migrationType = migrationType;
        this.outlookAccessToken = outlookAccessToken;
        this.gmailAccessToken = gmailAccessToken;
        this.userToken=userToken;
    }
    @Override
    public String toString(){
        return "MigrationRequest Data "+"email=" + email + ", userId=" + userId + ", migrationType=" + migrationType
                + ", outlookAccessToken=" + outlookAccessToken + ", gmailAccessToken=" + gmailAccessToken
                + ", folder=" + folder + ", userToken=" + userToken;
    }

}