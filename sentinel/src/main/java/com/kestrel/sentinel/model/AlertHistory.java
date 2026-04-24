package com.kestrel.sentinel.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alert_history")
public class AlertHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String assetId;
    private String title;
    private String description;
    
    @Column(updatable = false)
    private LocalDateTime triggeredAt = LocalDateTime.now();

    // Default constructor for JPA
    public AlertHistory() {}

    public AlertHistory(Long userId, String assetId, String title, String description) {
        this.userId = userId;
        this.assetId = assetId;
        this.title = title;
        this.description = description;
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getAssetId() { return assetId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getTriggeredAt() { return triggeredAt; }
}