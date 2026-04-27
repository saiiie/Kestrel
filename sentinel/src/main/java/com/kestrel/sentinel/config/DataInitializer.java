package com.kestrel.sentinel.config;

import com.kestrel.sentinel.model.User;
import com.kestrel.sentinel.repository.UserRepository;
import com.kestrel.sentinel.util.EncryptionUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * THIS IS FOR DEVELOPMENT/TESTING ONLY.
 * Ensures a test user exists so the frontend 'userId = 1' hardcoding works.
 */
@Configuration
public class DataInitializer {

    private final UserRepository userRepository;
    private final EncryptionUtil encryptionUtil;

    @org.springframework.beans.factory.annotation.Value("${discord.test.webhook}")
    private String testWebhook;

    public DataInitializer(UserRepository userRepository, EncryptionUtil encryptionUtil) {
        this.userRepository = userRepository;
        this.encryptionUtil = encryptionUtil;
    }

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            // Check if any user exists, if not create the default one
            userRepository.findById(1L).ifPresentOrElse(
                user -> {
                    boolean needsUpdate = false;
                    
                    if (user.getUsername() == null) {
                        user.setUsername("KestrelAdmin");
                        needsUpdate = true;
                    }
                    
                    if (user.getDiscordWebhookUrl() == null || user.getDiscordWebhookUrl().startsWith("http")) {
                        user.setDiscordWebhookUrl(encryptionUtil.encrypt(testWebhook));
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate) {
                        userRepository.save(user);
                        System.out.println("🔄 KESTREL SEED: Updated existing test user (ID: 1) with username/encrypted webhook");
                    }
                },
                () -> {
                    User testUser = new User();
                    testUser.setId(1L);
                    testUser.setUsername("KestrelAdmin");
                    testUser.setEmail("admin@kestrel.io");
                    testUser.setPasswordHash("argon2_hash_placeholder");
                    testUser.setDiscordWebhookUrl(encryptionUtil.encrypt(testWebhook));

                    userRepository.save(testUser);
                    System.out.println("--------------------------------------------------");
                    System.out.println("🚀 KESTREL SEED: Created default test user (ID: 1) with Encrypted Webhook");
                    System.out.println("--------------------------------------------------");
                }
            );
        };
    }
}
