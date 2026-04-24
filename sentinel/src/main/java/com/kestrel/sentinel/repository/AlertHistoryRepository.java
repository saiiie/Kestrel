package main.java.com.kestrel.sentinel.repository;

import com.kestrel.sentinel.model.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
    // Automatically generates a SQL query to get the newest 10 alerts for a
    // specific user
    List<AlertHistory> findTop10ByUserIdOrderByTriggeredAtDesc(Long userId);
}