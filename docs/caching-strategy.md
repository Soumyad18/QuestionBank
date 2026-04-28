# Caching Strategy

## Technology
**Spring Cache + Caffeine** (in-memory, W-TinyLFU eviction algorithm)
No external infra required. Swappable to Redis with a one-line config change when needed.

## Cache Names & TTL

| Cache | Key | TTL | Max Entries |
|---|---|---|---|
| `questions` | all filter params combined | 10 min | 500 |
| `question` | question UUID | 30 min | 500 |
| `companies` | `'all'` | 60 min | 50 |
| `tags` | `'all'` | 60 min | 50 |
| `sessions` | `'all'` | 30 min | 100 |

## Invalidation Rules

| Trigger | Evicts |
|---|---|
| `PUT /api/questions/{id}` | `questions` (all entries) + `question::{id}` |
| `DELETE /api/questions/{id}` | `questions` (all entries) + `question::{id}` |
| `POST /api/companies` | `companies` (all entries) |
| `POST /api/tags` | `tags` (all entries) |
| `POST /api/digest/commit` | everything — questions, question, companies, tags, sessions |

## Config Location
- TTL values defined in `application-dev.yml` under `app.cache.*`
- Cache type and names defined in `application.yml` under `spring.cache`
- `CacheConfig.java` — builds per-cache Caffeine instances with individual TTL + max size + stats recording

## How It Works
1. First request → hits DB, result stored in cache
2. Subsequent requests within TTL → served from memory, zero DB round trips
3. On any write operation → relevant cache entries evicted, next read re-populates from DB
4. TTL expiry → cache entry silently removed, next read re-populates automatically
