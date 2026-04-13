package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@Data
@ConfigurationProperties(prefix = "ai.gemini")
public class GeminiProperties {
    private boolean enabled = false;
    private String apiKey = "";
    private String model = "gemini-2.5-flash-lite";
    private String endpoint = "https://generativelanguage.googleapis.com/v1beta/models";
    private int timeoutSeconds = 20;
    private int historyContextMessages = 12;
    private int historyReturnMessages = 100;
}
