import os
import openai
from typing import List, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from ..services.qdrant_service import qdrant_service, COLLECTION_NAME

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("CRITICAL: GEMINI_API_KEY is missing from .env file")

client = openai.AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

GENERATION_MODEL = "gemini-2.5-flash" 
EMBEDDING_MODEL = "text-embedding-004"

class RAGQuery(BaseModel):
    query: str
    context: str | None = None

class ContentRequest(BaseModel):
    text: str
    target_language: str = "ur"

router = APIRouter()

async def embed_text(text: str) -> list[float]:
    try:
        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error embedding text: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

async def call_gemini_safe(system_prompt: str, user_content: str) -> str:
    models_to_try = [GENERATION_MODEL, "gemini-2.0-flash", "gemini-flash-latest"]
    last_error = None
    for model in models_to_try:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.3,
                max_tokens=10000,
            )
            return response.choices[0].message.content or "No response generated."
        except openai.APIError as e:
            if "404" in str(e) or "not found" in str(e).lower():
                print(f"Model {model} failed. Trying next...")
                last_error = e
                continue
            else:
                raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    raise HTTPException(status_code=500, detail=f"All models failed. Last error: {str(last_error)}")


@router.post("/rag/query")
async def rag_query(query: RAGQuery):
    text_to_embed = query.context if query.context else query.query
    print(f"\n--- RAG QUERY DEBUG ---")
    print(f"Query: {text_to_embed}")

    try:
        # 1. Generate Embedding
        embedding_vector = await embed_text(text_to_embed)

        # 2. Search Qdrant
        raw_results = qdrant_service.search(
            collection_name=COLLECTION_NAME,
            query_vector=embedding_vector, 
            limit=10 
        )
        
        # Handle Response Types Safely
        search_results: List[Any] = []
        if hasattr(raw_results, 'points'):
            search_results = getattr(raw_results, 'points')
        elif isinstance(raw_results, list):
            search_results = raw_results
        else:
            search_results = []
            
        print(f"Qdrant returned {len(search_results)} results")

        # 3. Build Context (SAFE LOOP)
        context_chunks = []
        sources = []

        for i, result in enumerate(search_results):
            try:
                # Use robust retrieval for payload
                payload = getattr(result, "payload", None)
                if not payload:
                    continue

                # Try ALL common field names
                text = (
                    payload.get("content") or 
                    payload.get("text") or 
                    payload.get("page_content") or 
                    payload.get("chunk_text") or
                    payload.get("document") or
                    payload.get("body")
                )

                if text and isinstance(text, str):
                    context_chunks.append(text)
                    sources.append({
                        "document_id": payload.get("document_id") or "Unknown Doc",
                        "url": payload.get("url") or "#",
                        "score": getattr(result, "score", 0.0)
                    })
            except Exception as loop_error:
                print(f"⚠️ SKIPPING BAD RESULT {i}: {loop_error}")
                continue

        context_for_llm = "\n---\n".join(context_chunks)

        if not context_for_llm.strip():
            print("❌ No context found. Returning fallback.")
            return {
                "answer": "I could not find any relevant documents in the database to answer your question.",
                "sources": []
            }

        # 4. Generate Answer
        system_prompt = (
            "You are an expert AI tutor for a robotics textbook. "
            "Answer the QUESTION based only on the provided CONTEXT. "
            "If the answer is not in the context, say 'I cannot find the answer in the provided documents.' "
            "Be concise and cite sources when possible."
        )
        user_prompt = f"CONTEXT:\n---\n{context_for_llm}\n---\n\nQUESTION: {query.query}"
        
        answer = await call_gemini_safe(system_prompt, user_prompt)
        print("✅ Answer generated successfully.")

        return {
            "answer": answer,
            "sources": sources
        }

    except Exception as e:
        print(f"Unexpected RAG error: {e}")
        # Return a soft error to the user instead of a 500 crash
        return {
            "answer": "I encountered an internal error while processing the documents. Please try asking in a slightly different way.",
            "sources": []
        }

@router.post("/rag/personalize")
async def personalize_content(request: ContentRequest):
    content = await call_gemini_safe("You are an expert tutor. Rewrite for a beginner.", request.text)
    return {"content": content}

@router.post("/rag/translate")
async def translate_content(request: ContentRequest):
    content = await call_gemini_safe("Translate this technical content to Urdu.", request.text)
    return {"content": content}