package main.java.com.kestrel.sentinel.controller;

import com.kestrel.sentinel.model.AlertHistory;
import com.kestrel.sentinel.service.AlertHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class AlertHistoryController {

    private final AlertHistoryService alertHistoryService;

    public AlertHistoryController(AlertHistoryService alertHistoryService) {
        this.alertHistoryService = alertHistoryService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AlertHistory>> getUserHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(alertHistoryService.getRecentHistory(userId));
    }
}