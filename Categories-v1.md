# Categories v1

## Model

3-level hierarchy:
```
Interview Type  →  Category  →  Tags
  (derived)        (admin)      (AI)
```

- **Interview Type** — not stored, derived from `categories.interview_type`
- **Category** — admin-controlled, stored in `categories` table, FK on `questions`
- **Tags** — AI-generated, free-form, stored in `tags` table via `question_tags`

---

## Finalized Backend Categories (11)

| # | Category | Covers | Example Tags |
|---|---|---|---|
| 1 | Java | Core Java, JVM, multithreading | jvm, gc, collections, generics, multithreading, streams, lambda |
| 2 | Spring | Spring Boot, Security, Data, Cloud | spring-boot, spring-security, aop, ioc, transactions, annotations |
| 3 | Microservices | Architecture, patterns, resilience | circuit-breaker, service-discovery, api-gateway, resilience4j |
| 4 | System Design | Scalability, distributed systems | cap-theorem, caching, sharding, consistency, load-balancing |
| 5 | Database | SQL + NoSQL | sql, mongodb, indexing, transactions, acid, aggregation, nosql, redis |
| 6 | Messaging | Any message broker | kafka, rabbitmq, event-driven, partitions, exchanges, queues |
| 7 | DevOps | Docker, K8s, AWS, CI/CD, Nginx | docker, kubernetes, aws, ci-cd, blue-green, nginx, canary |
| 8 | Security | Auth, encryption, web security | jwt, oauth2, xss, csrf, encryption, https, spring-security |
| 9 | DSA | Data structures, algorithms, coding problems | arrays, linked-list, trees, graphs, dynamic-programming, two-pointer, recursion |
| 10 | Design Patterns | OOP patterns, SOLID | singleton, factory, observer, strategy, solid, oop |
| 11 | General | Fallback — anything that doesn't fit above | — |

---

## Finalized Frontend Categories (9)

| # | Category | Covers | Example Tags |
|---|---|---|---|
| 1 | JavaScript | Core JS, ES6+, async, prototypes | closures, promises, event-loop, prototype, es6, hoisting, scope |
| 2 | TypeScript | Types, generics, decorators | generics, interfaces, type-guards, decorators, utility-types |
| 3 | React | React + ecosystem | hooks, virtual-dom, context, redux, lifecycle, reconciliation |
| 4 | Angular | Angular framework | directives, services, rxjs, dependency-injection, modules |
| 5 | Node | Node.js + Express | event-loop, streams, middleware, routing, npm, cluster, express |
| 6 | Web Fundamentals | HTML + CSS | semantic-html, flexbox, grid, accessibility, responsive, animations |
| 7 | DSA | Same as backend — shared | arrays, linked-list, trees, two-pointer, complexity |
| 8 | Design Patterns | Same as backend — shared | singleton, factory, observer, solid |
| 9 | General | Fallback — anything that doesn't fit above | — |

---

## Interview Type Mapping

| Interview Type | Categories |
|---|---|
| **Backend** | Java, Spring, Microservices, System Design, Database, Messaging, DevOps, Security, DSA, Design Patterns, General |
| **Frontend** | JavaScript, TypeScript, React, Angular, Node, Web Fundamentals, DSA, Design Patterns, General |
| **Full Stack** | Union of Backend + Frontend (all categories) |

**Shared categories** (appear in both Backend and Frontend): DSA, Design Patterns, General

---

## Fallback Rule

> If AI cannot confidently classify a question into any predefined category, it must assign **General**. General is a protected category — it cannot be deleted or renamed.

---

## DB Changes Required

### New `categories` table
```sql
CREATE TABLE categories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL UNIQUE,
  interview_type  text NOT NULL CHECK (interview_type IN ('backend', 'frontend', 'shared')),
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### Seed data
```sql
-- Backend
INSERT INTO categories (name, interview_type) VALUES
('Java', 'backend'), ('Spring', 'backend'), ('Microservices', 'backend'),
('System Design', 'backend'), ('Database', 'backend'), ('Messaging', 'backend'),
('DevOps', 'backend'), ('Security', 'backend');

-- Frontend
INSERT INTO categories (name, interview_type) VALUES
('JavaScript', 'frontend'), ('TypeScript', 'frontend'), ('React', 'frontend'),
('Angular', 'frontend'), ('Node', 'frontend'), ('Web Fundamentals', 'frontend');

-- Shared (visible in both backend + frontend)
INSERT INTO categories (name, interview_type) VALUES
('DSA', 'shared'), ('Design Patterns', 'shared'), ('General', 'shared');
```

### Migrate `questions.category`
```sql
-- Add FK column
ALTER TABLE questions ADD COLUMN category_id uuid REFERENCES categories(id);

-- Migrate existing data (map old text values to new category IDs)
UPDATE questions q SET category_id = c.id
FROM categories c WHERE LOWER(c.name) = LOWER(q.category);

-- Remaining unmapped → General
UPDATE questions SET category_id = (SELECT id FROM categories WHERE name = 'General')
WHERE category_id IS NULL;

-- Drop old text column
ALTER TABLE questions DROP COLUMN category;
```

---

## Backend Code Changes

| File | Change |
|---|---|
| `Category.java` (new entity) | Maps to `categories` table |
| `CategoryRepository.java` | `findAll()`, `findByInterviewType()` |
| `CategoryService.java` | CRUD + protect General from delete |
| `CategoryController.java` | `GET /api/categories`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| `Question.java` | Replace `String category` with `@ManyToOne Category category` |
| `QuestionDTO.java` | Add `categoryId`, `categoryName`, `interviewType` fields |
| `QuestionRepository.java` | Update search query — filter by `category_id` and `interview_type` |
| `QuestionController.java` | Add `interviewType` filter param |
| `PromptTemplates.java` | Inject category list — AI must pick from predefined list |
| `DigestService.java` | Validate AI category against DB, fallback to General |
| `RelevancyScoreService.java` | No change needed |

---

## Frontend Code Changes

| File | Change |
|---|---|
| `categories.ts` | Remove hardcoded list — fetch from `GET /api/categories` |
| `api.ts` | Add `getCategories()` call |
| `types.ts` | Add `Category` type with `id`, `name`, `interviewType` |
| `QuestionsPage.tsx` | Add Interview Type filter (Backend/Frontend/Full Stack) |
| `AdminManagePage.tsx` | Category dropdown fetched from API |
| `AdminQuestionsPage.tsx` | Category dropdown in digest preview fetched from API |
| `App.tsx` | Add new admin routes |

---

## New Admin Pages Required

| Route | Page | Purpose |
|---|---|---|
| `/admin` | AdminDashboardPage | Stats widget + navigation tiles |
| `/admin/categories` | AdminCategoriesPage | Full CRUD on categories |
| `/admin/tags` | AdminTagsPage | View + delete unused tags |
| `/admin/companies` | AdminCompaniesPage | Full CRUD on companies |
| `/admin/sessions` | AdminSessionsPage | View + delete sessions |

---

## AI Prompt Change

Current prompt gives AI free-form category control. New prompt:

```
Classify each question into exactly one of the following categories:
[list fetched from DB at runtime]

Rules:
- Pick the single best fitting category
- Do NOT invent new category names
- If unsure, use "General"
```

The category list is injected at runtime from the DB — so when admin adds a new category, AI immediately picks it up without any code change.

---

## Implementation Order

1. DB — create `categories` table + seed 19 categories
2. DB — migrate `questions.category` text → `questions.category_id` FK
3. Backend — Category entity, repository, service, controller
4. Backend — Update Question entity + DTO + search query + controller
5. Backend — Update PromptTemplates + DigestService for constrained classification
6. Frontend — `categories.ts` becomes API-driven
7. Frontend — Add Interview Type filter to QuestionsPage
8. Frontend — Admin Dashboard + all new admin pages
9. Frontend — Update login redirect → `/admin`
