from agents import Agent, Runner, OpenAIChatCompletionsModel
from openai import AsyncOpenAI
from agents import set_tracing_disabled, function_tool
from agents import enable_verbose_stdout_logging

import os
from dotenv import load_dotenv
import google.generativeai as genai
from qdrant_client import QdrantClient

# ============================================================
# SETUP
# ============================================================

enable_verbose_stdout_logging()
load_dotenv()
set_tracing_disabled(disabled=True)

# ----------------------------
# GEMINI CONFIG
# ----------------------------

gemini_api_key = os.getenv("GEMINI_API_KEY")

# Configure google.generativeai for embeddings
genai.configure(api_key=gemini_api_key)
GEMINI_EMBEDDING_MODEL = "models/embedding-001" # A common Gemini embedding model

# This transforms the OpenAI client into a Gemini client  
# using Google’s OpenAI-compatible API.
provider = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Use Gemini as the LLM for the agent
model = OpenAIChatCompletionsModel(
    model="gemini-pro", # Using gemini-pro for generation
    openai_client=provider
)

# ----------------------------
# QDRANT CONFIG
# ----------------------------

qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)


# ============================================================
# EMBEDDINGS (Gemini)
# ============================================================

def get_embedding(text: str) -> list[float]:
    """
    Get embedding vector from Gemini.
    """
    response = genai.embed_content(
        model=GEMINI_EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query"
    )
    return response['embedding']


# ============================================================
# VECTOR RETRIEVAL TOOL
# ============================================================

@function_tool
def retrieve(query: str):
    embedding = get_embedding(query)

    results = qdrant.query_points(
        collection_name="humanoid_ai_book",
        query_vector=embedding,
        limit=5,
        with_payload=True
    )

    safe_texts = []

    for point in results.points:
        payload = point.payload or {}
        text = payload.get("text")
        if text:
            safe_texts.append(text)
        else:
            safe_texts.append("[NO TEXT FOUND IN PAYLOAD]")

    return safe_texts




# ============================================================
# AGENT DEFINITION
# ============================================================

agent = Agent(
    name="Assistant",
    instructions="""
You are an AI tutor for the Physical AI & Humanoid Robotics textbook.

RULES:
1. You MUST call the tool `retrieve` FIRST with the user query.
2. You MUST use ONLY the retrieved text to answer.
3. If the retrieved content does not contain the answer, say:
   "I don't know."
4. Cite the source URL when possible.
""",
    model=model,      # <-- This is now Gemini (OpenAI-compatible)
    tools=[retrieve]
)


# ============================================================
# RUN A TEST QUERY
# ============================================================

result = Runner.run_sync(
    agent,
    input="what is physical ai?"
)

print("FINAL OUTPUT:\n", result.final_output)
