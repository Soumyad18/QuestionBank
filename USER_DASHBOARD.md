# User Dashboard — Frontend Requirements

## Route
`/dashboard` — requires authentication (any logged-in user, admin or not)

## Auth Behaviour
- Non-admin users are redirected to `/dashboard` after login (currently redirects to `/questions`)
- Admin users continue to redirect to `/admin/questions` after login
- If unauthenticated user visits `/dashboard` → redirect to `/login`

---

## Section 1 — Profile

### Display
- Full Name
- Email (read-only — managed by Supabase auth)
- Phone Number
- Member since (created_at date)
- Role badge — `USER` or `ADMIN`

### Edit
- Name and Phone are editable
- Email is NOT editable
- Save button — calls `PUT /api/users/me`
- Show success/error feedback after save

---

## Section 2 — Stats

Quick summary stats for the logged-in user:

| Stat | Description |
|---|---|
| Total Sessions | Number of interview sessions linked to this user |
| Companies | Number of distinct companies the user has interviewed at |
| Last Interview | Date of the most recent session |

Data source: `GET /api/user/dashboard/stats`

---

## Section 3 — My Sessions

List of all interview sessions where `candidate_id = current user`.

### Per Session Card/Row
- Company name
- Round (e.g. L1, L2, F2F) — with round color badge
- Interview Date
- Interviewer name (if available)
- Number of questions asked in that session

### Expandable / Detail
Each session can be expanded to show the list of questions asked in that session:
- Question text
- Category badge
- Importance label (CRITICAL / HIGH / MODERATE / LOW) with color
- Tags

Data source: `GET /api/users/me/sessions`

---

## Section 4 — Navigation

- Link to browse all questions → `/questions`
- Logout button

---

## API Contracts (to be built on backend)

### `GET /api/user/dashboard/stats`
```json
{
  "totalSessions": 3,
  "totalCompanies": 2,
  "lastInterviewDate": "2026-04-17"
}
```

### `GET /api/users/me`
```json
{
  "id": "uuid",
  "name": "Test User",
  "email": "test@user.com",
  "phone": "9876543210",
  "isAdmin": false,
  "createdAt": "2026-04-21T..."
}
```

### `PUT /api/users/me`
Request body:
```json
{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

### `GET /api/users/me/sessions`
```json
[
  {
    "id": "uuid",
    "companyName": "Mantra Labs",
    "companySlug": "mantra-labs",
    "round": "l1",
    "interviewDate": "2026-04-17",
    "interviewerName": "John",
    "questions": [
      {
        "id": "uuid",
        "text": "Explain Kafka internal working.",
        "category": "Messaging",
        "relevancyLabel": "CRITICAL",
        "tags": ["kafka", "partitions", "event-driven"]
      }
    ]
  }
]
```

---

## Existing Design System (use consistently)

The project uses a terminal/monospace dark theme. Refer to existing pages for consistency:

- Font: `var(--font-mono)` for labels/badges, `var(--font-body)` for content
- Colors: `var(--accent-cyan)` for highlights, `#f87171` red, `#4ade80` green, `#facc15` yellow
- Spacing: `var(--spacing-sm)` 8px, `var(--spacing-md)` 16px, `var(--spacing-lg)` 32px
- Components: `.card`, `.badge`, `.btn`, `.btn-primary`, `.structural-grid`, `.grid-cell`, `.stack`, `.row`, `.muted`, `.input-field`, `.input-label`
- Importance colors: CRITICAL `#f87171`, HIGH `#fb923c`, MODERATE `#facc15`, LOW `#888888`
- Round colors: already defined in `ROUND_COLORS` in `categories.ts`

---

## State Handling

- Loading state while fetching profile, stats, sessions
- Empty state if no sessions linked yet — show message encouraging user to contact admin to link their sessions
- Error state if API fails

---

## Notes for Backend Integration

All APIs require `Authorization: Bearer <supabase_jwt>` header.
The backend extracts `auth.uid()` from the JWT to scope all queries to the current user.
These APIs are NOT admin-only — any authenticated user can call them for their own data.
