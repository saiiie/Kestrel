package com.kestrel.sentinel.repository;

import com.kestrel.sentinel.model.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
    List<AlertHistory> findTop10ByUserIdOrderByTriggeredAtDesc(Long userId);
    List<AlertHistory> findByUserId(Long userId);
}