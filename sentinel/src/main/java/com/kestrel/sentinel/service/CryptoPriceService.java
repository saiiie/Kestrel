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
    private Map<String, Double> latestPrices = new HashMap<>();

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Double> fetchLivePrices() {
        try {
            // 🌟 NEW: Use the injected variable here instead of the hardcoded string
            Map<String, Map<String, Double>> response = restTemplate.getForObject(coinGeckoUrl, Map.class);
            Map<String, Double> prices = new HashMap<>();

            if (response != null) {
                for (String asset : response.keySet()) {
                    Object usdValue = response.get(asset).get("usd");
                    if (usdValue instanceof Number number) {
                        prices.put(asset, number.doubleValue());
                    }
                }
            }
            this.latestPrices = prices;
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