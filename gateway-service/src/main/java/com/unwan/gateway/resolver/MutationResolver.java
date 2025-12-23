package com.unwan.gateway.resolver;

import com.unwan.gateway.model.MigrationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.reactive.function.client.WebClient;

@Controller
public class MutationResolver {

    @Autowired
    private WebClient.Builder webClientBuilder;

    @MutationMapping
    public MigrationResponse migrateMail(@Argument String outlookToken, @Argument String gmailToken) {
        return callMigrationService("mail", outlookToken, gmailToken);
    }

    @MutationMapping
    public MigrationResponse migrateContacts(@Argument String outlookToken, @Argument String gmailToken) {
        return callMigrationService("contacts", outlookToken, gmailToken);
    }

    @MutationMapping
    public MigrationResponse migrateCalendar(@Argument String outlookToken, @Argument String gmailToken) {
        return callMigrationService("calendar", outlookToken, gmailToken);
    }

    @MutationMapping
    public MigrationResponse migrateDrive(@Argument String outlookToken, @Argument String gmailToken) {
        return callMigrationService("drive", outlookToken, gmailToken);
    }

    @MutationMapping
    public MigrationResponse migrateAll(@Argument String outlookToken, @Argument String gmailToken) {
        return callMigrationService("all", outlookToken, gmailToken);
    }

    private MigrationResponse callMigrationService(String migrationType, String outlookToken, String gmailToken) {
        String requestBody = String.format(
                "{\"migrationType\":\"%s\",\"outlookAccessToken\":\"%s\",\"gmailAccessToken\":\"%s\"}",
                migrationType, outlookToken, gmailToken
        );

        return webClientBuilder.build()
                .post()
                .uri("http://migration-service:8082/api/migration/start")
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(MigrationResponse.class)
                .block();
    }
}