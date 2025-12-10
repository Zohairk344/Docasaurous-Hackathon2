---
id: 004
title: Create Technical Plan for AI Robotics Textbook
stage: plan
date: 2025-12-10
surface: agent
model: gemini-pro
feature: 002-ai-robotics-textbook
branch: 002-ai-robotics-textbook
user: unspecified
command: /sp.plan
labels: [planning, architecture, RAG]
links:
  spec: specs/002-ai-robotics-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-ai-robotics-textbook/plan.md
tests:
  - none
---

## Prompt

/sp.plan                                 This plan follows the accepted defaults and the specification for a Docusaurus textbook site with an embedded Gemini-based RAG chatbot, FastAPI backend, Qdrant vector DB, and Neon Postgres metadata. No auth/personalization for v1. Future phases include better-auth signup, personalization, Urdu translation button, and Claude subagents (bonus features).

Objective:
Produce a concrete, developer-actionable technical plan that covers architecture, components, data contracts, API endpoints, file-level artifacts, deployment targets, CI, testing strategy, monitoring, and phased scope (v1 required features first, bonus features second). Keep decisions consistent with the constitution and spec.

Deliverables (what the agent should output):
1. System architecture diagram (textual + component list) describing frontend, backend, vector DB, metadata DB, and third-party services.
2. Concrete list of frameworks, libraries, and versions to use.
3. Detailed API spec (endpoints, request/response schemas) for:
   - Ingest pipeline
   - RAG query
   - Translate
   - Health
4. Qdrant collection payload schema and configuration.
5. Neon Postgres schema (documents, chunks, queries, users placeholder) with CREATE TABLE statements.
6. Ingest pipeline design: MDX→plain text, chunking rules, embedding calls, error handling, re-try logic.
7. RAG query flow: embedding → vector search → prompt template(s) for Gemini generation, citation rules, multi-turn context rules.
8. Frontend artifact list with file paths (Docusaurus pages, components, CSS, utility files) and event contracts for selection capture and chat widget.
9. Deployment plan: recommended providers for frontend & backend, dockerfile template, environment variables and secret management guidance, staging -> production flow.
10. Testing strategy: unit tests, integration tests, and E2E smoke tests; health checks.
11. Security & cost controls: rate limiting, API key safety, request throttling, logging.
12. Phased roadmap: Phase 1 (required features) and Phase 2 (bonus features). For each phase include acceptance criteria and minimal demo checklist.

Constraints & assumptions:
- Use Google Generative AI (Gemini) for both embeddings and generation; confirm embedding model & vector size at runtime.
- Use Qdrant Cloud (hosted) and Neon Serverless Postgres.
- No user auth in Phase 1.
- Frontend uses Docusaurus v3 with MDX pages.

Priority & phasing (must be reflected in output):
Phase 1 (Required, implement first):
  - Docusaurus site with landing page + Tutorials index + docs skeleton (MDX placeholders).
  - FastAPI backend with /api/rag/query, /api/translate, /api/health.
  - Ingest scripts to index sample MDX docs into Qdrant + Neon.
  - ChatWidget component integrated site-wide with selection capture "Ask about selection".
  - Basic deployable staging environment (frontend + backend).
Phase 2 (Bonus, implement after Phase 1 acceptance):
  - Signup & Signin using better-auth.com and Neon user records.
  - Personalize button per chapter that rewrites content for user background.
  - Urdu translation toggle (client-side) integrated per chapter.
  - Reusable intelligence: Claude Code subagents & agent skills (documented & demo).
  - Unit tests for personalization & auth flows.

Success criteria (for each phase):
- Phase 1 acceptance: site deployed, chatbot answers queries from indexed docs, selected-text queries return answers restricted to selected text, health endpoints pass, ingest scripts have indexed at least 5 sample chapters, staging demo recorded (<90s).
- Phase 2 acceptance: login works, personalization modifies chapter view per saved profile, Urdu translate works, subagents demo exists.

Execution notes (how plan should be used by implementers):
- Provide exact package versions and reproducible commands.
- Use idempotent scripts for ingestion and DB setup.
- Provide fallback behavior if Gemini embed model or vector size differs.
- Document Terraform/host steps as notes (not required to run).

Return format:
- A structured Markdown document containing numbered sections for each deliverable above, plus code snippets for API schemas, SQL DDL, sample prompt templates, Dockerfile template, and command list to bootstrap the environment.
- A short text "Next steps" that instructs the next Speckit command to run (/speckit.analyze).

Do not implement code here — produce only the technical plan artifacts described.

## Response snapshot

I have created the detailed technical plan as requested. The plan is located at `specs/002-ai-robotics-textbook/plan.md`. It covers all the specified deliverables, including system architecture, API specifications, database schemas, and a phased roadmap.

## Outcome

- ✅ Impact: A comprehensive technical plan was created, enabling the development team to proceed with implementation.
- 🧪 Tests: No tests were run as this was a planning task.
- 📁 Files: `specs/002-ai-robotics-textbook/plan.md` was created.
- 🔁 Next prompts: The user can now run `/sp.tasks` to break down the plan into actionable tasks.
- 🧠 Reflection: The initial attempt to run the helper script failed due to incorrect parameter assumptions. After inspecting the script, I was able to execute it correctly and proceed with generating the plan. The user's prompt was very detailed, which made generating the plan straightforward.

## Evaluation notes (flywheel)

- Failure modes observed: Incorrect script execution due to assuming parameters that didn't exist.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment: In a similar situation, I will inspect helper scripts before executing them to understand their parameters.
