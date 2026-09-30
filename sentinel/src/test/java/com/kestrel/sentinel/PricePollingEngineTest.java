package com.kestrel.sentinel;

import com.kestrel.sentinel.model.*;
import com.kestrel.sentinel.repository.AlertRuleRepository;
import com.kestrel.sentinel.service.*;
import com.kestrel.sentinel.util.EncryptionUtil;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import java.math.BigDecimal;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

class PricePollingEngineTest {
    CryptoPriceService prices = mock(CryptoPriceService.class);
    AlertRuleRepository rules = mock(AlertRuleRepository.class);
    AlertPublisherService publisher = mock(AlertPublisherService.class);
    ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    EncryptionUtil encryption = mock(EncryptionUtil.class);
    PricePollingEngine engine = new PricePollingEngine(prices, rules, events, publisher, encryption);

    AlertRule rule(long id, String secret) {
        User user = new User(); user.setId(id); user.setDiscordWebhookUrl(secret);
        AlertRule rule = new AlertRule(); rule.setId(id); rule.setUser(user);
        rule.setAssetId("bitcoin"); rule.setConditionType("RISES_ABOVE"); rule.setTargetPrice(BigDecimal.TEN);
        return rule;
    }

    @Test void refreshesDashboardPricesWithNoRules() {
        when(rules.findByIsActiveTrue()).thenReturn(List.of());
        when(prices.fetchLivePrices()).thenReturn(Map.of("bitcoin", 20d));
        engine.evaluateRules();
        verify(prices).fetchLivePrices();
    }

    @Test void publicationFailureLeavesRuleActive() {
        AlertRule rule = rule(1L, "encrypted");
        when(rules.findByIsActiveTrue()).thenReturn(List.of(rule));
        when(prices.fetchLivePrices()).thenReturn(Map.of("bitcoin", 20d));
        when(encryption.decrypt("encrypted")).thenReturn("https://discord.com/api/webhooks/123/token");
        doThrow(new IllegalStateException("broker offline")).when(publisher).publishAlert(any());
        engine.evaluateRules();
        assertTrue(rule.isActive());
        verify(rules, never()).save(any());
        verifyNoInteractions(events);
    }

    @Test void missingWebhookDoesNotBlockOtherUsers() {
        AlertRule first = rule(1L, null), second = rule(2L, "encrypted");
        when(rules.findByIsActiveTrue()).thenReturn(List.of(first, second));
        when(prices.fetchLivePrices()).thenReturn(Map.of("bitcoin", 20d));
        when(encryption.decrypt("encrypted")).thenReturn("https://discord.com/api/webhooks/123/token");
        engine.evaluateRules();
        assertTrue(first.isActive()); assertFalse(second.isActive());
        var ordered = inOrder(publisher, rules);
        ordered.verify(publisher).publishAlert(any());
        ordered.verify(rules).save(second);
    }
}
