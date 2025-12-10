# Implementation Verification Checklist: AI Robotics Textbook with RAG Chatbot

**Purpose**: This comprehensive checklist is designed for QA teams to verify the correct implementation of all features across both Phase 1 and Phase 2 of the AI Robotics Textbook project. It prioritizes automated checks and includes example commands where applicable.

## 1. UX & Navigation

- [ ] UX-001: Landing page displays hero section, title, and "Tutorials" link.
  — **HOW**: Manual: Open `book/` root in browser.
  — **EXPECTED**: Hero section is visually prominent, project title is clear, and "Tutorials" link navigates to `/docs/intro`.
- [ ] UX-002: Navigation links in sidebar correctly lead to respective documentation pages.
  — **HOW**: Manual: Click various links in the sidebar navigation.
  — **EXPECTED**: Each link loads the correct content page without errors.
- [ ] UX-003: Site-wide `ChatWidget` component is consistently visible and accessible on all content pages.
  — **HOW**: Manual: Navigate through several `book/docs/` pages.
  — **EXPECTED**: Chat widget icon/button is present and consistently positioned.
- [ ] UX-004: "Ask about selection" functionality correctly captures selected text and initiates a chat query.
  — **HOW**: Manual: Select text on a doc page and activate the "Ask about selection" feature.
  — **EXPECTED**: The chat input field pre-populates with the selected text as a query.
- [ ] UX-005: User can freely type and submit queries into the `ChatWidget` input field.
  — **HOW**: Manual: Type a question into the chat input and press Enter or click send.
  — **EXPECTED**: The query appears in the chat history, and a response (or loading indicator) is displayed.
- [ ] UX-006: Chat history is displayed in a readable format within the `ChatWidget`.
  — **HOW**: Manual: Submit multiple queries and observe the chat window.
  — **EXPECTED**: User queries and bot responses are clearly distinguishable.
- [ ] UX-007: Citations from RAG query responses are clickable and navigate to the correct document URL.
  — **HOW**: Manual: Submit a query that should yield citations, then click on the citation links.
  — **EXPECTED**: Clicking a citation opens the corresponding documentation page at the correct section.
- [ ] UX-008: Site responsiveness ensures usability across desktop, tablet, and mobile breakpoints.
  — **HOW**: Manual: Resize browser window or use developer tools to simulate different device sizes.
  — **EXPECTED**: Layouts adapt gracefully, text is readable, and interactive elements remain functional.

## 2. Chatbot Behavior & Correctness

- [ ] CHAT-001: RAG query endpoint `/api/rag/query` returns a valid JSON response for a known query.
  — **HOW**: Automated: `curl -X POST http://localhost:8000/api/rag/query -H "Content-Type: application/json" -d '{"query": "What is physical AI?"}'`
  — **EXPECTED**: HTTP 200 OK and response contains `{"answer": "...", "sources": [...]}` with relevant content.
- [ ] CHAT-002: RAG chatbot provides answers grounded in indexed documents, with citations.
  — **HOW**: Automated/Manual: Submit queries from `tests/e2e/test_rag_pipeline.py`.
  — **EXPECTED**: Answers are factually correct according to the source documents, and citations link to the correct documents.
- [ ] CHAT-003: Chatbot handles queries where context (selected text) is provided, restricting its answer to that context.
  — **HOW**: Automated/Manual: `curl -X POST http://localhost:8000/api/rag/query -H "Content-Type: application/json" -d '{"query": "Explain this.", "context": "Physical AI is..."}'`
  — **EXPECTED**: Answer is based *only* on the provided context string.
- [ ] CHAT-004: Chatbot returns a helpful response for out-of-scope or unanswerable queries.
  — **HOW**: Manual: Submit queries unrelated to the textbook content.
  — **EXPECTED**: Bot gracefully declines to answer or states it cannot find relevant information.
- [ ] CHAT-005: Chatbot response time for `/api/rag/query` meets performance goals (p95 < 500ms).
  — **HOW**: Automated: Load testing tool (e.g., k6, Locust) against `/api/rag/query` endpoint.
  — **EXPECTED**: p95 latency for response is under 500ms under expected load.
- [ ] CHAT-006 (Phase 2): Personalization feature rewrites chapter content based on user profile.
  — **HOW**: Manual: Log in, set a user profile, navigate to a chapter, and activate personalization.
  — **EXPECTED**: Chapter text is observably rewritten/rephrased according to the profile settings.
- [ ] CHAT-007 (Phase 2): Urdu translation toggle correctly translates chapter content.
  — **HOW**: Manual: Navigate to a chapter and activate the Urdu translation toggle.
  — **EXPECTED**: Chapter text is translated into Urdu.

## 3. Data Integrity (Qdrant + Neon)

- [ ] DATA-001: Qdrant collection `ai_robotics_textbook` exists with correct vector size (768).
  — **HOW**: Automated: `qdrant-client.get_collection(collection_name='ai_robotics_textbook')` or Qdrant Cloud UI.
  — **EXPECTED**: Collection exists and `config.vector_params.size` is 768.
- [ ] DATA-002: Neon Postgres `documents` table exists with correct schema.
  — **HOW**: Automated: Connect to Neon DB and query `\d documents`.
  — **EXPECTED**: Table exists with `id`, `title`, `url`, `indexed_at` columns.
- [ ] DATA-003: Neon Postgres `chunks` table exists with correct schema and foreign key.
  — **HOW**: Automated: Connect to Neon DB and query `\d chunks`.
  — **EXPECTED**: Table exists with `id`, `document_id` (FK), `content`, `created_at` columns.
- [ ] DATA-004: Data consistency: documents and chunks stored in Neon correspond to vectors in Qdrant.
  — **HOW**: Automated: Run ingest script, then verify a sample `document_id` and `chunk_id` from Qdrant can be found in Neon, and vice-versa.
  — **EXPECTED**: All indexed content is consistently represented across both databases.
- [ ] DATA-005 (Phase 2): Neon Postgres `users` table exists with correct schema.
  — **HOW**: Automated: Connect to Neon DB and query `\d users`.
  — **EXPECTED**: Table exists with `id`, `email`, `profile`, `created_at` columns.

## 4. Ingest Pipeline Robustness

- [ ] INGEST-001: `ingest.py` script successfully processes `.md` and `.mdx` files from `book/docs`.
  — **HOW**: Automated: `python backend/scripts/ingest.py --dry-run`.
  — **EXPECTED**: Script completes without errors, and reports extracted documents and chunks.
- [ ] INGEST-002: Ingest pipeline correctly extracts text content, stripping frontmatter and complex React components.
  — **HOW**: Manual/Automated: Inspect `content` field in Neon `chunks` table for indexed MDX files.
  — **EXPECTED**: `content` contains only clean text relevant for RAG, without Docusaurus-specific syntax or React components.
- [ ] INGEST-003: Text chunking logic correctly splits content into overlapping chunks (e.g., 512 tokens with 64 overlap).
  — **HOW**: Manual/Automated: After ingestion, query Neon `chunks` table and check `content` length and overlap for consecutive chunks.
  — **EXPECTED**: Chunks are of appropriate size and show expected overlap.
- [ ] INGEST-004: Ingest script is idempotent: re-running it does not duplicate existing content or embeddings.
  — **HOW**: Automated: Run `python backend/scripts/ingest.py` twice on the same dataset.
  — **EXPECTED**: No duplicate entries in Qdrant or Neon; script reports that existing content was skipped or updated.
- [ ] INGEST-005: Error handling in `ingest.py` gracefully manages malformed MDX files or API failures.
  — **HOW**: Automated: Introduce a malformed MDX file or temporarily disable Qdrant/Gemini API access, then run `ingest.py`.
  — **EXPECTED**: Script logs errors clearly and continues processing other valid files, or exits cleanly with an error message.

## 5. Security & Secrets

- [ ] SEC-001: Sensitive API keys (GOOGLE_API_KEY, QDRANT_API_KEY) are stored as environment variables, not committed to code.
  — **HOW**: Automated: `grep -r "GOOGLE_API_KEY" backend/` (and QDRANT, NEON).
  — **EXPECTED**: No hardcoded API keys found in the repository.
- [ ] SEC-002: Backend `/api` endpoints are protected from common web vulnerabilities (e.g., SQL injection, XSS).
  — **HOW**: Automated: Run a web vulnerability scanner (e.g., OWASP ZAP, Nessus) against the deployed backend.
  — **EXPECTED**: No critical or high-severity vulnerabilities reported.
- [ ] SEC-003: Rate limiting is implemented on `/api/rag/query` to prevent abuse.
  — **HOW**: Automated: Use `locust` or `k6` to send a high volume of requests to `/api/rag/query` from a single IP.
  — **EXPECTED**: After a threshold, requests receive HTTP 429 Too Many Requests response.
- [ ] SEC-004: Frontend prevents excessive requests to the backend (request throttling).
  — **HOW**: Manual: Rapidly click the "Ask" button in the chat widget.
  — **EXPECTED**: Frontend UI prevents multiple concurrent requests or displays a "please wait" message.
- [ ] SEC-005 (Phase 2): User authentication secures access to personalized features.
  — **HOW**: Manual: Attempt to access personalization features without logging in.
  — **EXPECTED**: Access is denied or redirected to login page.

## 6. Accessibility & Responsiveness

- [ ] ACC-001: All interactive elements in the Docusaurus site and `ChatWidget` are keyboard-navigable.
  — **HOW**: Manual: Use Tab, Shift+Tab, Enter, Spacebar to navigate and interact with the site.
  — **EXPECTED**: All links, buttons, and form fields are reachable and actionable via keyboard.
- [ ] ACC-002: Semantic HTML is used correctly for content structure and accessibility.
  — **HOW**: Automated: Use a linter (e.g., `axe-core`, `eslint-plugin-jsx-a11y`) or manual inspection of HTML output.
  — **EXPECTED**: No major accessibility violations reported related to semantic structure.
- [ ] ACC-003: Sufficient color contrast is maintained for text and UI elements.
  — **HOW**: Automated: Use a color contrast checker tool (e.g., Lighthouse, WebAIM Contrast Checker).
  — **EXPECTED**: All text and critical UI elements meet WCAG AA contrast standards.
- [ ] ACC-004: Image elements (e.g., Docusaurus logo, chapter images) have appropriate alt text.
  — **HOW**: Automated: Use a browser extension or accessibility checker to inspect images.
  — **EXPECTED**: All meaningful images have descriptive alt attributes.
- [ ] ACC-005: Site is fully functional and navigable on mobile devices (responsiveness check).
  — **HOW**: Manual: Use mobile device or browser developer tools to simulate mobile viewports.
  — **EXPECTED**: Layouts are optimized for small screens, text is legible, and controls are tappable.

## 7. Performance & Cost Controls

- [ ] PERF-001: Frontend asset loading times are optimized and meet performance benchmarks.
  — **HOW**: Automated: Use Lighthouse or PageSpeed Insights.
  — **EXPECTED**: Performance scores (e.g., FCP, LCP) are within acceptable limits.
- [ ] PERF-002: Backend API response times (especially `/api/rag/query`) meet specified p95 latency targets.
  — **HOW**: Automated: Run load tests (e.g., k6, Locust) against deployed `/api` endpoints.
  — **EXPECTED**: p95 latency < 500ms for `/api/rag/query`.
- [ ] PERF-003: Gemini API calls per RAG query are minimized (e.g., one embedding call, one generation call per user query).
  — **HOW**: Automated: Monitor Gemini API usage logs during RAG query tests.
  — **EXPECTED**: Number of calls matches expected usage pattern to control cost.
- [ ] PERF-004: Ingest pipeline efficiently uses Gemini embeddings, potentially with batching.
  — **HOW**: Automated: Monitor Gemini API usage logs during `ingest.py` execution.
  — **EXPECTED**: Embedding calls are batched efficiently, or cost-effective strategies are employed.
- [ ] PERF-005: Logging in the backend provides sufficient detail for performance monitoring and debugging without being overly verbose.
  — **HOW**: Manual: Inspect backend application logs during operation.
  — **EXPECTED**: Logs contain request durations, error details, and system metrics at appropriate levels.

## 8. Demo Readiness

- [ ] DEMO-001: All Phase 1 features are fully implemented, functional, and integrated.
  — **HOW**: Automated: Run `tests/e2e/test_rag_pipeline.py`.
  — **EXPECTED**: All E2E tests pass, and manual verification confirms full functionality.
- [ ] DEMO-002: Staging environment is deployed and accessible with all current features.
  — **HOW**: Manual: Access the deployed staging URLs for frontend and backend.
  — **EXPECTED**: Both frontend and backend services are live and responsive.
- [ ] DEMO-003: A short demo video (<90s) showcasing Phase 1 functionality can be recorded.
  — **HOW**: Manual: Record a walk-through of the main features (site navigation, RAG chatbot interaction, citation checking).
  — **EXPECTED**: Video clearly demonstrates the acceptance criteria for Phase 1.
- [ ] DEMO-004 (Phase 2): Login, personalization, and Urdu translation features are fully implemented and integrated.
  — **HOW**: Manual: Perform end-to-end tests for each Phase 2 feature.
  — **EXPECTED**: All Phase 2 features work as specified.
- [ ] DEMO-005 (Phase 2): A working demo or documentation exists for Claude-powered subagents.
  — **HOW**: Manual: Review documentation or access the demo.
  — **EXPECTED**: Functionality of Claude subagents is clearly demonstrated.
- [ ] DEMO-006: A comprehensive runbook exists for setting up and running the application, including deployment steps.
  — **HOW**: Manual: Review the project's documentation.
  — **EXPECTED**: Clear instructions for setup, deployment, and operation are provided.