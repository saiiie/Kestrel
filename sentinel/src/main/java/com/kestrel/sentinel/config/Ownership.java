package com.kestrel.sentinel.config;

import com.kestrel.sentinel.model.User;
import com.kestrel.sentinel.repository.AlertRuleRepository;
import com.kestrel.sentinel.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component("ownership")
public class Ownership {
    private final UserRepository users;
    private final AlertRuleRepository rules;

    public Ownership(UserRepository users, AlertRuleRepository rules) {
        this.users = users;
        this.rules = rules;
    }

    public User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }
        try {
            return users.findById(Long.valueOf(authentication.getName()))
                    .orElseThrow(() -> new AccessDeniedException("Account no longer exists"));
        } catch (NumberFormatException e) {
            throw new AccessDeniedException("Invalid account");
        }
    }

    public boolean isUser(Long userId) {
        return currentUser().getId().equals(userId);
    }

    public boolean isRuleOwner(Long ruleId) {
        Long userId = currentUser().getId();
        return rules.findById(ruleId)
                .map(rule -> rule.getUser().getId().equals(userId)).orElse(false);
    }
}
