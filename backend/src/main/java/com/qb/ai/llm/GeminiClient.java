package com.qb.ai.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Calls the Gemini REST API (generateContent) to parse interview text.
 * Uses Spring 6's RestClient — no WebFlux dependency needed.
 */
@Slf4j
@Component
public class GeminiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public GeminiClient(
            @Value("${app.ai.gemini-api-key}") String apiKey,
            @Value("${app.ai.gemini-model}") String model,
            ObjectMapper objectMapper
    ) {
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("x-goog-api-key", apiKey)
                .build();
    }

    /**
     * Send raw text to Gemini and get structured JSON back.
     * Returns the parsed JSON as a JsonNode for flexible handling.
     */
    public JsonNode parseInterviewText(String rawText, String categoryList) {
        log.info("Calling Gemini ({}) to parse interview text ({} chars)", model, rawText.length());

        var requestBody = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", PromptTemplates.buildDigestPrompt(categoryList)))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", rawText)))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.2
                )
        );

        try {
            String responseJson = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            // Extract the text content from Gemini's response structure
            JsonNode root = objectMapper.readTree(responseJson);
            String content = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();

            log.debug("Gemini raw response content: {}", content);
            return objectMapper.readTree(content);

        } catch (Exception e) {
            log.error("Gemini API call failed", e);
            throw new RuntimeException("Failed to parse interview text via AI: " + e.getMessage(), e);
        }
    }
}
