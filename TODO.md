# TODO — QuestionBank Development

---

## ✅ Phase 1 — Core + Admin Auth (COMPLETE)
All backend APIs, Supabase auth, relevancy engine, caching, fuzzy match, multi-company tracking, interview type filter, signup with phone, candidate_id FK on sessions.

---

## ✅ Phase 2A — Admin Dashboard (COMPLETE)
Categories migration (17 categories, AI constrained), admin dashboard stats API (1hr cache), missing CRUD APIs (tags/sessions/companies), all frontend mocks replaced with real APIs.

---

## ✅ Phase 2B — User Management (COMPLETE)
- [x] `GET /api/admin/users` — list all users with session count
- [x] `PUT /api/admin/users/{id}/toggle-admin` — promote/demote admin
- [x] `PUT /api/admin/users/sessions/{id}/link-candidate` — manually link session to user
- [x] `AdminUserService` + `AdminUserController`
- [x] `AdminUsersPage` — user table, toggle admin, session linking modal
- [x] All wired to real backend

---

## ✅ Phase 2C — User Dashboard (COMPLETE)

- [x] `UserService` — getProfile, updateProfile, getDashboardStats, getMySessions
- [x] `UserController` — 4 endpoints at `/api/users/me` and `/api/user/dashboard/stats`
- [x] `UserDashboardStatsDTO` — totalSessions, totalCompanies, lastInterviewDate
- [x] `UserSessionDetailsDTO` — session with nested question list
- [x] `UserDashboardPage` at `/dashboard` — profile edit, stats, sessions with expandable questions
- [x] Login redirect for non-admin → `/dashboard`
- [x] Route guard — `/dashboard` requires auth
- [x] All API functions wired: `getMe()`, `updateMe()`, `getUserDashboardStats()`, `getMySessions()`

---

## 🔧 Phase 2D — Email System (Brevo + OpenPDF) — NEXT

### Goal
Admin can send interview prep emails to candidates with a PDF attachment containing filtered questions.

### 2D-1: Dependencies
- [ ] Add OpenPDF to `pom.xml` — `com.github.librepdf:openpdf:1.3.30` (LGPL, free for commercial)
- [ ] Add Brevo Java SDK to `pom.xml` — `com.sendinblue:sib-api-v3-sdk:6.0.0`
- [ ] `.env` — add `BREVO_API_KEY` (get from Brevo dashboard)

### 2D-2: PDF Generation Service
- [ ] `PdfService.java` — generates question list PDF as `byte[]`
  - Input: candidate name, company, round, date, List<Question>
  - Output: PDF with header (candidate info) + table (questions with category/tags)
  - OpenPDF API: `Document`, `PdfWriter`, `Paragraph`, `Table`
  - Returns `byte[]` for email attachment

### 2D-3: Email Service
- [ ] `EmailService.java` — wraps Brevo REST API
  - `sendInterviewPrepEmail(recipientEmail, recipientName, pdfBytes, sessionDetails)`
  - Constructs HTML email body with session details
  - Attaches PDF as base64 encoded attachment
  - Calls Brevo transactional email API: `POST https://api.brevo.com/v3/smtp/email`
  - Headers: `api-key: ${BREVO_API_KEY}`, `Content-Type: application/json`

### 2D-4: Email Trigger Endpoint
- [ ] `POST /api/admin/email/send` — admin triggers email
  - Body: `{ candidateIds: string[], filters: { company?, round? } }`
  - Fetch questions matching filters
  - For each candidate: generate PDF, send email via Brevo
  - Return: `{ emailsSent: number, errors: string[] }`
- [ ] `EmailController` — `POST /api/admin/email/send` (admin only)

### 2D-5: Email Logging (optional for Phase 2D)
- [ ] DB — `email_logs` table (id, sent_by, subject, recipient_count, sent_at)
- [ ] Store log after each email batch sent

### 2D-6: Frontend
- [ ] `AdminEmailsPage` — replace mock `triggerEmails()` with real `POST /api/admin/email/send`
- [ ] Show loading state while sending
- [ ] Show success message with count of emails sent
- [ ] Show error if any emails failed

---

## Phase 3 — Analytics + Ratings (Future)
- [ ] User self-rating per question (1-5 confidence scale)
- [ ] `user_question_ratings` table
- [ ] User progress dashboard — weak topics, improving areas
- [ ] Admin analytics — most asked questions, hardest by rating, company trends

---

## Pending Tech Debt
- [ ] Backend — `findMaxOccurrenceCount()` in `QuestionRepository` — unused, remove
- [ ] Backend — `Difficulty` enum still exists — remove
- [ ] Frontend — `SignupAdvisoryPage.tsx` file still exists — delete
- [ ] Postman collection — update with new endpoints

---

## Current API Inventory

### Real (working)
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/questions` | Public |
| GET | `/api/questions/{id}` | Public |
| PUT | `/api/questions/{id}` | Admin |
| DELETE | `/api/questions/{id}` | Admin |
| GET | `/api/companies` | Public |
| POST | `/api/companies` | Admin |
| PUT | `/api/companies/{slug}` | Admin |
| DELETE | `/api/companies/{slug}` | Admin |
| GET | `/api/tags` | Public |
| POST | `/api/tags` | Admin |
| DELETE | `/api/tags/{id}` | Admin |
| GET | `/api/sessions` | Public |
| DELETE | `/api/sessions/{id}` | Admin |
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Admin |
| PUT | `/api/categories/{id}` | Admin |
| DELETE | `/api/categories/{id}` | Admin |
| GET | `/api/admin/dashboard/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/{id}/toggle-admin` | Admin |
| PUT | `/api/admin/users/sessions/{id}/link-candidate` | Admin |
| GET | `/api/users/me` | User |
| PUT | `/api/users/me` | User |
| GET | `/api/user/dashboard/stats` | User |
| GET | `/api/users/me/sessions` | User |
| POST | `/api/digest/parse` | Admin |
| POST | `/api/digest/commit` | Admin |

### To Be Built
| Method | Endpoint | Auth | Phase |
|---|---|---|---|
| POST | `/api/admin/email/send` | Admin | 2D |
