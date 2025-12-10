# Runbook: AI Robotics Textbook & Chatbot (OpenAI Agent)

This runbook provides detailed instructions for setting up, running, and deploying the AI Robotics Textbook project, which uses a `chainlit` agent powered by the OpenAI SDK.

## 1. Project Overview

-   **Frontend**: Docusaurus (`/book`) - A static website containing the textbook content.
-   **Backend**: Chainlit Agent (`/backend/src/agent`) - A chatbot built with `chainlit` and the `agents` library, using the OpenAI SDK for embeddings and language generation, and Qdrant for the vector store.

**IMPORTANT**: The Python environment for this project requires specific older versions of libraries like `pydantic` and `openai` to be compatible with the `agents` library. All necessary versions are pinned in `backend/requirements.txt`.

## 2. Local Development Setup

### Step 1: Install Frontend Dependencies

1.  Navigate to the `/book` directory.
2.  Run `npm install` to install all necessary Node.js packages.

### Step 2: Setup Backend Python Environment

1.  Navigate to the **project root directory**.
2.  **Create a virtual environment**: `python -m venv venv`
3.  **Activate the environment**:
    -   Windows: `.\venv\Scripts\activate`
    -   macOS/Linux: `source venv/bin/activate`
4.  **Install Python dependencies**: `pip install -r backend/requirements.txt`

### Step 3: Configure Environment Variables

1.  Create a file named `.env` in the **project root directory**.
2.  Add your secret keys to this file:
    ```
    OPENAI_API_KEY="your_sk-..."
    QDRANT_URL="your_qdrant_cloud_url"
    QDRANT_API_KEY="your_qdrant_api_key"
    ```

## 3. Data Ingestion

Before running the chatbot, you must populate the Qdrant vector database with the textbook content.

1.  Ensure your virtual environment is activated.
2.  Run the ingestion script from the **project root directory**:
    ```bash
    python -m backend.src.agent.main
    ```
    This script will scrape the live Docusaurus site, create embeddings using OpenAI, and store them in Qdrant.

## 4. Running the Application

You need two separate terminals to run the frontend and backend.

### Terminal 1: Start the Frontend (Docusaurus)

1.  Navigate to the `/book` directory.
2.  Run `npm start`.
3.  The textbook website will be live at **http://localhost:3000**.

### Terminal 2: Start the Backend (Chainlit Chatbot)

1.  Navigate to the **project root directory**.
2.  Activate your virtual environment (`.\venv\Scripts\activate` or `source venv/bin/activate`).
3.  Run the `chainlit` application:
    ```bash
    chainlit run backend/src/agent/chatbot.py -w
    ```
4.  The AI chatbot will be live at **http://localhost:8000**.

After completing these steps, you can browse the textbook and interact with the AI tutor in two separate browser tabs.
