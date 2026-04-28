# Security

## Authentication Flow

Supabase handles user authentication. On login, Supabase issues a signed JWT to the frontend. The frontend attaches this token to every backend API request via the `Authorization: Bearer <token>` header. The backend validates the token and resolves the user's role.

---

## JWT Algorithm

Supabase uses **ES256** (ECDSA with P-256 curve). The backend verifies tokens using Supabase's public JWKS endpoint:

```
GET https://ktngcorwkvpoiqgytfwn.supabase.co/auth/v1/.well-known/jwks.json
```

The JWKS response contains an EC public key with `x` and `y` coordinates (base64url-encoded). The backend reconstructs the `ECPublicKey` from these coordinates using the `secp256r1` (P-256) named curve and verifies the JWT signature with it.

Public keys are **cached in memory** (`ConcurrentHashMap`) keyed by `kid` — the JWKS endpoint is only called once per key ID, not on every request.

---

## Role Resolution

There are two roles: `ADMIN` and `USER`.

After JWT signature is verified, the backend extracts the `sub` (user UUID) from the claims and queries `user_profiles.is_admin` from the DB:

- `is_admin = true` → `ROLE_ADMIN`
- `is_admin = false` → `ROLE_USER`

To grant admin access to a user, set `is_admin = true` directly in the `user_profiles` table in Supabase.

---

## Endpoint Access Rules

| Endpoint | Access |
|---|---|
| `GET /api/questions/**` | Public |
| `GET /api/companies/**` | Public |
| `GET /api/tags/**` | Public |
| `GET /api/sessions/**` | Public |
| `PUT /api/questions/{id}` | `ROLE_ADMIN` |
| `DELETE /api/questions/{id}` | `ROLE_ADMIN` |
| `POST /api/companies` | `ROLE_ADMIN` |
| `POST /api/tags` | `ROLE_ADMIN` |
| `POST /api/digest/**` | `ROLE_ADMIN` |

---

## Key Config

| Property | Location | Value |
|---|---|---|
| `app.auth.supabase-url` | `application-dev.yml` → `${SUPABASE_URL}` | `https://ktngcorwkvpoiqgytfwn.supabase.co` |

---

## user_profiles Table

Auto-populated via a Postgres trigger `on_auth_user_created` that fires on every new Supabase Auth signup (email/password or Google OAuth).

```sql
CREATE TABLE public.user_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  name       text NOT NULL,
  phone      text,
  is_admin   boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```
