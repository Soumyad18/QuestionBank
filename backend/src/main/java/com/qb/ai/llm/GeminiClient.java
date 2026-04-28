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
 * Multi-provider LLM client — supports both Gemini and Groq (OpenAI-compatible).
 * Provider is selected via the app.ai.provider config property.
 *
 * Supported providers:
 *   - "gemini" → Google Generative AI (Gemini REST API)
 *   - "groq"  → Groq Cloud (OpenAI-compatible API, uses Llama/Mixtral models)
 */
@Slf4j
@Component
public class GeminiClient {

    private final ObjectMapper objectMapper;
    private final String model;
    private final String provider;
    private final RestClient geminiClient;
    private final RestClient groqClient;

    public GeminiClient(
            @Value("${app.ai.gemini-api-key:not-set}") String geminiApiKey,
            @Value("${app.ai.groq-api-key:not-set}") String groqApiKey,
            @Value("${app.ai.gemini-model:gemini-2.0-flash}") String model,
            @Value("${app.ai.provider:gemini}") String provider,
            ObjectMapper objectMapper
    ) {
        this.model = model;
        this.provider = provider.toLowerCase();
        this.objectMapper = objectMapper;

        // Build Gemini REST client
        this.geminiClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .defaultHeader("x-goog-api-key", geminiApiKey)
                .build();

        // Build Groq REST client (OpenAI-compatible)
        this.groqClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + groqApiKey)
                .build();

        log.info("LLM provider initialized: {} (model: {})", this.provider, this.model);
    }

    /**
     * Send raw text to the configured LLM provider and get structured JSON back.
     */
    public JsonNode parseInterviewText(String rawText, String categoryList) {
        log.info("Calling {} ({}) to parse interview text ({} chars)", provider, model, rawText.length());

        return switch (provider) {
            case "groq" -> callGroq(rawText, categoryList);
            default -> callGemini(rawText, categoryList);
        };
    }

    // ─── Gemini Provider ─────────────────────────────────────────────

    private JsonNode callGemini(String rawText, String categoryList) {
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
            String responseJson = geminiClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

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

    // ─── Groq Provider (OpenAI-compatible) ───────────────────────────

    private JsonNode callGroq(String rawText, String categoryList) {
        var requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", PromptTemplates.buildDigestPrompt(categoryList)),
                        Map.of("role", "user", "content", rawText)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.2
        );

        try {
            String responseJson = groqClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseJson);
            String content = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

            log.debug("Groq raw response content: {}", content);
            return objectMapper.readTree(content);

        } catch (Exception e) {
            log.error("Groq API call failed", e);
            throw new RuntimeException("Failed to parse interview text via AI: " + e.getMessage(), e);
        }
    }
}
