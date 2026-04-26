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

    public AlertRuleService(AlertRuleRepository alertRuleRepository, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.alertRuleRepository = alertRuleRepository;
        this.eventPublisher = eventPublisher;
    }

    // 1. Create or Update a rule
    public AlertRule saveRule(AlertRule rule) {
        boolean isNew = rule.getId() == null;
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
        return alertRuleRepository.findById(id).map(existingRule -> {
            existingRule.setAssetId(updatedData.getAssetId());
            existingRule.setConditionType(updatedData.getConditionType());
            existingRule.setTargetPrice(updatedData.getTargetPrice());
            existingRule.setActive(updatedData.isActive());
            return alertRuleRepository.save(existingRule);
        }).orElseThrow(() -> new RuntimeException("Rule not found with id " + id));
    }
}