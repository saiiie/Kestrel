package com.kestrel.sentinel.service;

import com.kestrel.sentinel.model.AlertHistory;
import com.kestrel.sentinel.repository.AlertHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertHistoryService {
    private final AlertHistoryRepository repository;

    public AlertHistoryService(AlertHistoryRepository repository) {
        this.repository = repository;
    }

    public void saveHistory(AlertHistory history) {
        repository.save(history);
    }

    public List<AlertHistory> getRecentHistory(Long userId) {
        return repository.findTop10ByUserIdOrderByTriggeredAtDesc(userId);
    }
}