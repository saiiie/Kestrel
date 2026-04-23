package com.kestrel.sentinel.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
public class MarketDataService {

    private final RestTemplate restTemplate;
    // CoinGecko's simple price API
    private static final String COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd";

    public MarketDataService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, BigDecimal> fetchLivePrices(Set<String> assetIds) {
        if (assetIds.isEmpty())
            return new HashMap<>();

        // Join the set of assets into a comma-separated string (e.g.,
        // "bitcoin,ethereum")
        String idsParam = String.join(",", assetIds);
        String url = COINGECKO_URL.replace("{ids}", idsParam);

        try {
            // Fetch the JSON and map it to a Java Map object
            Map<String, Map<String, Number>> response = restTemplate.getForObject(url, Map.class);
            Map<String, BigDecimal> prices = new HashMap<>();

            if (response != null) {
                for (String asset : assetIds) {
                    if (response.containsKey(asset) && response.get(asset).containsKey("usd")) {
                        prices.put(asset, new BigDecimal(response.get(asset).get("usd").toString()));
                    }
                }
            }
            return prices; // Returns a clean map: { "bitcoin": 65000.00, "ethereum": 3500.00 }
        } catch (Exception e) {
            System.err.println("CoinGecko API Error: " + e.getMessage());
            return new HashMap<>();
        }
    }
}