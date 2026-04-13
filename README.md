# QuestionBank

MVP scaffold for the Interview Question Bank System.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Implemented in this scaffold

- Next.js + TypeScript setup
- Basic routes:
  - `/` Home
  - `/questions` discovery list scaffold
  - `/admin/questions` admin flow scaffold
- Fixed categories + difficulty enums
- Question type model with audit fields

## Next setup input needed

To wire Supabase auth + database, provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Preferred auth providers (email/password, Google, GitHub, etc.)


## Install troubleshooting

If you hit `npm install` 403 errors in restricted networks, see `docs/npm-install-troubleshooting.md` and `.npmrc.example`.
