package com.kestrel.sentinel.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class DiscordWebhook {
    private DiscordWebhook() {}

    public static String validate(String value) {
        String url = value == null ? "" : value.trim();
        if (!url.matches("https://(?:discord\\.com|discordapp\\.com)/api/webhooks/[0-9]+/[A-Za-z0-9_-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid Discord webhook URL is required");
        }
        return url;
    }
}
