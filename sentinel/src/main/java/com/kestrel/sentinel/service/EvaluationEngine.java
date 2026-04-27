package com.kestrel.sentinel.service;

import com.kestrel.sentinel.util.EncryptionUtil;
import com.kestrel.sentinel.dto.AlertPayload;
import com.kestrel.sentinel.model.AlertRule;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EvaluationEngine {

    private final AlertRuleService ruleService;
    private final MarketDataService marketDataService;
    private final AlertPublisherService publisherService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final EncryptionUtil encryptionUtil;

    public EvaluationEngine(AlertRuleService ruleService, MarketDataService marketDataService,
            AlertPublisherService publisherService, org.springframework.context.ApplicationEventPublisher eventPublisher,
            EncryptionUtil encryptionUtil) {
        this.ruleService = ruleService;
        this.marketDataService = marketDataService;
        this.publisherService = publisherService;
        this.eventPublisher = eventPublisher;
        this.encryptionUtil = encryptionUtil;
    }

    // This loop executes automatically every 30,000 milliseconds (30 seconds)
    @Scheduled(fixedRate = 30000)
    public void evaluateMarketRules() {
        // 1. Get all active rules from NeonDB
        List<AlertRule> activeRules = ruleService.getAllActiveRules();
        if (activeRules.isEmpty())
            return;

        // 2. Extract just the unique asset names so we don't spam CoinGecko
        Set<String> assetsToFetch = activeRules.stream()
                .map(AlertRule::getAssetId)
                .collect(Collectors.toSet());

        // 3. Fetch the live prices
        Map<String, BigDecimal> livePrices = marketDataService.fetchLivePrices(assetsToFetch);

        // 4. Cross-reference live prices against user rules
        for (AlertRule rule : activeRules) {
            BigDecimal livePrice = livePrices.get(rule.getAssetId());
            if (livePrice == null)
                continue;

            boolean thresholdCrossed = false;

            if ("DROPS_BELOW".equals(rule.getConditionType()) && livePrice.compareTo(rule.getTargetPrice()) <= 0) {
                thresholdCrossed = true;
            } else if ("RISES_ABOVE".equals(rule.getConditionType())
                    && livePrice.compareTo(rule.getTargetPrice()) >= 0) {
                thresholdCrossed = true;
            }

            // 5. STRIKE! 🦅
            if (thresholdCrossed) {
                // 🔓 Decrypt the webhook URL before sending it to the dispatcher
                String plainWebhook = encryptionUtil.decrypt(rule.getUser().getDiscordWebhookUrl());

                AlertPayload payload = new AlertPayload(
                        plainWebhook, // Grabs the user's specific Discord link!
                        rule.getAssetId(),
                        rule.getConditionType(),
                        rule.getTargetPrice(),
                        livePrice);

                // Drop into RabbitMQ
                publisherService.publishAlert(payload);

                // Publish trigger event for Activity Feed
                String assetName = rule.getAssetId().substring(0, 1).toUpperCase() + rule.getAssetId().substring(1);
                String title = assetName + " Alert Triggered";
                
                String conditionText = com.kestrel.sentinel.event.AlertActivityEvent.formatCondition(rule.getConditionType());
                String livePriceText = com.kestrel.sentinel.event.AlertActivityEvent.formatCurrency(livePrice);
                String targetPriceText = com.kestrel.sentinel.event.AlertActivityEvent.formatCurrency(rule.getTargetPrice());
                
                String description = "Price reached $" + livePriceText + " (" + conditionText + " $" + targetPriceText + ")";
                
                eventPublisher.publishEvent(new com.kestrel.sentinel.event.AlertActivityEvent(
                    this,
                    rule.getUser().getId(),
                    rule.getAssetId(),
                    title,
                    description
                ));

                // Auto-pause the rule so it doesn't spam their Discord every 30 seconds
                rule.setActive(false);
                ruleService.saveRule(rule);
            }
        }
    }
}