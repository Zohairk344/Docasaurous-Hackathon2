# Tasks: AI Robotics Textbook with RAG Chatbot

**Input**: Design documents from `specs/002-ai-robotics-textbook/`
**Prerequisites**: plan.md, spec.md

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- **Web app**: `backend/src/`, `book/src/`

---

## Phase 1: Required Features (Priority: P0)

**Goal**: Implement the core Docusaurus site, RAG backend, and chat functionality.
**Independent Test**: An end-to-end test will verify that a query about content in a sample document returns a correct answer with citations.

### Implementation for Phase 1

- [ ] T001 Initialize Docusaurus site in `book/`, create landing page, Tutorials page, and docs skeleton with MDX placeholders.
- [ ] T002 [P] Implement frontend `ChatWidget` component in `book/src/components/ChatWidget.tsx`.
- [ ] T003 [P] Implement FastAPI backend skeleton in `backend/src/`, including config loading and a `/api/health` endpoint.
- [ ] T004 [P] Integrate Qdrant client and create a script to initialize the collection in `backend/src/services/qdrant_service.py`.
- [ ] T005 [P] Integrate Neon client and create a DB migration script for initial schema in `backend/src/services/db_service.py`.
- [ ] T006 Implement the ingestion pipeline script in `backend/scripts/ingest.py` (Depends on T004, T005).
- [ ] T007 Implement the RAG endpoint at `/api/rag/query` in `backend/src/api/rag.py` (Depends on T004, T005).
- [ ] T008 Implement the placeholder translate endpoint at `/api/translate` in `backend/src/api/translate.py`.
- [ ] T009 Wire the `ChatWidget` to the `/api/rag/query` endpoint and implement UI for showing citations in `book/src/components/ChatWidget.tsx` (Depends on T007).
- [ ] T010 Create an end-to-end test script in `tests/e2e/test_rag_pipeline.py` to ingest docs and verify a query.
- [ ] T011 Create `Dockerfile` for the backend and `vercel.json` (or similar) for the frontend for staging deployment.

**How to Test Phase 1**: Run the `ingest.py` script with sample documents. Then run `test_rag_pipeline.py` to verify the RAG functionality. Manually verify the chat widget on the deployed staging site.

**Commit & PR Strategy**: One commit per task. Create a single PR for "Phase 1 Required Features" once all tasks are complete and tested. PR title should be `feat(rag): Implement Phase 1 required features`. Require linting and the E2E test to pass before merging.

---

## Phase 2: Bonus Features (Priority: P1)

**Goal**: Implement bonus features like authentication, personalization, and translation after Phase 1 is accepted.
**Independent Test**: Each feature will have its own set of tests (e.g., auth tests, personalization rewrite tests).

### Implementation for Phase 2

- [ ] T101 Integrate better-auth.com for signup/signin and create user records in Neon DB.
- [ ] T102 Implement personalization API endpoint and a "Personalize" button on the frontend to trigger a content rewrite.
- [ ] T103 Implement the full Urdu translation feature on the client-side, connected to the `/api/translate` endpoint.
- [ ] T104 Document and create a demo for a reusable Claude-powered subagent or agent skill.
- [ ] T105 Add unit and integration tests for the authentication and personalization flows.
- [ ] T106 Prepare final demo video assets and a runbook for the full-featured application.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Required)**: Can start immediately. All tasks within this phase must be completed for the core product to be functional.
- **Phase 2 (Bonus)**: Depends on the successful completion and acceptance of Phase 1.

### Task Dependencies (within Phase 1)

- `T006` (Ingest Pipeline) depends on `T004` (Qdrant) and `T005` (Neon).
- `T007` (RAG Endpoint) depends on `T004` (Qdrant) and `T005` (Neon).
- `T009` (Chat Widget Wire-up) depends on `T007` (RAG Endpoint).
- `T010` (E2E Test) depends on `T006` (Ingest) and `T007` (RAG).

### Parallel Opportunities

- Tasks marked with `[P]` can be worked on in parallel.
- `T001`, `T002`, `T003`, `T004`, `T005` can largely be developed in parallel at the start.
- Phase 2 tasks are mostly independent of each other and can be parallelized after Phase 1 is complete.

---

## Implementation Strategy

### MVP First (Phase 1)

1.  Complete all tasks in Phase 1 (`T001` - `T011`).
2.  **STOP and VALIDATE**: Run the E2E test and manually verify the staging deployment.
3.  The result is a functional MVP that can be demonstrated.

### Incremental Delivery

1.  After the MVP is validated, proceed to Phase 2 tasks.
2.  Each feature in Phase 2 (Auth, Personalization, etc.) can be developed, tested, and deployed as a separate increment.

---
## Next Action

Start with task T001: Initialize Docusaurus site in `book/`, create landing page, Tutorials page, and docs skeleton with MDX placeholders.
