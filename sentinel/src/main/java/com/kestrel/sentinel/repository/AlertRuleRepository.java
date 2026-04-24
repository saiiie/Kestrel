package com.kestrel.sentinel.repository;

import com.kestrel.sentinel.model.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {
    
    // Finds all rules belonging to a specific user (for the frontend dashboard)
    List<AlertRule> findByUserId(Long userId);

    // Finds ALL active rules across the entire app (for our background polling engine!)
    List<AlertRule> findByIsActiveTrue();
}