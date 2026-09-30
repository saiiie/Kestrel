package com.kestrel.sentinel.service;

import com.kestrel.sentinel.model.AlertRule;
import com.kestrel.sentinel.model.AlertHistory;
import com.kestrel.sentinel.repository.AlertRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final CryptoPriceService cryptoPriceService;

    public AlertRuleService(AlertRuleRepository alertRuleRepository, org.springframework.context.ApplicationEventPublisher eventPublisher, CryptoPriceService cryptoPriceService) {
        this.alertRuleRepository = alertRuleRepository;
        this.eventPublisher = eventPublisher;
        this.cryptoPriceService = cryptoPriceService;
    }

    // 1. Create or Update a rule
    public AlertRule saveRule(AlertRule rule) {
        validateRule(rule);
        boolean isNew = rule.getId() == null;
        
        if (isNew) {
            java.util.Map<String, Double> prices = cryptoPriceService.getLatestCachedPrices();
            if (prices != null && prices.containsKey(rule.getAssetId())) {
                rule.setBaselinePrice(java.math.BigDecimal.valueOf(prices.get(rule.getAssetId())));
            }
        }
        
        AlertRule savedRule = alertRuleRepository.save(rule);
        
        if (isNew) {
            String assetName = savedRule.getAssetId().substring(0, 1).toUpperCase() + savedRule.getAssetId().substring(1);
            String conditionText = com.kestrel.sentinel.event.AlertActivityEvent.formatCondition(savedRule.getConditionType());
            String priceText = com.kestrel.sentinel.event.AlertActivityEvent.formatCurrency(savedRule.getTargetPrice());
            
            eventPublisher.publishEvent(new com.kestrel.sentinel.event.AlertActivityEvent(
                this,
                savedRule.getUser().getId(),
                savedRule.getAssetId(),
                "New Alert Rule Created",
                "Watching " + assetName + " for " + conditionText + " $" + priceText
            ));
        }
        
        return savedRule;
    }

    // 2. Fetch all rules for a specific user's frontend dashboard
    public List<AlertRule> getUserRules(Long userId) {
        return alertRuleRepository.findByUserId(userId);
    }

    // 3. Fetch ONLY the active rules (The background engine will call this
    // constantly)
    public List<AlertRule> getAllActiveRules() {
        return alertRuleRepository.findByIsActiveTrue();
    }

    // 4. Delete a rule
    public void deleteRule(Long ruleId) {
        if (ruleId != null) {
            alertRuleRepository.deleteById(ruleId);
        }
    }

    public AlertRule updateRule(Long id, AlertRule updatedData) {
        validateRule(updatedData);
        return alertRuleRepository.findById(id).map(existingRule -> {
            if (!existingRule.getAssetId().equals(updatedData.getAssetId())) {
                existingRule.setBaselinePrice(null);
            }
            existingRule.setAssetId(updatedData.getAssetId());
            existingRule.setConditionType(updatedData.getConditionType());
            existingRule.setTargetPrice(updatedData.getTargetPrice());
            existingRule.setActive(updatedData.isActive());
            
            java.util.Map<String, Double> prices = cryptoPriceService.getLatestCachedPrices();
            if (prices != null && prices.containsKey(updatedData.getAssetId())) {
                existingRule.setBaselinePrice(java.math.BigDecimal.valueOf(prices.get(updatedData.getAssetId())));
            }

            return alertRuleRepository.save(existingRule);
        }).orElseThrow(() -> new RuntimeException("Rule not found with id " + id));
    }

    private void validateRule(AlertRule rule) {
        var assets = java.util.Set.of("bitcoin", "ethereum", "solana", "tether", "binancecoin", "ripple", "cardano", "dogecoin", "polkadot", "chainlink");
        var conditions = java.util.Set.of("DROPS_BELOW", "RISES_ABOVE", "DEVIATES");
        if (rule.getAssetId() == null || !assets.contains(rule.getAssetId())
                || rule.getConditionType() == null || !conditions.contains(rule.getConditionType())
                || rule.getTargetPrice() == null || rule.getTargetPrice().signum() <= 0
                || rule.getTargetPrice().compareTo(new java.math.BigDecimal("10000000000")) >= 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid asset, condition, or target price");
        }
    }
}
