package com.unwan.migration.controller;

import com.unwan.migration.model.MigrationResponse;
import com.unwan.migration.service.RealMailMigrationService;
import com.unwan.migration.service.RealContactMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private RealMailMigrationService mailService;

    @Autowired
    private RealContactMigrationService contactService;

    @GetMapping("/test-mail")
    public MigrationResponse testMailMigration(@RequestParam String outlookToken, @RequestParam String gmailToken) {
        try {
            System.out.println("🧪 Testing mail migration...");

            // Test folder fetch
            var folders = mailService.fetchOutlookFolders(outlookToken);
            System.out.println("📁 Folders found: " + folders);

            // Test email fetch from first folder
            if (!folders.isEmpty()) {
                var emails = mailService.fetchOutlookMails(outlookToken, folders.get(0));
                System.out.println("📧 Emails found: " + emails.size());

                // Test migration
                String result = mailService.pushToGmail(emails, gmailToken);
                return new MigrationResponse("success", result, "debug-test");
            }

            return new MigrationResponse("error", "No folders found", "debug-test");

        } catch (Exception e) {
            return new MigrationResponse("error", "Test failed: " + e.getMessage(), "debug-test");
        }
    }

    @GetMapping("/test-contacts")
    public MigrationResponse testContactMigration(@RequestParam String outlookToken, @RequestParam String gmailToken) {
        try {
            System.out.println("🧪 Testing contact migration...");

            var contacts = contactService.fetchOutlookContacts(outlookToken);
            System.out.println("👤 Contacts found: " + contacts.size());

            String result = contactService.pushToGoogleContacts(contacts, gmailToken);
            return new MigrationResponse("success", result, "debug-test");

        } catch (Exception e) {
            return new MigrationResponse("error", "Test failed: " + e.getMessage(), "debug-test");
        }
    }
}