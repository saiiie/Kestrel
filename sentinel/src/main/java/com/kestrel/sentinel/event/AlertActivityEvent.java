package com.kestrel.sentinel.event;

import org.springframework.context.ApplicationEvent;

public class AlertActivityEvent extends ApplicationEvent {
    private final Long userId;
    private final String assetId;
    private final String title;
    private final String description;

    public AlertActivityEvent(Object source, Long userId, String assetId, String title, String description) {
        super(source);
        this.userId = userId;
        this.assetId = assetId;
        this.title = title;
        this.description = description;
    }

    public Long getUserId() { return userId; }
    public String getAssetId() { return assetId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }

    public static String formatCurrency(Object amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", new java.math.BigDecimal(amount.toString()));
    }

    public static String formatCondition(String condition) {
        if (condition == null) return "";
        return switch (condition) {
            case "DROPS_BELOW" -> "dip below";
            case "RISES_ABOVE" -> "surge past";
            case "DEVIATES" -> "deviate from";
            default -> condition.toLowerCase().replace("_", " ");
        };
    }
}
