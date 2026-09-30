package com.kestrel.sentinel;

import com.kestrel.sentinel.config.*;
import com.kestrel.sentinel.controller.*;
import com.kestrel.sentinel.model.*;
import com.kestrel.sentinel.repository.*;
import com.kestrel.sentinel.service.*;
import com.kestrel.sentinel.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({UserController.class, AlertRuleController.class, AlertHistoryController.class})
@Import({SecurityConfig.class, JWTFilter.class, Ownership.class})
class ApiSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserRepository users;
    @MockitoBean AlertRuleRepository rules;
    @MockitoBean AlertHistoryRepository history;
    @MockitoBean AlertRuleService ruleService;
    @MockitoBean AlertPublisherService publisher;
    @MockitoBean EncryptionUtil encryption;
    @MockitoBean JwtUtil jwt;
    User owner;

    @BeforeEach void setup() {
        owner = new User(); owner.setId(1L); owner.setEmail("one@example.com"); owner.setUsername("one");
        when(jwt.extractUserId("valid")).thenReturn(1L);
        when(users.existsById(1L)).thenReturn(true);
        when(users.findById(1L)).thenReturn(Optional.of(owner));
        User other = new User(); other.setId(2L);
        AlertRule rule = new AlertRule(); rule.setId(22L); rule.setUser(other);
        when(rules.findById(22L)).thenReturn(Optional.of(rule));
    }

    @Test void requiresAuthentication() throws Exception {
        mvc.perform(get("/api/users/1")).andExpect(status().isUnauthorized());
    }

    @Test void blocksEveryCrossAccountRoute() throws Exception {
        for (String path : List.of("/api/users/2", "/api/rules/user/2", "/api/history/user/2")) {
            mvc.perform(get(path).header("Authorization", "Bearer valid")).andExpect(status().isForbidden());
        }
        for (String path : List.of("/api/users/2", "/api/history/user/2", "/api/rules/22")) {
            mvc.perform(delete(path).header("Authorization", "Bearer valid")).andExpect(status().isForbidden());
        }
        for (String path : List.of("/api/users/2/profile", "/api/users/2/password", "/api/users/2/webhook", "/api/rules/22")) {
            mvc.perform(put(path).header("Authorization", "Bearer valid").contentType("application/json").content("{}"))
                    .andExpect(status().isForbidden());
        }
        verifyNoInteractions(ruleService, history, publisher);
    }

    @Test void allowsOwnProfileAndRejectsDeletedAccounts() throws Exception {
        mvc.perform(get("/api/users/1").header("Authorization", "Bearer valid"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1));
        when(users.existsById(1L)).thenReturn(false);
        mvc.perform(get("/api/users/1").header("Authorization", "Bearer valid")).andExpect(status().isUnauthorized());
    }

    @Test void cannotAssignOrOverwriteSomeoneElsesRuleOnCreate() throws Exception {
        when(ruleService.saveRule(any())).thenAnswer(invocation -> {
            AlertRule rule = invocation.getArgument(0);
            org.junit.jupiter.api.Assertions.assertNull(rule.getId());
            org.junit.jupiter.api.Assertions.assertEquals(1L, rule.getUser().getId());
            return rule;
        });
        mvc.perform(post("/api/rules").header("Authorization", "Bearer valid").contentType("application/json")
                .content("{\"id\":22,\"user\":{\"id\":2},\"assetId\":\"bitcoin\",\"conditionType\":\"RISES_ABOVE\",\"targetPrice\":10}"))
                .andExpect(status().isOk());
        verify(ruleService).saveRule(any());
    }

    @Test void refusesArbitraryWebhookDestinations() throws Exception {
        mvc.perform(post("/api/users/test-webhook").header("Authorization", "Bearer valid").contentType("application/json")
                .content("{\"webhookUrl\":\"http://127.0.0.1/admin\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(publisher);
    }

    @Test void userSerializationNeverIncludesSecrets() throws Exception {
        owner.setPasswordHash("secret-hash"); owner.setDiscordWebhookUrl("secret-webhook");
        String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(owner);
        org.junit.jupiter.api.Assertions.assertFalse(json.contains("secret"));
    }
}
