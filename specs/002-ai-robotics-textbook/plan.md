# Implementation Plan: AI Robotics Textbook with RAG Chatbot

**Branch**: `002-ai-robotics-textbook` | **Date**: 2025-12-10 | **Spec**: [C:\Users\zohai\Desktop\IT Course\AI\spec-kit\hackathon3\specs\002-ai-robotics-textbook\spec.md](C:\Users\zohai\Desktop\IT Course\AI\spec-kit\hackathon3\specs\002-ai-robotics-textbook\spec.md)
**Input**: Feature specification from `specs/002-ai-robotics-textbook/spec.md`

## Summary

This plan outlines the technical implementation for creating a Docusaurus-based textbook site for AI Robotics. The site will feature an embedded RAG (Retrieval-Augmented Generation) chatbot powered by Google's Gemini models. The backend will be a FastAPI application, with Qdrant Cloud for vector storage and Neon Serverless Postgres for metadata. The project will be developed in two phases: Phase 1 focuses on the core textbook site and RAG functionality, while Phase 2 introduces bonus features like user authentication, personalization, and translation.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript (frontend)
**Primary Dependencies**: FastAPI, Docusaurus v3, `google-generativeai`, `qdrant-client`, `psycopg2-binary`
**Storage**: Qdrant Cloud (vector DB), Neon Serverless Postgres (metadata DB)
**Testing**: Pytest (backend), Jest & React Testing Library (frontend)
**Target Platform**: Web (Cloud providers like Vercel for frontend, Render for backend)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: API response time p95 < 500ms for RAG queries.
**Constraints**: Must use the specified technology stack. No user authentication in Phase 1.
**Scale/Scope**: Initial scope is to support the content of the AI Robotics textbook with a few hundred pages.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **Rulebook Fidelity**: Yes. The plan traces all features back to the specification.
*   **Scope Compliance**: Yes. The plan covers the Docusaurus book, RAG chatbot, and deployment.
*   **Tech Stack Adherence**: Yes. The plan uses Gemini, Qdrant, FastAPI, Neon, and Docusaurus.
*   **Prohibited Violations Check**: Yes. The plan does not invent requirements or use disallowed tech.
*   **Standards Adherence**: Yes. The plan will follow standard engineering and pedagogical practices.
*   **Optional Feature Alignment**: Yes. Bonus features are aligned with the spec for Phase 2.

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-robotics-textbook/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/             # FastAPI endpoints
│   ├── core/            # Configuration, settings
│   ├── services/        # Business logic (RAG, ingest)
│   └── models/          # Pydantic models
└── tests/
    ├── integration/
    └── unit/

book/
├── src/
│   ├── components/      # React components (e.g., ChatWidget)
│   ├── pages/           # Docusaurus pages
│   └── theme/           # Theming and styling
└── static/
```

**Structure Decision**: The project will use a monorepo structure with a `backend` directory for the FastAPI application and a `book` directory for the Docusaurus frontend, which matches the existing project layout.

## Implementation Details

### 1. System Architecture

*   **Frontend**: A Docusaurus v3 static site hosted on a provider like Vercel or Netlify. It will contain the textbook content as MDX files. A custom React `ChatWidget` component will be present on all pages.
*   **Backend**: A FastAPI application hosted on a provider like Render or Heroku. It exposes REST APIs for the RAG query, translation, and health checks.
*   **Vector DB**: A managed Qdrant Cloud instance. It will store text embeddings generated from the textbook content.
*   **Metadata DB**: A Neon Serverless Postgres instance. It will store metadata about the documents and text chunks, linking them to the vectors in Qdrant.
*   **AI Services**: Google Generative AI (Gemini) will be used for both generating text embeddings (`text-embedding-004`) and for the generative part of the RAG pipeline (e.g., `gemini-1.5-pro`).

### 2. Frameworks, Libraries, and Versions

*   **Backend**:
    *   `fastapi`: 0.110.0
    *   `uvicorn`: 0.29.0
    *   `pydantic`: 2.7.0
    *   `google-generativeai`: 0.5.0
    *   `qdrant-client`: 1.8.0
    *   `psycopg2-binary`: 2.9.9
    *   `python-dotenv`: 1.0.1
*   **Frontend**:
    *   `@docusaurus/core`: 3.2.0
    *   `@docusaurus/preset-classic`: 3.2.0
    *   `react`: 18.2.0
    *   `react-dom`: 18.2.0
*   **Ingestion Script**:
    *   `beautifulsoup4`: 4.12.3 (to parse MDX/HTML)
    *   `langchain` or custom script for chunking.

### 3. Detailed API Spec

All endpoints will be under the `/api` prefix.

#### `/api/rag/query` (POST)
*   **Request Body**:
    ```json
    {
      "query": "string",
      "context": "string | null" // Optional: for selected text
    }
    ```
*   **Response Body (Success)**:
    ```json
    {
      "answer": "string",
      "sources": [
        {
          "document_id": "string",
          "chunk_id": "string",
          "url": "string"
        }
      ]
    }
    ```
*   **Response Body (Error)**:
    ```json
    { "detail": "Error message" }
    ```

#### `/api/translate` (POST) - Phase 2
*   **Request Body**:
    ```json
    {
      "text": "string",
      "target_language": "string" // e.g., "Urdu"
    }
    ```
*   **Response Body (Success)**:
    ```json
    { "translated_text": "string" }
    ```

#### `/api/health` (GET)
*   **Response Body (Success)**:
    ```json
    { "status": "ok" }
    ```

### 4. Qdrant Collection Payload Schema

*   **Collection Name**: `ai_robotics_textbook`
*   **Vector Size**: `768` (for `text-embedding-004`)
*   **Payload Schema**:
    ```json
    {
      "document_id": "string", // e.g., 'physical-ai-foundations/ch01-what-is-physical-ai'
      "chunk_id": "uuid",
      "content": "string", // The text chunk
      "url": "string" // URL to the chapter
    }
    ```

### 5. Neon Postgres Schema

```sql
CREATE TABLE documents (
    id VARCHAR(255) PRIMARY KEY, -- Matches document_id from Qdrant
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    indexed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chunks (
    id UUID PRIMARY KEY, -- Matches chunk_id from Qdrant
    document_id VARCHAR(255) REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Placeholder for Phase 2
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile JSONB, -- For personalization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Ingest Pipeline Design

1.  A script (`ingest.py`) will scan the `book/docs` directory for `.md` and `.mdx` files.
2.  For each file, it will extract the main content, stripping out frontmatter and complex React components, possibly using a regex or a simple parser.
3.  The extracted text will be split into smaller, overlapping chunks (e.g., 512 tokens with 64 token overlap).
4.  For each chunk, a record is created in the `chunks` table in Postgres, and the document metadata is stored in the `documents` table.
5.  An embedding is generated for each chunk using the Gemini embedding model.
6.  The embedding and the payload (metadata) are upserted into the Qdrant collection.
7.  The script will be idempotent, checking for existing content to avoid re-indexing unless forced.

### 7. RAG Query Flow

1.  The frontend `ChatWidget` sends the user's query to the `/api/rag/query` backend endpoint.
2.  The backend generates an embedding for the user's query.
3.  The backend uses this embedding to perform a similarity search on the Qdrant collection, retrieving the top `k` (e.g., 5) most relevant text chunks.
4.  The retrieved chunks are formatted into a context for a prompt to the Gemini generative model.
5.  The prompt will instruct the model to answer the user's query based *only* on the provided context and to cite sources.
6.  The response from the model is parsed, and the answer and source information are sent back to the frontend.

### 8. Frontend Artifact List

*   `book/src/theme/Root.js`: To wrap the app and provide global state for the chat.
*   `book/src/components/ChatWidget/index.tsx`: The main chat interface component.
*   `book/src/components/ChatWidget/styles.css`: Styles for the chat widget.
*   `book/src/services/api.ts`: A module for making calls to the FastAPI backend.
*   `book/src/hooks/useChat.ts`: A React hook to manage chat state and interactions.
*   `book/docusaurus.config.ts`: Modified to include necessary client-side scripts or plugins.

### 9. Deployment Plan

*   **Frontend (Docusaurus)**: Deploy to **Vercel** or **Netlify**. Connect the Git repository for CI/CD.
*   **Backend (FastAPI)**: Deploy to **Render** or **Heroku** as a web service. Use a `Dockerfile` for deployment.
*   **Dockerfile Template**:
    ```dockerfile
    FROM python:3.11-slim

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY ./src /app/src

    CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
    ```
*   **Environment Variables**:
    *   `GOOGLE_API_KEY`
    *   `QDRANT_API_KEY`
    *   `QDRANT_HOST`
    *   `NEON_DATABASE_URL`
*   **Secrets Management**: Use the hosting provider's secret management system. Do not commit secrets to Git.

### 10. Testing Strategy

*   **Unit Tests**:
    *   Backend: Test individual functions (e.g., text chunking, prompt creation) using `pytest`.
    *   Frontend: Test React components and hooks using `jest` and `react-testing-library`.
*   **Integration Tests**:
    *   Test the API endpoints with mock calls to external services (Gemini, Qdrant).
*   **E2E Smoke Tests**:
    *   A simple script to verify that the deployed site is up, and the chat widget can get a response from the health endpoint.

### 11. Security & Cost Controls

*   **API Key Safety**: Store API keys as environment variables in the deployment environment.
*   **Rate Limiting**: Implement basic rate limiting on the FastAPI backend if abuse is detected (e.g., using `slowapi`).
*   **Request Throttling**: The frontend should prevent users from spamming requests to the backend.
*   **Logging**: Implement structured logging in the backend to monitor requests and errors.

### 12. Phased Roadmap

#### Phase 1 (Required)
*   **Features**:
    *   Docusaurus site with landing page and placeholder docs.
    *   FastAPI backend with `/api/rag/query` and `/api/health`.
    *   Ingest script to index at least 5 sample chapters.
    *   Site-wide `ChatWidget` component.
    *   Deployed staging environment.
*   **Acceptance Criteria**:
    *   Site is deployed and accessible.
    *   Chatbot answers queries based on indexed content.
    *   `/api/health` returns `{"status": "ok"}`.
    *   A short demo video (<90s) is recorded.

#### Phase 2 (Bonus)
*   **Features**:
    *   User signup/signin with `better-auth.com`.
    *   Personalization feature to rewrite content based on user profile.
    *   Urdu translation toggle.
    *   Demo of Claude-powered subagents.
*   **Acceptance Criteria**:
    *   Login/logout functionality works.
    *   Personalization modifies a chapter's content.
    *   Urdu translation works on a chapter.

## Complexity Tracking

(No violations to report)

## Next steps

Next, run `/sp.tasks` to break down the implementation of Phase 1 into concrete development tasks.