package com.kestrel.sentinel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableScheduling // This single line turns on background loops!
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate(); // The tool we use to call CoinGecko
    }
}