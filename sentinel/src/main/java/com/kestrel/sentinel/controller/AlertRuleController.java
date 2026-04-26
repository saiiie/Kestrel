package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.model.AlertRule;
import com.kestrel.sentinel.service.AlertRuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
public class AlertRuleController {

    private final AlertRuleService alertRuleService;

    public AlertRuleController(AlertRuleService alertRuleService) {
        this.alertRuleService = alertRuleService;
    }

    // POST: Create a new alert rule
    @PostMapping
    public ResponseEntity<AlertRule> createRule(@RequestBody AlertRule rule) {
        AlertRule savedRule = alertRuleService.saveRule(rule);
        return ResponseEntity.ok(savedRule);
    }

    // GET: Fetch all rules for a specific dashboard
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AlertRule>> getUserRules(@PathVariable Long userId) {
        return ResponseEntity.ok(alertRuleService.getUserRules(userId));
    }

    // DELETE: Remove a rule when the user clicks the trash can icon
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long ruleId) {
        alertRuleService.deleteRule(ruleId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlertRule> updateRule(@PathVariable Long id, @RequestBody AlertRule updatedRule) {
        return ResponseEntity.ok(alertRuleService.updateRule(id, updatedRule));
    }
}