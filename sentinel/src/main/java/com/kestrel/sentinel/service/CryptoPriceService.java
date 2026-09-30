package com.kestrel.sentinel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;

    @Value("${COINGECKO_API_URL}")
    private String coinGeckoUrl;
    @Value("${COINGECKO_API_KEY:}")
    private String apiKey;
    private volatile Map<String, Double> latestPrices = Map.of();

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Double> fetchLivePrices() {
        try {
            // 🌟 NEW: Use the injected variable here instead of the hardcoded string
            var headers = new org.springframework.http.HttpHeaders();
            if (apiKey != null && !apiKey.isBlank()) headers.set("x-cg-demo-api-key", apiKey);
            Map<String, Map<String, Double>> response = restTemplate.exchange(coinGeckoUrl,
                    org.springframework.http.HttpMethod.GET, new org.springframework.http.HttpEntity<>(headers), Map.class).getBody();
            Map<String, Double> prices = new HashMap<>();

            if (response != null) {
                for (String asset : response.keySet()) {
                    Object usdValue = response.get(asset).get("usd");
                    if (usdValue instanceof Number number) {
                        prices.put(asset, number.doubleValue());
                    }
                }
            }
            this.latestPrices = Map.copyOf(prices);
            return prices;
        } catch (Exception e) {
            System.err.println("Failed to fetch prices from CoinGecko: " + e.getMessage());
            return new HashMap<>();
        }
    }

    public Map<String, Double> getLatestCachedPrices() {
        return latestPrices;
    }
}
