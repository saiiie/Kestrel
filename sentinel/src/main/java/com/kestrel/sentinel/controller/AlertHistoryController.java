package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.model.AlertHistory;
import com.kestrel.sentinel.repository.AlertHistoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class AlertHistoryController {

    private final AlertHistoryRepository historyRepository;

    public AlertHistoryController(AlertHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @GetMapping("/user/{userId}")
    public List<AlertHistory> getUserHistory(@PathVariable Long userId) {
        return historyRepository.findTop10ByUserIdOrderByTriggeredAtDesc(userId);
    }

    @DeleteMapping("/user/{userId}")
    public void deleteUserHistory(@PathVariable Long userId) {
        // In a real app, you'd only delete history for this specific user.
        // For this prototype, we'll clear everything or just the user's records.
        historyRepository.deleteAll(historyRepository.findByUserId(userId));
    }
}