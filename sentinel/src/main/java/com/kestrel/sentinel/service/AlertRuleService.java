package com.kestrel.sentinel.service;

import com.kestrel.sentinel.model.AlertRule;
import com.kestrel.sentinel.repository.AlertRuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;

    public AlertRuleService(AlertRuleRepository alertRuleRepository) {
        this.alertRuleRepository = alertRuleRepository;
    }

    // 1. Create or Update a rule
    public AlertRule saveRule(AlertRule rule) {
        return alertRuleRepository.save(rule);
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