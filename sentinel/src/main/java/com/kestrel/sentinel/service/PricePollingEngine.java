package com.kestrel.sentinel.service;

import com.kestrel.sentinel.util.EncryptionUtil;
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
    private final EncryptionUtil encryptionUtil;

    public PricePollingEngine(CryptoPriceService priceService,
            AlertRuleRepository ruleRepository,
            org.springframework.context.ApplicationEventPublisher eventPublisher,
            RabbitTemplate rabbitTemplate,
            EncryptionUtil encryptionUtil) {
        this.priceService = priceService;
        this.ruleRepository = ruleRepository;
        this.eventPublisher = eventPublisher;
        this.rabbitTemplate = rabbitTemplate;
        this.encryptionUtil = encryptionUtil;
    }

    @Scheduled(fixedDelay = 15000)
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
            case "DEVIATES" -> {
                BigDecimal baseline = rule.getBaselinePrice();
                if (baseline == null) {
                    // Fallback for older alerts: save current price as baseline and skip this evaluation cycle
                    rule.setBaselinePrice(current);
                    ruleRepository.save(rule);
                    yield false;
                }
                // Check if absolute difference between live price and baseline is greater than target (threshold)
                yield current.subtract(baseline).abs().compareTo(target) > 0;
            }
            default -> false;
        };
    }

    private void triggerAlert(AlertRule rule, Double currentPrice) {
        System.out.println("🚨 ALERT TRIGGERED: " + rule.getAssetId() + " hit " + currentPrice);

        // 1. Save to Database (This will instantly show up in our React Dashboard!)
        String assetName = rule.getAssetId().substring(0, 1).toUpperCase() + rule.getAssetId().substring(1);
        String title = assetName + " Alert Triggered";
        
        String conditionText = com.kestrel.sentinel.event.AlertActivityEvent.formatCondition(rule.getConditionType());
        String currentPriceText = com.kestrel.sentinel.event.AlertActivityEvent.formatCurrency(currentPrice);
        String targetPriceText = com.kestrel.sentinel.event.AlertActivityEvent.formatCurrency(rule.getTargetPrice());

        String description = "Price reached $" + currentPriceText + " (" + conditionText + " $" + targetPriceText + ")";

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
        // 🔓 Decrypt the webhook URL before sending it to the dispatcher
        String plainWebhook = encryptionUtil.decrypt(rule.getUser().getDiscordWebhookUrl()).trim();

        com.kestrel.sentinel.dto.AlertPayload payload = new com.kestrel.sentinel.dto.AlertPayload(
                plainWebhook,
                rule.getAssetId(),
                rule.getConditionType(),
                rule.getTargetPrice(),
                BigDecimal.valueOf(currentPrice)
        );

        rabbitTemplate.convertAndSend(com.kestrel.sentinel.config.RabbitConfig.QUEUE_NAME, payload);

        System.out.println("✅ Sent AlertPayload to RabbitMQ for " + rule.getAssetId());
    }
}