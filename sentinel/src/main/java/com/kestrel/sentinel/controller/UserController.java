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

    public UserController(UserRepository userRepository, EncryptionUtil encryptionUtil) {
        this.userRepository = userRepository;
        this.encryptionUtil = encryptionUtil;
    }

    @PutMapping("/{userId}/webhook")
    public ResponseEntity<?> updateWebhook(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String webhookUrl = body.get("webhookUrl");
        if (webhookUrl == null) {
            return ResponseEntity.badRequest().body("webhookUrl is required");
        }

        return userRepository.findById(userId).map(user -> {
            // 🛡️ Encrypt the webhook before saving to the database
            String encryptedWebhook = encryptionUtil.encrypt(webhookUrl);
            user.setDiscordWebhookUrl(encryptedWebhook);
            userRepository.save(user);
            
            System.out.println("🔐 Webhook for User " + userId + " has been encrypted and saved.");
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
