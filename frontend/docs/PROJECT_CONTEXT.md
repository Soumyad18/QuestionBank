# Interview Question Bank — Project Context

Last updated: 2026-04-13

## 1) Product Requirements Document (PRD)

### Product title
Interview Question Bank System

### Overview
A web platform for a software training institution to capture, organize, and search real interview questions collected from candidates.

### Problem statement
- Interview questions are scattered across unstructured chat systems.
- Search and reuse are difficult.
- Knowledge gets lost over time.
- Admin effort is high.
- Students have limited access to real interview questions.

### Goals
#### Primary
- Centralize all questions.
- Enable fast search/filter.
- Auto-organize using AI-generated tags.
- Reduce admin effort.

#### Secondary
- Improve interview preparation.
- Build institutional knowledge.
- Enable future trend insights.

### Users
- **Admin (primary):** add/edit/delete questions, review AI tags, maintain data quality.
- **User/Student (secondary):** search and explore questions.

### Core features
1. **Question management (Admin):** CRUD + metadata (company, round, date, interviewer optional, difficulty).
2. **AI tagging:** auto-suggest tags; admin can edit before save.
3. **Search & filtering:** keyword search + category/tags/difficulty/company/round filters; combinable.
4. **Question listing UI:** readable list with metadata; no answers.
5. **Auth/RBAC:** Admin full access; User read-only.

### Non-functional requirements
- Search response target: 1–2s.
- Scale to 10k+ questions.
- Secure auth and protected admin actions.
- Simple UI and low learning curve.

### Technical constraints
- Full stack TypeScript.
- Next.js (frontend + backend route handlers/server actions if needed).
- Vercel deployment.
- Supabase (PostgreSQL + Auth).
- External AI API for tagging.

### Out of scope
- Answers storage.
- Coding execution environment.
- Discussion/forum.
- Learning modules/courses.

### Success metrics
- Number of questions added.
- Search usage frequency.
- Time to find relevant questions.
- Admin effort reduction.
- DAU/user engagement.

---

## 2) Locked MVP Decisions (finalized)

These are intentionally simple to avoid analysis paralysis:

1. **Category model:** fixed predefined categories + optional AI tags.
   - Java, Spring Boot, Microservices, AWS, MongoDB, System Design, Coding, General
2. **Search relevance:** simple keyword + tag + filters. No advanced ranking yet.
3. **Duplicate handling:** allow duplicates, show warning for similar question.
4. **Data flow:** create → AI tag suggestion → admin edits tags → save. No draft/publish.
5. **Audit (light):** created_at, updated_at, created_by (+ updated_by included in model).
6. **Roles:** Admin and User only.
7. **Metrics (minimal):** total questions, search count, most-used tags.

---

## 3) Work Completed So Far

### Repository/application scaffold
- Initialized Next.js + TypeScript project structure.
- Added global layout and baseline styling.
- Added routes:
  - `/` (home)
  - `/questions` (discovery scaffold)
  - `/admin/questions` (admin scaffold)

### Domain model and constants
- Added fixed categories and difficulty enums.
- Added `Question` model with metadata + audit fields.
- Added `UserRole` (`admin | user`).

### UI components and data
- Added reusable `QuestionCard` component.
- Added mock question data for local UI iteration.

### Documentation/setup support
- Updated README with startup and Supabase inputs needed.
- Added npm 403 troubleshooting guide for restricted/proxy environments.
- Added `.npmrc.example` template for internal/public registry configuration.

---

## 4) Current Status and Known Blockers

### Status
- UI and model scaffold are in place.
- Core MVP behavior is **not yet fully wired** to real backend/auth.

### Blocker observed in this environment
- `npm install` currently fails with `403 Forbidden` to npm registry in this runtime due to network/proxy policy.
- App execution and lint/type/build checks are blocked until registry access is available or an internal registry is configured.

---

## 5) Overall Implementation Plan

## Phase A — Environment & Infrastructure (next immediate)
1. Resolve package installation access (internal registry or npm policy allowlist).
2. Verify local run:
   - `npm install`
   - `npm run dev`
   - `npm run typecheck`
   - `npm run lint`

## Phase B — Supabase Foundation
1. Add Supabase client setup (browser + server).
2. Configure env variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Implement auth (Admin/User roles).
4. Add route protection for admin pages.

## Phase C — Database Schema & Migrations
1. Create `questions` table with required metadata fields.
2. Add indexes for common query paths (text search, category, difficulty, company, round, created_at).
3. Add minimal audit fields.
4. Add RLS policies for Admin write/User read.

## Phase D — Admin MVP Features
1. Create question form (validated inputs).
2. Edit/delete question flows.
3. AI tag suggestion action + tag editor.
4. Duplicate warning check (non-blocking).

## Phase E — Discovery MVP Features
1. Keyword search input.
2. Filter controls (category/tags/difficulty/company/round).
3. Combined query execution + pagination.
4. Empty/loading/error states.

## Phase F — Metrics (minimal)
1. Track total questions.
2. Track search count.
3. Track most-used tags.

## Phase G — Stabilization
1. Basic test coverage for critical flows.
2. Performance pass on search queries.
3. Deploy preview on Vercel.

---

## 6) Immediate Inputs Needed From Product/Owner

To proceed with Supabase wiring, provide:
1. Supabase Project URL
2. Supabase anon public key
3. Preferred auth providers (email/password only or + Google/GitHub)
4. Any initial admin users (emails)

---

## 7) Handoff Note (for any AI editor)

If another AI editor (e.g., Antigravity) picks up this project, start from this file and then inspect:
- `README.md`
- `lib/types.ts`
- `lib/categories.ts`
- `app/questions/page.tsx`
- `app/admin/questions/page.tsx`

This gives full context: product scope, MVP lock decisions, implementation status, blockers, and next plan.
