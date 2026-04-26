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
}
