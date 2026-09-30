package com.kestrel.sentinel.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kestrel.sentinel.dto.AlertPayload;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class AlertPublisherService {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    // The name of the queue your Node.js worker will be listening to
    private static final String QUEUE_NAME = "kestrel-alerts-queue";

    public AlertPublisherService(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishAlert(AlertPayload payload) {
        try {
            // Drop it into the RabbitMQ queue
            // The Jackson2JsonMessageConverter we configured in RabbitConfig will handle the JSON conversion
            var correlation = new org.springframework.amqp.rabbit.connection.CorrelationData();
            rabbitTemplate.convertAndSend("", QUEUE_NAME, payload, correlation);
            var confirm = correlation.getFuture().get(10, java.util.concurrent.TimeUnit.SECONDS);
            if (!confirm.isAck() || correlation.getReturned() != null) {
                throw new IllegalStateException("Alert was not accepted by the queue");
            }
            
            System.out.println("🚀 ALERT DISPATCHED to RabbitMQ: " + payload.assetId());
        } catch (Exception e) {
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("Failed to publish alert to RabbitMQ", e);
        }
    }
}
