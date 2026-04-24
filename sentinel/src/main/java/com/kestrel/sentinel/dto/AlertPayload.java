package com.kestrel.sentinel.dto;

import java.math.BigDecimal;

public record AlertPayload(
    String discordWebhookUrl,
    String assetId,
    String conditionType,
    BigDecimal targetPrice,
    BigDecimal currentLivePrice
) {}