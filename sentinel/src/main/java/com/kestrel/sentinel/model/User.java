package com.kestrel.sentinel.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    // This is what the Node.js dispatcher needs to send the Discord message
    @Column(name = "discord_webhook_url")
    private String discordWebhookUrl;

    // Empty constructor required by JPA
    public User() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDiscordWebhookUrl() { return discordWebhookUrl; }
    public void setDiscordWebhookUrl(String discordWebhookUrl) { this.discordWebhookUrl = discordWebhookUrl; }
}