# Job Hunter OS

**AI-Powered Job Search Operating System** — A personal, full-stack application that automates the entire job search pipeline: from discovering opportunities to generating tailored resumes, scoring fit, and tracking applications.

Built for the Israeli high-tech market with a focus on Data Science, AI Engineering, and Analytics roles.

## What It Does

- **Automated Job Discovery** — Scrapes Telegram channels for new job postings on a schedule (4x/day)
- **Intelligent Scoring** — 8-factor deterministic scoring engine evaluates every job against your profile
- **Action Recommendations** — Decision layer classifies jobs into priority buckets: Apply Now, Apply This Week, Stretch Apply, Optional, Skip
- **Blocker Detection** — Identifies hard/soft blockers (location, language, experience, mandatory skills, salary)
- **Auto Resume Generation** — Generates tailored CVs for qualifying jobs with role-specific templates and emphasis variants
- **Daily Execution Queue** — Prioritized dashboard showing what to apply to today, this week, and what needs follow-up
- **Batch Ingestion** — Paste multiple Telegram posts at once for bulk processing
- **Analytics & Insights** — Conversion metrics, breakdowns by source/role/template, outreach impact analysis
- **Application CRM** — Full pipeline tracking from wishlist to offer
- **Outreach Engine** — Generate and track outreach messages to recruiters and hiring managers

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React (App Router)
- **Backend**: Next.js API Routes, Server Components
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Anthropic Claude API (server-side only)
- **Validation**: Zod schemas for all API payloads and LLM outputs
- **Auth**: NextAuth.js (`single-user only`)

## Architecture Highlights

- **Deterministic Scoring**: 8 weighted factors (role fit, must-have skills, nice-to-have, seniority, projects, domain, location, salary) produce explainable, reproducible scores
- **Non-Hallucinating Resume Engine**: 4-layer pipeline (select → generate → validate → persist) with Zod-validated LLM structured output
- **Dedup System**: SHA-256 hashing of company + title + location prevents duplicate entries
- **Role Template Inference**: Auto-detects the best resume template (Data Analyst, AI Analyst, Data Scientist, AI Engineer, BI/Product Analyst) from job titles
- **Emphasis Variants**: Same job can get analytics-heavy, AI-heavy, product-heavy, or engineering-heavy resume emphasis

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in: DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, SINGLE_USER_PASSWORD

# Push database schema
npx prisma db push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

Open: `http://localhost:3000`

Login is single-user only and uses password only (no email field).

## Key Pages

| Page | Description |
|------|-------------|
| Command Center | Dashboard overview with key metrics |
| Daily Queue | Prioritized execution dashboard — what to apply to today |
| Jobs Inbox | All discovered jobs with scoring, filtering, and action recommendations |
| Batch Ingest | Paste multiple Telegram posts for bulk processing |
| Applications | CRM pipeline tracking |
| Resumes | All generated resume versions with role templates |
| Analytics | Conversion metrics, breakdowns, and advisory insights |

## Database Schema

23 Prisma models covering: Users, Candidate Profiles, Skills (with evidence), Projects, Experience Episodes, Interview Stories, Companies, Jobs, Job Scores, Resume Versions, Outreach Contacts & Messages, Applications, Stage Events, Ingestion Runs, and Experiments.

## License

Private project — all rights reserved.
