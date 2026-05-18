package com.kestrel.sentinel.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @GetMapping("/form-options")
    public Map<String, Object> getFormOptions() {
        Map<String, Object> response = new HashMap<>();

        // You can eventually replace this by fetching from an AssetRepository!
        List<Map<String, String>> assets = List.of(
                Map.of("id", "bitcoin", "name", "Bitcoin"),
                Map.of("id", "ethereum", "name", "Ethereum"),
                Map.of("id", "solana", "name", "Solana"),
                Map.of("id", "tether", "name", "Tether"),
                Map.of("id", "binancecoin", "name", "BNB"),
                Map.of("id", "ripple", "name", "XRP"),
                Map.of("id", "cardano", "name", "Cardano"),
                Map.of("id", "dogecoin", "name", "Dogecoin"),
                Map.of("id", "polkadot", "name", "Polkadot"),
                Map.of("id", "chainlink", "name", "Chainlink"));

        // These align exactly with your Spring Boot AlertRule conditions
        List<Map<String, String>> conditions = List.of(
                Map.of("id", "DROPS_BELOW", "name", "Drops Below"),
                Map.of("id", "RISES_ABOVE", "name", "Rises Above"),
                Map.of("id", "DEVIATES", "name", "Deviation"));

        response.put("assets", assets);
        response.put("conditions", conditions);

        return response;
    }
}