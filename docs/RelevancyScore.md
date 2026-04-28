# Relevancy Score Engine

## Overview

The Relevancy Score Engine computes a score (0–100) for each interview question based on three signals — frequency, recency, and spread. The score is mapped to a human-readable label displayed in the UI as `IMPORTANCE: <LABEL>`.

The goal is to surface the most interview-relevant questions at the top of the list, replacing the raw `×N asked` count with a meaningful signal.

---

## Formula

```
score = (frequency_score × 0.40) + (recency_score × 0.40) + (spread_score × 0.20)
```

### Signal 1 — Frequency (40%)

How many times has this question been asked across all sessions?

```
frequency_score = (occurrence_count / max_occurrence_count_in_system) × 100
```

- `occurrence_count` — from `questions.occurrence_count` column
- `max_occurrence_count` — `SELECT MAX(occurrence_count) FROM questions` (single aggregate query)
- If `max_occurrence_count ≤ 1` (early data), all questions score 50 to avoid skew

**Rationale:** A question asked 5 times is more important than one asked once. But frequency alone is misleading — an old question asked many times may be less relevant than a recent one asked twice.

---

### Signal 2 — Recency (40%)

How recently was this question last asked?

| Days since last interview | Score |
|---|---|
| ≤ 30 days | 100 |
| ≤ 90 days | 75 |
| ≤ 180 days | 50 |
| ≤ 365 days | 25 |
| > 365 days | 10 |
| No date available | 10 |

- Uses the most recent `interview_date` across all sessions for the question
- Computed from `QuestionDTO.sessions` list (already fetched)

**Rationale:** Interview trends change fast. A question asked last month is far more likely to appear in your next interview than one asked 2 years ago. Recency is the strongest signal for "what companies are asking RIGHT NOW".

---

### Signal 3 — Spread (20%)

How many distinct companies have asked this question?

```
spread_score = (distinct_companies / total_companies_in_system) × 100
```

- `distinct_companies` — size of `QuestionDTO.askedByCompanies` list
- `total_companies` — `companyRepo.count()` (cached in `companies` cache)

**Rationale:** If multiple companies independently ask the same question, it signals a universally expected concept. Currently weighted at 20% because the system has few companies (6). Weight should be revisited when 20+ companies are in the system.

---

## Score → Label Mapping

| Score Range | Label | Color |
|---|---|---|
| 75 – 100 | `CRITICAL` | Red `#f87171` |
| 50 – 74 | `HIGH` | Orange `#fb923c` |
| 25 – 49 | `MODERATE` | Yellow `#facc15` |
| 0 – 24 | `LOW` | Gray `#888888` |

---

## UI Display

Shown in `QuestionCard` as a colored badge:

```
IMPORTANCE: CRITICAL
IMPORTANCE: HIGH
IMPORTANCE: MODERATE
IMPORTANCE: LOW
```

Badge color matches the label color above. Replaces the old `×N asked` occurrence count badge.

---

## Architecture

### Class: `RelevancyScoreService`
**Location:** `com.qb.core.service.RelevancyScoreService`

| Method | Description |
|---|---|
| `computeScore(dto, maxOccurrence, totalCompanies)` | Returns raw score 0–100 |
| `toLabel(score)` | Maps score to CRITICAL/HIGH/MODERATE/LOW |

### Integration in `QuestionService`
- `searchQuestions` — fetches `maxOccurrenceCount` + `totalCompanies`, maps each question to DTO, computes score, sorts by score descending, returns `PageImpl`
- `getById` — same score computation for single question detail

### Sort Order
Questions are sorted by relevancy score **descending** in Java after DTO mapping. The native SQL query no longer has `ORDER BY` — Java handles it via `Comparator.comparingDouble`.

---

## Performance

| Operation | Cost | Frequency |
|---|---|---|
| `findMaxOccurrenceCount()` | ~1ms, single aggregate on indexed int | Once per cache miss |
| `companyRepo.count()` | Served from `companies` cache | Free on cache hit |
| Score computation per question | Pure Java math, ~0ms | Per question in page |
| Java sort (20 items) | Negligible | Per cache miss |
| **Cache hit (90%+ of requests)** | **Zero extra cost** | **Most requests** |

Results are cached in the `questions` Caffeine cache (TTL: 10 min). Score is computed once per cache entry.

---

## Future Improvements

### Phase 2
- Add **spread weight** increase (20% → 30%+) once 20+ companies are in the system
- Consider **round-level weighting**: questions asked in L3/L4/F2F rounds get a multiplier (e.g. 1.5×) since they signal deeper, more senior concepts

### Phase 3
- Incorporate **user self-rating data** as a fourth signal: if users consistently rate a question as "not confident", boost its relevancy score
- Consider **time-decay function** instead of step-based recency (e.g. exponential decay) for smoother scoring

### Weight Tuning
Current weights are assumptions. Once enough data accumulates (100+ questions, 20+ companies, 6+ months of sessions), weights should be validated against actual interview outcomes and tuned accordingly.

---

## Weight History

| Version | Frequency | Recency | Spread | Notes |
|---|---|---|---|---|
| v1.0 | 40% | 40% | 20% | Initial implementation |
