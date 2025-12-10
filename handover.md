# Phase 1 Handover: AI Robotics Textbook with RAG Chatbot

## Deployed URLs

*   **Staging Frontend**: [To be deployed on Vercel/Netlify]
*   **Staging Backend**: [To be deployed on Render/Heroku]

## How to Run Locally

### 1. Backend

**Prerequisites**:
*   Python 3.11
*   An environment with the required packages installed.

**Setup**:
1.  Navigate to the `backend` directory.
2.  Create a virtual environment: `python -m venv venv`
3.  Activate it: `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows)
4.  Install dependencies: `pip install -r requirements.txt`
5.  Create a `.env` file in the `backend` directory with the following (using dummy keys for local testing if needed):
    ```
    GOOGLE_API_KEY=your_google_api_key
    QDRANT_API_KEY=your_qdrant_api_key
    QDRANT_HOST=your_qdrant_host
    NEON_DATABASE_URL=your_neon_db_url
    ```
    (Note: The current code uses in-memory/local file storage for Qdrant and SQLite, so these are not strictly required for basic startup but will be for full functionality).

**Running the services**:
1.  **Initialize Databases**: Run `python -m src.services.db_service` to create the SQLite DB.
2.  **Ingest Content**: Run `python -m scripts.ingest` to populate the databases.
3.  **Start Server**: Run `uvicorn src.main:app --reload`. The API will be available at `http://localhost:8000`.

### 2. Frontend

**Prerequisites**:
*   Node.js and npm (or yarn).

**Setup**:
1.  Navigate to the `book` directory.
2.  Install dependencies: `npm install`.
3.  Start the development server: `npm start`. The website will be available at `http://localhost:3000`.

## Sample Queries

You can use the chat widget on the frontend or send POST requests directly to `http://localhost:8000/api/rag/query`.

*   "What is physical AI?"
*   "Explain ROS2"
*   Select a piece of text and ask a question about it.

## Known Limitations

*   The RAG pipeline currently uses placeholder functions for embeddings and answer generation. Real API keys and wiring are needed.
*   The UI is basic and can be improved.
*   Error handling is minimal.
*   The `ingest.py` script's MDX parsing is basic.

## Next Steps for Phase 2

*   Implement user authentication with `better-auth.com`.
*   Build the personalization API and frontend components.
*   Implement the full translation feature.
*   Develop and document the Claude sub-agents.
*   Add comprehensive unit and integration tests.

---

**Phase 1 is complete. Please review and provide confirmation to proceed to Phase 2.**
