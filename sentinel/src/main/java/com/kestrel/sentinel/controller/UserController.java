package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.model.User;
import com.kestrel.sentinel.repository.UserRepository;
import com.kestrel.sentinel.util.EncryptionUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final EncryptionUtil encryptionUtil;
    private final com.kestrel.sentinel.service.AlertPublisherService alertPublisherService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.kestrel.sentinel.repository.AlertRuleRepository alertRuleRepository;
    private final com.kestrel.sentinel.repository.AlertHistoryRepository alertHistoryRepository;

    public UserController(UserRepository userRepository, EncryptionUtil encryptionUtil, com.kestrel.sentinel.service.AlertPublisherService alertPublisherService, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder, com.kestrel.sentinel.repository.AlertRuleRepository alertRuleRepository, com.kestrel.sentinel.repository.AlertHistoryRepository alertHistoryRepository) {
        this.userRepository = userRepository;
        this.encryptionUtil = encryptionUtil;
        this.alertPublisherService = alertPublisherService;
        this.passwordEncoder = passwordEncoder;
        this.alertRuleRepository = alertRuleRepository;
        this.alertHistoryRepository = alertHistoryRepository;
    }

    @PostMapping("/test-webhook")
    public ResponseEntity<?> testWebhook(@RequestBody Map<String, String> body) {
        String webhookUrl = body.get("webhookUrl");
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            return ResponseEntity.badRequest().body("webhookUrl is required");
        }

        // 🛡️ Trim to remove any accidental whitespace from copy-paste
        webhookUrl = webhookUrl.trim();

        // 🛡️ Even for a test, we follow the encryption pattern
        String encryptedWebhook = encryptionUtil.encrypt(webhookUrl);
        
        // 🔓 Decrypt it back for the payload (simulating the real alert flow)
        String plainWebhook = encryptionUtil.decrypt(encryptedWebhook).trim();

        System.out.println("🧪 DEBUG: Decrypted webhook (masked): " + plainWebhook.substring(0, 20) + "...");

        com.kestrel.sentinel.dto.AlertPayload payload = new com.kestrel.sentinel.dto.AlertPayload(
                plainWebhook,
                "TEST_ASSET",
                "TEST_CONNECTION",
                java.math.BigDecimal.ZERO,
                java.math.BigDecimal.ZERO
        );

        alertPublisherService.publishAlert(payload);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/webhook")
    public ResponseEntity<?> updateWebhook(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String webhookUrl = body.get("webhookUrl");
        if (webhookUrl == null) {
            return ResponseEntity.badRequest().body("webhookUrl is required");
        }

        return userRepository.findById(userId).map(user -> {
            // 🛡️ Encrypt the webhook before saving to the database
            String encryptedWebhook = encryptionUtil.encrypt(webhookUrl.trim());
            user.setDiscordWebhookUrl(encryptedWebhook);
            userRepository.save(user);
            
            System.out.println("🔐 Webhook for User " + userId + " has been encrypted and saved.");
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            String plainWebhook = "";
            if (user.getDiscordWebhookUrl() != null && !user.getDiscordWebhookUrl().isEmpty()) {
                try {
                    plainWebhook = encryptionUtil.decrypt(user.getDiscordWebhookUrl()).trim();
                } catch (Exception e) {
                    System.err.println("Failed to decrypt webhook for user " + userId + ": " + e.getMessage());
                }
            }
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "discordWebhookUrl", plainWebhook
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");

        if (username == null || email == null || username.trim().isEmpty() || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and email are required"));
        }

        return userRepository.findById(userId).map(user -> {
            user.setUsername(username.trim());
            user.setEmail(email.trim());
            try {
                userRepository.save(user);
                return ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail()
                ));
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username or email already exists"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Old and new passwords are required"));
        }

        return userRepository.findById(userId).map(user -> {
            if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Incorrect old password"));
            }
            if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("error", "New password cannot be the same as the old password"));
            }

            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        
        // Clean up all associated alert rules and alert history to prevent orphaned records
        alertRuleRepository.deleteAll(alertRuleRepository.findByUserId(userId));
        alertHistoryRepository.deleteAll(alertHistoryRepository.findByUserId(userId));
        
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
