# Cron Jobs

## Overview

All scheduled jobs in the QuestionBank backend are managed by Spring's `@Scheduled` mechanism with `@EnableScheduling` enabled on the component class. No external job scheduler (Quartz, cron daemon, etc.) is used — everything runs in-process.

---

## Jobs

### 1. Relevancy Score Refresh

| Property | Value |
|---|---|
| Class | `com.qb.core.scheduler.RelevancyScheduler` |
| Method | `refreshRelevancyScores()` |
| Schedule | `0 0 0 * * *` (UTC) |
| Effective Time | **5:30 AM IST** (IST = UTC+5:30) |
| Frequency | Daily |

**What it does:**
Recomputes relevancy scores for all questions and persists them to `questions.relevancy_score` and `questions.relevancy_label`. Also evicts the `questions` cache so the next request picks up fresh scores.

**Why daily at 5:30 AM IST:**
The recency signal (40% weight) changes daily — a question asked 29 days ago scores 100 on recency, but the next day it drops to 75. Running at 5:30 AM IST ensures scores are fresh before the day's traffic begins, with minimal user impact during off-peak hours.

**Side effects:**
- Evicts `questions` Caffeine cache (`allEntries = true`)
- Writes to DB for all questions (bulk update via `questionRepo.updateRelevancy`)

---

## Additional Recompute Triggers

Beyond the nightly schedule, relevancy scores are also recomputed in these situations:

| Trigger | Where | Reason |
|---|---|---|
| `POST /api/digest/commit` | `DigestService.commit()` | New questions added, occurrence counts changed, new companies may have been created — all three signals (frequency, recency, spread) are affected |

---

## Scoring Formula (for reference)

```
score = (frequency_score × 0.40) + (recency_score × 0.40) + (spread_score × 0.20)
```

| Signal | Formula | Notes |
|---|---|---|
| Frequency | `(occurrence_count / max_occurrence_count) × 100` | Normalized against system max |
| Recency | Step function based on days since last interview | ≤30d=100, ≤90d=75, ≤180d=50, ≤365d=25, else=10 |
| Spread | `(distinct_companies / total_companies) × 100` | How many companies asked it |

Score → Label mapping:

| Score | Label |
|---|---|
| 75 – 100 | `CRITICAL` |
| 50 – 74 | `HIGH` |
| 25 – 49 | `MODERATE` |
| 0 – 24 | `LOW` |

See `RelevancyScore.md` for full documentation of the scoring engine.

---

## Adding a New Cron Job

1. Create a new `@Component` class in `com.qb.core.scheduler`
2. Annotate the class with `@EnableScheduling`
3. Annotate the method with `@Scheduled(cron = "...", zone = "UTC")`
4. Always use `zone = "UTC"` and convert to IST in comments for clarity
5. Document it in this file

**Cron expression reference:**
```
┌─────────── second (0-59)
│ ┌───────── minute (0-59)
│ │ ┌─────── hour (0-23)
│ │ │ ┌───── day of month (1-31)
│ │ │ │ ┌─── month (1-12)
│ │ │ │ │ ┌─ day of week (0-7, 0=Sunday)
│ │ │ │ │ │
0 0 0 * * *   → midnight UTC = 5:30 AM IST
0 30 18 * * * → 18:30 UTC = midnight IST
```

---

## Monitoring

Logs are emitted at `INFO` level before and after each job:

```
INFO  c.q.c.s.RelevancyScheduler - Nightly relevancy refresh started (5:30 AM IST)
INFO  c.q.c.s.RelevancyScoreService - Recomputing relevancy for 45 questions (maxOcc=3, companies=6)
INFO  c.q.c.s.RelevancyScoreService - Relevancy recompute complete.
INFO  c.q.c.s.RelevancyScheduler - Nightly relevancy refresh complete
```

To verify the job ran, search logs for `Nightly relevancy refresh`.
