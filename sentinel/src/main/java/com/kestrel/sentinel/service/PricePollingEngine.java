package com.kestrel.sentinel.service;

import com.kestrel.sentinel.model.AlertRule;
import com.kestrel.sentinel.repository.AlertRuleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;

import java.util.List;
import java.util.Map;

@Component
public class PricePollingEngine {

    private final CryptoPriceService priceService;
    private final AlertRuleRepository ruleRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final RabbitTemplate rabbitTemplate;

    public PricePollingEngine(CryptoPriceService priceService,
            AlertRuleRepository ruleRepository,
            org.springframework.context.ApplicationEventPublisher eventPublisher,
            RabbitTemplate rabbitTemplate) {
        this.priceService = priceService;
        this.ruleRepository = ruleRepository;
        this.eventPublisher = eventPublisher;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Scheduled(fixedDelay = 60000)
    public void evaluateRules() {
        List<AlertRule> activeRules = ruleRepository.findByIsActiveTrue();

        if (activeRules.isEmpty()) {
            System.out.println("😴 Kestrel Engine: No active rules to evaluate. Sleeping...");
            return;
        }

        System.out.println("⏳ Kestrel Engine: Found " + activeRules.size() + " active rules. Fetching live prices...");
        Map<String, Double> livePrices = priceService.fetchLivePrices();

        if (livePrices.isEmpty()) {
            System.out.println("⚠️ Could not fetch prices. Skipping this cycle.");
            return;
        }

        System.out.println("🔍 Evaluating rules...");

        for (AlertRule rule : activeRules) {
            Double currentPrice = livePrices.get(rule.getAssetId());

            if (currentPrice != null && isConditionMet(rule, currentPrice)) {
                triggerAlert(rule, currentPrice);
            }
        }
    }

    private boolean isConditionMet(AlertRule rule, Double currentPrice) {
        BigDecimal current = BigDecimal.valueOf(currentPrice);
        BigDecimal target = rule.getTargetPrice();

        return switch (rule.getConditionType()) {
            case "DROPS_BELOW" -> current.compareTo(target) < 0;
            case "RISES_ABOVE" -> current.compareTo(target) > 0;
            case "DEVIATES" -> current.subtract(target).abs().compareTo(BigDecimal.valueOf(0.05)) > 0;
            default -> false;
        };
    }

    private void triggerAlert(AlertRule rule, Double currentPrice) {
        System.out.println("🚨 ALERT TRIGGERED: " + rule.getAssetId() + " hit " + currentPrice);

        // 1. Save to Database (This will instantly show up in our React Dashboard!)
        String title = rule.getAssetId().substring(0, 1).toUpperCase() + rule.getAssetId().substring(1)
                + " Alert Triggered";
        String description = "Price reached $" + currentPrice + " (" + rule.getConditionType() + " $"
                + rule.getTargetPrice() + ")";

        eventPublisher.publishEvent(new com.kestrel.sentinel.event.AlertActivityEvent(
            this,
            rule.getUser().getId(),
            rule.getAssetId(),
            title,
            description
        ));

        // 2. Disable the rule so it doesn't trigger every 60 seconds forever
        rule.setActive(false);
        ruleRepository.save(rule);

        // 3. Publish to RabbitMQ for Discord Webhook!
        com.kestrel.sentinel.dto.AlertPayload payload = new com.kestrel.sentinel.dto.AlertPayload(
                rule.getUser().getDiscordWebhookUrl(),
                rule.getAssetId(),
                rule.getConditionType(),
                rule.getTargetPrice(),
                BigDecimal.valueOf(currentPrice)
        );

        rabbitTemplate.convertAndSend(com.kestrel.sentinel.config.RabbitConfig.QUEUE_NAME, payload);

        System.out.println("✅ Sent AlertPayload to RabbitMQ for " + rule.getAssetId());
    }
}