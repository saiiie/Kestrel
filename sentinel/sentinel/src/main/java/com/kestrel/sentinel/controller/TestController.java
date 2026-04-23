package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.dto.AlertPayload;
import com.kestrel.sentinel.service.AlertPublisherService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private final AlertPublisherService alertPublisherService;

    public TestController(AlertPublisherService alertPublisherService) {
        this.alertPublisherService = alertPublisherService;
    }

    // POST: Manually trigger a test alert to RabbitMQ
    @PostMapping("/trigger")
    public String triggerTestAlert() {
        AlertPayload payload = new AlertPayload(
                "https://discord.com/api/webhooks/your_test_url",
                "bitcoin",
                "DROPS_BELOW",
                new BigDecimal("65000.00"),
                new BigDecimal("64500.00") // Oh no, it dropped!
        );
        
        alertPublisherService.publishAlert(payload);
        return "🚀 Test alert injected into RabbitMQ! Go check http://localhost:15672/#/queues";
    }
}