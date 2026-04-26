package com.kestrel.sentinel.config;

import com.kestrel.sentinel.model.User;
import com.kestrel.sentinel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * THIS IS FOR DEVELOPMENT/TESTING ONLY.
 * Ensures a test user exists so the frontend 'userId = 1' hardcoding works.
 */
@Configuration
public class DataInitializer {

    @org.springframework.beans.factory.annotation.Value("${discord.test.webhook}")
    private String testWebhook;

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Check if any user exists, if not create the default one
            userRepository.findByEmail("dev@kestrel.ai").ifPresentOrElse(
                user -> {
                    if (user.getDiscordWebhookUrl() == null || user.getDiscordWebhookUrl().isEmpty()) {
                        user.setDiscordWebhookUrl(testWebhook);
                        userRepository.save(user);
                        System.out.println("🔄 KESTREL SEED: Updated existing test user with Discord Webhook");
                    }
                },
                () -> {
                    User testUser = new User();
                    testUser.setEmail("dev@kestrel.ai");
                    testUser.setPasswordHash("no_password_yet");
                    testUser.setDiscordWebhookUrl(testWebhook);

                    userRepository.save(testUser);
                    System.out.println("--------------------------------------------------");
                    System.out.println("🚀 KESTREL SEED: Created default test user (ID: 1) with Discord Webhook");
                    System.out.println("--------------------------------------------------");
                }
            );
        };
    }
}
