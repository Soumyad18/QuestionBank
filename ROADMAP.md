# QuestionBank — Development Roadmap

## Phase 1 — Core + Admin Auth ✅ / 🔧 In Progress

### ✅ Done
- Next.js → Vite + React + TypeScript frontend scaffold
- Spring Boot backend with full REST API
- Supabase Postgres DB with schema: `companies`, `tags`, `questions`, `question_tags`, `interview_sessions`, `question_occurrences`
- All GET APIs working and tested: questions (search + filters), companies, tags, sessions
- Admin APIs: PUT/DELETE question, POST company, POST tag, POST digest (parse + commit)
- AI digest pipeline: Gemini parses raw interview text → admin reviews → commits to DB
- Mock data seeded (45 questions, 6 companies, 119 tags, 7 sessions)
- Postman collection for API testing

### 🔧 Remaining in Phase 1
- [ ] Create `user_profiles` table in Supabase (id → auth.users, name, phone, email, is_admin)
- [ ] Replace backend role logic: read `is_admin` from `user_profiles` instead of hardcoded email
- [ ] Frontend: replace mock auth with real Supabase `signInWithPassword`
- [ ] Frontend: add Google OAuth login
- [ ] Frontend: attach Supabase JWT to all backend API calls (`Authorization: Bearer`)
- [ ] RLS policies: public read on questions/companies/tags, authenticated write for admin
- [ ] Wire frontend pages to real backend APIs (replace all mock data)
- [ ] Admin digest page: real two-step flow (parse → preview → commit)
- [ ] Admin manage page: real save/delete via backend APIs

---

## Phase 2 — User Accounts + Email Marketing

### Auth & Profiles
- [ ] Users must sign up / log in to search questions (gate the `/questions` route)
- [ ] Signup collects: **name, phone number, email** (stored in `user_profiles`)
- [ ] Google OAuth for users (email + name auto-filled from Google)
- [ ] Profile page: user can view/edit their name and phone

### Admin — User Management
- [ ] Admin dashboard: view all registered users (name, email, phone, joined date)
- [ ] Admin can promote any user to admin by toggling `is_admin` flag (UI toggle, no need to go to DB)
- [ ] Admin can deactivate/ban a user

### Email System
- [ ] Email service integration (Resend or SendGrid via Supabase Edge Function)
- [ ] Admin can send **broadcast emails** to all users
- [ ] Admin can send **targeted emails** filtered by: company they're preparing for, signup date, etc.
- [ ] Email templates: interview prep tips, upcoming session announcements, new questions added
- [ ] Email log: track sent emails (to whom, when, subject)

### New DB Tables (Phase 2)
```
user_profiles        — id (→ auth.users), name, phone, email, is_admin, created_at
email_logs           — id, sent_by (admin), subject, body, recipient_count, sent_at
email_recipients     — id, email_log_id, user_id, sent_at
```

---

## Phase 3 — Ratings + Recordings + Analytics Engine

### Self-Rating System
- [ ] After browsing questions, user can rate their confidence per question: 1–5 scale
- [ ] Ratings stored per user per question (`user_question_ratings` table)
- [ ] User can update their rating anytime
- [ ] Admin can view aggregate ratings: which questions users find hardest

### Answer Recording
- [ ] User can write a **text answer** for any question (stored in DB)
- [ ] Admin can review submitted answers
- [ ] Future: audio/video answer recording (Phase 3+)

### Analytics — User View
- [ ] Personal dashboard: questions attempted, avg confidence rating, weak topics
- [ ] Progress over time: rating trend per category (e.g. "Kafka improving, System Design weak")
- [ ] Recommended questions: surface low-rated categories

### Analytics — Admin View
- [ ] Most asked questions across all companies
- [ ] Hardest questions by avg user rating
- [ ] Company-wise question trends
- [ ] User engagement stats: active users, questions viewed, ratings submitted
- [ ] Category heatmap: which topics are most covered

### New DB Tables (Phase 3)
```
user_question_ratings  — id, user_id, question_id, rating (1-5), rated_at
user_answers           — id, user_id, question_id, answer_text, created_at, updated_at
```

---

## Phase 4 — Extended Features (Future)

- [ ] Leaderboard: top users by questions rated / answered
- [ ] Interview simulation mode: timed question sets by company/round
- [ ] Admin can create curated question sets / study plans
- [ ] Notifications: in-app + email when new questions added for a company user follows
- [ ] Public shareable question links
- [ ] Mobile app (React Native)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Backend | Spring Boot 3 + Java 21 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI | Google Gemini (digest pipeline) |
| Email | Resend / SendGrid via Supabase Edge Function |
| Hosting | TBD |

---

## DB Schema Overview

```
auth.users                  ← Supabase managed
    ↓
user_profiles               ← Phase 1: is_admin flag, name, phone
    
companies
    ↓
interview_sessions          ← company_id → companies
    ↓
question_occurrences        ← session_id + question_id

questions
    ↓
question_tags               ← question_id + tag_id
tags

-- Phase 2 --
email_logs
email_recipients            ← email_log_id + user_id

-- Phase 3 --
user_question_ratings       ← user_id + question_id
user_answers                ← user_id + question_id
```
