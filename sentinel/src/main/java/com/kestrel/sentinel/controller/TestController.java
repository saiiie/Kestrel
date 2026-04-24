package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.dto.AlertPayload;
import com.kestrel.sentinel.service.AlertPublisherService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final AlertPublisherService alertPublisherService;

    // 🌟 THIS IS THE MAGIC! It pulls the URL directly from your secret properties
    // file
    @Value("${discord.test.webhook}")
    private String testWebhookUrl;

    public TestController(AlertPublisherService alertPublisherService) {
        this.alertPublisherService = alertPublisherService;
    }

    @PostMapping("/trigger")
    public String triggerTestAlert() {
        AlertPayload payload = new AlertPayload(
                testWebhookUrl, // 🌟 Now we use the secure placeholder!
                "bitcoin",
                "DROPS_BELOW",
                new BigDecimal("65000.00"),
                new BigDecimal("64500.00"));

        alertPublisherService.publishAlert(payload);
        return "🚀 Test alert injected into RabbitMQ! Go check http://localhost:15672/#/queues";
    }
}