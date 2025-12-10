# AI Tutor Agent

This directory contains a self-contained AI agent built using the `agents` library, powered by Cohere and Qdrant. It is designed to act as an AI tutor for the textbook.

**NOTE:** The dependencies for this agent (specifically `openai-agent` and its requirement for Pydantic v1) conflict with the main FastAPI application's dependencies (Pydantic v2). This agent must be run in a separate Python virtual environment.

## Setup & Running

1.  **Create a separate virtual environment:**
    ```bash
    python -m venv agent_env
    source agent_env/bin/activate 
    ```

2.  **Install dependencies:**
    Create a `requirements-agent.txt` with the following content and run `pip install -r requirements-agent.txt`:
    ```
    agents
    python-dotenv
    cohere
    qdrant-client
    openai<0.28.0
    pydantic<2.0.0
    ```

3.  **Set Environment Variables:**
    Create a `.env` file in the root directory with your API keys:
    ```
    COHERE_API_KEY=your_cohere_key
    QDRANT_URL=your_qdrant_url
    QDRANT_API_KEY=your_qdrant_api_key
    ```
    
4.  **Run the Demo:**
    ```bash
    python -m backend.src.agent.demo
    ```

## Architecture

-   **`agent.py`**: Defines the main agent, its instructions, and the `retrieve` tool which it uses to get information.
-   **`retrieve.py`**: Contains the logic for querying the Qdrant vector database using a Cohere embedding.
-   **`main.py`** (`ingest_book`): This is a standalone script to ingest website content into the Qdrant collection.
-   **`demo.py`**: A simple script to demonstrate asking the agent a question.
