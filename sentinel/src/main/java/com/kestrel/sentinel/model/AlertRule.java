package com.kestrel.sentinel.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "alert_rules")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Links this rule to a specific User
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String assetId; // e.g., "bitcoin", "ethereum"

    @Column(nullable = false)
    private String conditionType; // e.g., "DROPS_BELOW" or "RISES_ABOVE"

    @Column(nullable = false, precision = 18, scale = 8)
    private BigDecimal targetPrice; // BigDecimal prevents rounding errors with crypto!

    @Column(nullable = false)
    private boolean isActive = true; // For the toggle switch on your frontend dashboard

    // Empty constructor required by JPA
    public AlertRule() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getAssetId() { return assetId; }
    public void setAssetId(String assetId) { this.assetId = assetId; }

    public String getConditionType() { return conditionType; }
    public void setConditionType(String conditionType) { this.conditionType = conditionType; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}