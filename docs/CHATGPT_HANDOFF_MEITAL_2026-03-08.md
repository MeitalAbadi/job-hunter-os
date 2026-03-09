# Job Hunter OS - Handoff For ChatGPT (Meital)

Date: 2026-03-08  
Owner: Meital Abadi  
Mode: Personal single-user system (no multi-user login flow required)

## 1) Product Goal

Build a serious Personal Job-Search OS for Meital in the Israeli high-tech market, optimized for:

1. Speed to interview
2. Quality of role/company match
3. Referral opportunities
4. Salary upside

## 2) Current Technical Snapshot

### Stack

- Next.js 14 (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod validation
- Anthropic SDK (server-side only)

### Runtime Mode

- Project currently runs in **single-user personal mode**.
- No login is required in normal use.
- A helper resolves/creates one local owner context:
  - `lib/auth/single-user.ts`

### Project Root

- `/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

## 3) Key Internal Structure

### Core Folders

- `app/` - dashboard pages + API routes
- `lib/` - business logic (scoring, ingestion, resume/outreach generation, auth helper)
- `prisma/` - schema + seed
- `components/` - UI components

### Important Files

- Schema: `prisma/schema.prisma`
- Single-user context: `lib/auth/single-user.ts`
- Job ingestion engine: `lib/adapters/jobs/ingest.ts`
- Scoring engine: `lib/scoring/engine.ts`
- Resume engine: `lib/resume/engine.ts`
- Outreach engine: `lib/outreach/engine.ts`
- Validation schemas: `lib/schemas/index.ts`
- Jobs API: `app/api/jobs/route.ts`
- Jobs ingest API: `app/api/jobs/ingest/route.ts`
- Applications API: `app/api/applications/route.ts`
- Application update API: `app/api/applications/[id]/route.ts`
- Resumes API: `app/api/resumes/route.ts`
- Profile API: `app/api/profile/route.ts`
- Outreach API: `app/api/outreach/route.ts`

## 4) Database Design (High-Level)

Main models currently present:

- `User`
- `CandidateProfile`
- `Skill`, `CandidateSkill`
- `Project`
- `Company`
- `Job`
- `JobScore`
- `ResumeVersion`
- `OutreachContact`, `OutreachMessage`
- `Application`, `ApplicationStageEvent`
- `IngestionRun`
- `Experiment`

This is already a production-oriented schema, not only demo state.

## 5) What Works Today (End-to-End)

### A) Job Intake + Ranking

Current flow:

1. User pastes a JD manually in Jobs page.
2. API `POST /api/jobs/ingest` validates payload with Zod.
3. `lib/adapters/jobs/ingest.ts` calls LLM extraction to structured fields.
4. Dedup hash is computed and checked.
5. Job is persisted.
6. Deterministic scoring is computed in `lib/scoring/engine.ts`.
7. LLM explanation is generated as narrative only (does not alter deterministic numeric score).
8. Score is stored in `JobScore`.

### B) Applications CRM

Current flow:

1. User adds application manually or from selected job.
2. API `POST /api/applications` creates record.
3. Stage history is tracked in `ApplicationStageEvent`.
4. Updates via `PATCH /api/applications/[id]`.
5. Deletion via `DELETE /api/applications/[id]`.

### C) Resume Versioning

Current flow:

1. User selects job and clicks generate resume.
2. `POST /api/resumes` triggers `lib/resume/engine.ts`.
3. Engine chooses relevant projects/skills deterministically.
4. LLM generates structured resume payload (validated by Zod).
5. Resume version is saved in `ResumeVersion`.

### D) Outreach Drafts

Current flow:

1. User enters company/role/context.
2. `POST /api/outreach` calls `lib/outreach/engine.ts`.
3. System returns:
   - target persona
   - search query for LinkedIn/manual search
   - connection request
   - follow-up
   - referral ask

## 6) Important Truths (Current Limitations)

### Job Discovery

- **There is no automated crawler yet** for Telegram/LinkedIn/Greenhouse.
- Job discovery is currently manual ingestion by paste.

### CV Submission

- System currently **generates tailored CV versions**, but **does not auto-submit** applications.
- Sending is human-in-the-loop (manual apply), which is good for compliance.

### Keys/Env

- `ANTHROPIC_API_KEY` must be real in `.env.local` for AI features.
- Prisma CLI reads `.env`, not `.env.local` by default.

## 7) How Meital Can Use Telegram Job Groups Right Now

Current practical workflow:

1. Open Telegram daily job posts.
2. Copy each relevant post/JD text.
3. Paste into Jobs -> "Analyze & Add Job".
4. Review fit score + strengths/risks.
5. Decide:
   - `STRONG_APPLY` / `APPLY` -> generate resume + add application
   - `STRETCH_APPLY` -> optional
   - `LOW_PRIORITY` / `SKIP` -> ignore
6. Track all active opportunities in Applications CRM.

This is the current best path until Telegram ingestion automation is added.

## 8) Requested Next Major Upgrade: Deep Candidate Intake

Goal: system should ask comprehensive questions to build a high-quality personal knowledge graph.

### Must-Capture Areas

1. Career goals and constraints
2. Role targeting and market preference
3. Technical stack depth (strong / medium / basic)
4. Project evidence (what was built, impact, scale, ownership)
5. Collaboration and leadership signals
6. Communication (Hebrew/English, writing/interview confidence)
7. Salary and negotiation constraints
8. Geographic/work-mode constraints
9. Red lines (companies/industries to avoid)
10. Outreach style preferences

### Suggested Implementation

Build a dedicated onboarding wizard:

- `/onboarding` multi-step form
- Save structured answers to new tables, e.g.:
  - `CandidateIntake`
  - `SkillEvidence`
  - `ExperienceEpisode`
  - `InterviewStory`
- Then use this richer data in scoring/resume/outreach engines.

## 9) Proposed Improvement Roadmap (Priority Order)

### Phase 1 (Immediate)

1. Build onboarding wizard + deep intake schema
2. Add score breakdown UI with factor-level numeric bars
3. Add "why not apply" explicit blockers
4. Add role-specific resume templates (DS / AI Eng / AI Analyst)

### Phase 2 (Job Discovery)

1. Telegram ingestion assistant:
   - Import exported messages / copied batches
   - Parse message -> normalize to job candidate
   - Dedup + scoring pipeline
2. Greenhouse/Lever URL parser from links found in posts
3. Daily inbox + triage queue

### Phase 3 (Execution Quality)

1. Interview conversion analytics dashboard
2. Resume A/B tracking by outcome
3. Outreach outcome learning loop
4. Priority queue based on expected interview probability * salary upside

## 10) Deep Intake Question Bank (For Meital)

Use these sections to interview and store answers in structured form:

### Identity & Goal

1. What is your exact target title for the next 3 months?
2. What titles are acceptable fallback options?
3. What is your minimum acceptable salary in ILS/month?
4. What is your ideal salary range?
5. Which cities are fully acceptable / partially acceptable / not acceptable?
6. Are you open to remote-only roles? Hybrid-only?

### Skills Mapping

For each skill/tool/language:

1. Current level: basic / intermediate / advanced / expert
2. Last time used
3. Real project evidence
4. Confidence for interview discussion
5. Confidence for production implementation

### Project Evidence

For each project:

1. Problem and business context
2. Exact technical ownership
3. Data scale
4. Tooling stack
5. Tradeoffs made
6. Results/impact metrics
7. Biggest failure and fix

### Interview Readiness

1. Which topics are strongest technically?
2. Which topics cause stress?
3. Which interview type is hardest: recruiter / technical / case / behavioral?
4. What support material is missing today?

### Market Targeting

1. Which 20 companies are top-priority?
2. Which domains are preferred? (AI infra, product analytics, etc.)
3. Which domains are no-go?
4. Which company stages preferred? (startup/growth/public)

## 11) Prompt To Paste Into A New ChatGPT Conversation

Paste this exactly:

---
I am continuing development of my personal Job Hunter OS project for Israeli high-tech roles.
Read and use this handoff as source-of-truth:

`/Users/meitalabadi/Desktop/Claude Learning/job-hunter/docs/CHATGPT_HANDOFF_MEITAL_2026-03-08.md`

Project root:
`/Users/meitalabadi/Desktop/Claude Learning/job-hunter`

Important constraints:
1. Single-user personal system (no multi-user login needed right now).
2. Keep all model keys server-side only.
3. Scoring must remain deterministic and explainable.
4. Job submission remains human-in-the-loop (no policy-violating automation).
5. Prioritize speed to interview + salary upside + referral leverage.

First task:
Design and implement a production-grade onboarding/intake module that asks me deep structured questions about my experience, skills, tools, project evidence, and career preferences, then persists this data and integrates it into scoring/resume/outreach.
---

## 12) Current "Search & Apply" Mechanism Explained Simply

### Search

- Today: manual discovery (Telegram/LinkedIn/other sources) -> paste JD into system.
- System: parses + scores + recommends apply/skip.

### Updated CV per Job

- System generates a tailored `ResumeVersion` for selected job.
- You manually review and then apply externally.

### Sending Applications

- System tracks applications and stage progression in CRM.
- Actual submission to external platforms is manual today.

---

If you ask an assistant to improve this project, tell it to work from this file and from the real codebase paths listed above.
