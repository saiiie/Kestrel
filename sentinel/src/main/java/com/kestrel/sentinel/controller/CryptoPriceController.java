package com.kestrel.sentinel.controller;

import com.kestrel.sentinel.service.CryptoPriceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/prices")
public class CryptoPriceController {

    private final CryptoPriceService priceService;

    public CryptoPriceController(CryptoPriceService priceService) {
        this.priceService = priceService;
    }

    @GetMapping("/live")
    public Map<String, Double> getLivePrices() {
        return priceService.getLatestCachedPrices();
    }
}