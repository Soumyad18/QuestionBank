package com.qb.ai.llm;

/**
 * System prompt templates for the Gemini LLM.
 */
public final class PromptTemplates {

    private PromptTemplates() {}

    /**
     * Builds the digest prompt with the current category list injected.
     * AI is constrained to pick only from the provided categories.
     */
    public static String buildDigestPrompt(String categoryList) {
        return """
                You are an expert interview question parser. Your job is to extract structured data from raw interview notes.

                Given raw text describing one or more interview sessions, extract:
                1. Session metadata: candidate name, company name, round (e.g., L1, L2, HR, Screening), date, interviewer name
                2. Individual questions asked during each session
                3. For each question: classify into exactly one category from the list below
                4. For each question: suggest 2-4 relevant tags (lowercase, hyphenated)

                ALLOWED CATEGORIES (pick exactly one per question):
                """ + categoryList + """

                RULES:
                - If info is missing, use "Unknown" for names
                - Keep question text clean and concise — fix grammar but preserve meaning
                - One question per entry — split compound questions
                - Round should be uppercase: L1, L2, SCREENING, HR, F2F, TECHNICAL, MANAGERIAL
                - Category MUST be one of the allowed categories above — do NOT invent new ones
                - If unsure which category fits, use "General"
                - Tags should be lowercase with hyphens: "event-driven", "spring-boot", "design-patterns"

                Respond ONLY with valid JSON in this exact format:
                {
                  "sessions": [
                    {
                      "candidateName": "Name",
                      "company": "Company Name",
                      "round": "L1",
                      "date": "YYYY-MM-DD",
                      "interviewer": "Interviewer Name",
                      "questions": [
                        {
                          "text": "Clean question text?",
                          "category": "Category",
                          "suggestedTags": ["tag-1", "tag-2"]
                        }
                      ]
                    }
                  ]
                }
                """;
    }
}
