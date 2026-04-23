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
            // Convert our Java record into a clean JSON string for Node.js
            String jsonMessage = objectMapper.writeValueAsString(payload);
            
            // Drop it into the RabbitMQ queue
            rabbitTemplate.convertAndSend(QUEUE_NAME, jsonMessage);
            
            System.out.println("🚀 ALERT DISPATCHED to RabbitMQ: " + payload.assetId());
        } catch (Exception e) {
            System.err.println("Failed to publish alert to RabbitMQ: " + e.getMessage());
        }
    }
}