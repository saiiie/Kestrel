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

    public UserController(UserRepository userRepository, EncryptionUtil encryptionUtil, com.kestrel.sentinel.service.AlertPublisherService alertPublisherService) {
        this.userRepository = userRepository;
        this.encryptionUtil = encryptionUtil;
        this.alertPublisherService = alertPublisherService;
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
}
