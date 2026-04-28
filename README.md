<p align="center">
  <h1 align="center">📚 QuestionBank</h1>
  <p align="center">
    A full-stack interview preparation platform for curating, managing, and delivering technical interview questions across companies and domains.
  </p>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

QuestionBank is a platform designed to help candidates and teams prepare for technical interviews. It provides a searchable, filterable question bank organized by company, category, difficulty, and tags — backed by AI-powered features like relevancy scoring and automated interview prep email delivery.

The platform supports two user roles:
- **Candidates** — browse questions, filter by company/category/difficulty, and track preparation progress via a personal dashboard.
- **Admins** — manage the entire question lifecycle, user accounts, interview sessions, categories, tags, companies, and bulk email dispatch.

## Features

### 🎯 Core
- **Question Discovery** — search and filter questions by company, category, difficulty, round, and tags
- **Company Profiles** — track which companies ask which questions and how frequently
- **Category & Tag Management** — organize questions with hierarchical categories and free-form tags
- **Interview Sessions** — log and review past interview sessions with linked questions

### 🤖 AI-Powered
- **Relevancy Scoring** — AI-driven scoring via Google Gemini to rank question importance
- **Smart Prompt Templates** — structured LLM prompt engineering for consistent AI outputs

### 👤 User Experience
- **Authentication** — Supabase Auth with email/password and Google OAuth
- **Role-Based Access Control** — admin vs. user routes with protected page guards
- **User Dashboard** — personalized preparation tracking and progress overview
- **Signup Advisory** — guided onboarding flow for new users

### 🛠 Admin Panel
- **Dashboard Analytics** — overview of platform metrics and activity
- **Question CRUD** — full create/read/update/delete with bulk operations
- **User Management** — view, approve, and manage user accounts
- **Email Dispatch** — send interview prep materials to users via Brevo SMTP
- **PDF Generation** — generate downloadable PDF question sheets on-the-fly

### ⚡ Performance
- **Caffeine Caching** — in-memory caching with configurable TTLs for questions, companies, tags, and sessions
- **Connection Pooling** — HikariCP with optimized pool sizing for Supabase Postgres
- **Scheduled Jobs** — background cron tasks for data maintenance

## Tech Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| **Frontend** | React 19, TypeScript 5.8, Vite 8, React Router 7                          |
| **Backend**  | Java 24, Spring Boot 3.5, Spring Security, Spring Data JPA, Hibernate     |
| **Database** | PostgreSQL (Supabase), HikariCP connection pooling                         |
| **Auth**     | Supabase Auth (JWT), Google OAuth 2.0                                      |
| **AI**       | Google Gemini API (relevancy scoring, prompt templates)                     |
| **Caching**  | Caffeine (W-TinyLFU eviction)                                              |
| **Email**    | Brevo (Sendinblue) SMTP API                                                |
| **PDF**      | OpenPDF (LibrePDF)                                                         |
| **API Docs** | SpringDoc OpenAPI 2.7 + Swagger UI                                         |
| **Build**    | Maven (backend), npm (frontend)                                            |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  Vite Dev Server :5173                               │
│  ┌─────────┬──────────┬──────────┬────────────────┐  │
│  │  Pages  │Components│   Lib    │   Auth (Supa)  │  │
│  └────┬────┴────┬─────┴────┬─────┴───────┬────────┘  │
│       │         │          │             │            │
└───────┼─────────┼──────────┼─────────────┼────────────┘
        │  REST   │          │  Supabase   │
        │  API    │          │  JS SDK     │
┌───────┼─────────┼──────────┼─────────────┼────────────┐
│       ▼         ▼          │             ▼            │
│  ┌──────────────────┐      │     ┌──────────────┐     │
│  │   Spring Boot    │      │     │ Supabase Auth│     │
│  │   REST API :8080 │      │     └──────┬───────┘     │
│  │  ┌────────────┐  │      │            │ JWT         │
│  │  │ Controllers│  │      │            │             │
│  │  │ Services   │  │◄─────┼────────────┘             │
│  │  │ Repos      │  │      │                          │
│  │  └─────┬──────┘  │      │                          │
│  │        │         │      │                          │
│  │  ┌─────▼──────┐  │      │    ┌──────────────────┐  │
│  │  │  Caffeine  │  │      │    │  Google Gemini   │  │
│  │  │   Cache    │  │      │    │    AI API        │  │
│  │  └────────────┘  │      │    └──────────────────┘  │
│  └────────┬─────────┘      │                          │
│           │                │                          │
│     ┌─────▼────────────────▼───┐                      │
│     │   PostgreSQL (Supabase)  │                      │
│     │   Connection via HikariCP│                      │
│     └──────────────────────────┘                      │
│                Backend Layer                          │
└───────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- **Java 24** (or compatible JDK)
- **Node.js 18+** and **npm**
- **Maven 3.9+**
- A **Supabase** project (for PostgreSQL + Auth)

### 1. Clone the Repository

```bash
git clone https://gitlab.com/sumeetkb/question-bank.git
cd question-bank
```

### 2. Backend Setup

```bash
cd backend
```

Create a `.env` file with your credentials:

```env
DB_URL=jdbc:postgresql://<your-supabase-host>:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=<your-db-password>
SUPABASE_URL=https://<your-project>.supabase.co
GEMINI_API_KEY=<your-gemini-api-key>
BREVO_API_KEY=<your-brevo-api-key>
BREVO_SMTP_KEY=<your-brevo-smtp-key>
```

Run the backend:

```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Verify

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Frontend**: [http://localhost:5173](http://localhost:5173)

## API Documentation

Interactive API documentation is auto-generated via SpringDoc OpenAPI and available at:

| Endpoint              | Description          |
|-----------------------|----------------------|
| `/swagger-ui.html`    | Swagger UI explorer  |
| `/api-docs`           | OpenAPI 3.0 JSON spec|

### Key API Endpoints

| Method | Endpoint                   | Description                     |
|--------|----------------------------|---------------------------------|
| GET    | `/api/questions`           | List/search questions           |
| POST   | `/api/questions`           | Create a new question           |
| GET    | `/api/categories`          | List all categories             |
| GET    | `/api/companies`           | List all companies              |
| GET    | `/api/tags`                | List all tags                   |
| GET    | `/api/sessions`            | List interview sessions         |
| POST   | `/api/emails/send`         | Send interview prep emails      |
| GET    | `/api/admin/dashboard`     | Admin dashboard metrics         |
| GET    | `/api/admin/users`         | Admin user management           |

## Project Structure

```
question-bank/
├── backend/                          # Spring Boot API
│   ├── pom.xml                       # Maven dependencies
│   └── src/main/java/com/qb/
│       ├── QuestionbankApiApplication.java
│       ├── ai/                       # AI module (Gemini integration)
│       │   ├── controller/           # AI endpoints
│       │   ├── dto/                  # AI request/response DTOs
│       │   ├── llm/                  # LLM client & prompt templates
│       │   └── service/              # AI business logic
│       ├── auth/                     # Authentication module
│       │   ├── config/               # Security configuration
│       │   ├── filter/               # JWT filter chain
│       │   ├── model/                # Auth models
│       │   ├── repository/           # Auth data access
│       │   └── service/              # Auth services
│       ├── config/                   # App configuration
│       │   ├── CacheConfig.java      # Caffeine cache setup
│       │   ├── OpenApiConfig.java    # Swagger config
│       │   └── WebMvcConfig.java     # CORS config
│       └── core/                     # Core business logic
│           ├── controller/           # REST controllers
│           ├── dto/                  # Data transfer objects
│           ├── entity/               # JPA entities
│           ├── enums/                # Difficulty, Round enums
│           ├── exception/            # Global exception handling
│           ├── repository/           # Spring Data repositories
│           ├── scheduler/            # Cron job schedulers
│           └── service/              # Business services
│
├── frontend/                         # React SPA
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                   # Route definitions
│       ├── components/               # Reusable UI components
│       ├── lib/                      # Utilities & API client
│       │   ├── api.ts                # Backend API integration
│       │   ├── auth.tsx              # Supabase auth context
│       │   ├── categories.ts         # Category definitions
│       │   ├── supabase.ts           # Supabase client init
│       │   └── types.ts              # TypeScript type definitions
│       └── pages/                    # Page components
│           ├── HomePage.tsx
│           ├── LoginPage.tsx
│           ├── SignupPage.tsx
│           ├── QuestionsPage.tsx
│           ├── UserDashboardPage.tsx
│           ├── Admin*.tsx            # Admin panel pages
│           └── ...
│
├── docs/                             # Project documentation
│   ├── ROADMAP.md
│   ├── TODO.md
│   ├── SECURITY.md
│   ├── Categories-v1.md
│   ├── CronJobs.md
│   ├── RelevancyScore.md
│   ├── USER_DASHBOARD.md
│   └── caching-strategy.md
│
├── .gitignore
├── LICENSE
└── README.md
```

## Environment Variables

| Variable         | Required | Description                              |
|------------------|----------|------------------------------------------|
| `DB_URL`         | ✅       | PostgreSQL JDBC connection string         |
| `DB_USERNAME`    | ✅       | Database username                         |
| `DB_PASSWORD`    | ✅       | Database password                         |
| `SUPABASE_URL`   | ✅       | Supabase project URL                      |
| `GEMINI_API_KEY` | ❌       | Google Gemini API key (for AI features)   |
| `BREVO_API_KEY`  | ❌       | Brevo API key (for email dispatch)        |
| `BREVO_SMTP_KEY` | ❌       | Brevo SMTP key (for email dispatch)       |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Merge Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## License

Distributed under the AGPL-3.0 License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by the QuestionBank Team
</p>
