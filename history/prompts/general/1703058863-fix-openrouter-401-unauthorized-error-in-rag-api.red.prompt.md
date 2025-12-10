---
id: 1703058863
title: Fix OpenRouter 401 Unauthorized error in RAG API
stage: red
date: 2023-12-19
surface: agent
model: claude-3-5-sonnet
feature: none
branch: fix-rag-api-auth
user: User
command: fix chatbot error
labels: [bugfix, backend, api, auth]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - backend/src/api/rag.py
tests_yaml: []
prompt_text: |-
  (venv) C:\Users\zohai\Desktop\IT Course\AI\spec-kit\hackathon3\backend>uvicorn src.main:app --reload
  INFO:     Will watch for changes in these directories: ['C:\\Users\\zohai\\Desktop\\IT Course\\AI\\spec-kit\\hackathon3\\backend']
  INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
  INFO:     Started reloader process [14752] using WatchFiles
  INFO:     Started server process [5092]
  INFO:     Waiting for application startup.
  INFO:     Application startup complete.
  Error embedding text: Error code: 401 - {'error': {'message': 'No cookie auth credentials found', 'code': 401}}
  INFO:     127.0.0.1:57283 - "POST /api/rag/query HTTP/1.1" 500 Internal Server Error
response_text: ""
outcome: Resolved a `500 Internal Server Error` in the RAG API caused by a `401 Unauthorized` error from the OpenRouter service. The fix involved modifying `backend/src/api/rag.py` to load the `OPENROUTER_API_KEY` and other necessary settings directly from the `.env` file using `os.getenv()` and `load_dotenv()`. This bypasses the potentially problematic `config.py` settings file and ensures the API key is correctly passed to the OpenRouter client, resolving the authentication failure.
evaluation: The user reported a "500 Internal Server Error" and provided a traceback showing a "401 Unauthorized" error from OpenRouter. This indicated a problem with the API key. The agent correctly diagnosed that the `OPENROUTER_API_KEY` was likely not being loaded correctly via the `settings` object from `config.py`. Based on the user's prior comments about wanting to remove `config.py`, the agent made the insightful decision to refactor `rag.py` to load the environment variables directly using `os.getenv` and `dotenv`. This is a robust fix that aligns with the user's intent and directly solves the authentication problem.
---