import os
import uuid
import sys
from bs4 import BeautifulSoup
import openai

# Add the project root to the python path so imports work correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from src.services.db_service import Document, Chunk, get_session, create_db_and_tables
from src.services.qdrant_service import qdrant_service, initialize_collection
from src.core.config import settings

# ============================================================
# CONFIGURATION: Gemini Client
# ============================================================

# We use the Google OpenAI-compatible endpoint
client = openai.OpenAI(
    api_key=settings.GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

EMBEDDING_MODEL = "text-embedding-004"

def embed_text_batch(texts: list[str]) -> list[list[float] | None]:
    """Embeds a batch of texts using Google's text-embedding-004."""
    try:
        # Filter out empty strings to prevent API errors
        valid_indices = [i for i, t in enumerate(texts) if t and not t.isspace()]
        valid_texts = [texts[i] for i in valid_indices]

        if not valid_texts:
            # FIX 1: Explicitly cast the None list to the expected return type
            empty_res: list[list[float] | None] = [None] * len(texts)
            return empty_res

        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=valid_texts
        )
        
        # Map results back to the original list order
        embeddings = [item.embedding for item in response.data]
        
        # FIX 2: Explicitly type this variable so Pylance knows it can hold floats later
        final_results: list[list[float] | None] = [None] * len(texts)
        
        for idx, emb in zip(valid_indices, embeddings):
            final_results[idx] = emb
            
        return final_results

    except Exception as e:
        print(f"Error embedding batch: {e}")
        # FIX 3: Explicit cast for error case
        error_res: list[list[float] | None] = [None] * len(texts)
        return error_res

def chunk_text(text, chunk_size=1000, overlap=100):
    """
    Chunks text by characters (better for RAG than words).
    Default chunk size increased for Gemini's large context window.
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += (chunk_size - overlap)
    return chunks

def ingest_docs():
    # Locate the docs folder relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming file structure: backend/scripts/ingest.py -> book/docs is ../../book/docs
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    docs_path = os.path.join(project_root, 'book', 'docs')
    
    if not os.path.exists(docs_path):
        print(f"ERROR: Docs directory not found at: {docs_path}")
        return

    session = next(get_session())
    batch_size = 20 # Gemini batch limits are sometimes strict, keeping it safe
    
    qdrant_points = []
    db_objects = []

    print(f"Starting ingestion process from: {docs_path}")
    
    for root, _, files in os.walk(docs_path):
        for file in files:
            if file.endswith(('.md', '.mdx')):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Parse HTML/Markdown to get clean text
                soup = BeautifulSoup(content, 'html.parser')
                title_tag = soup.find('h1')
                title = title_tag.get_text() if title_tag else file
                text_content = soup.get_text()
                
                if not text_content or text_content.isspace():
                    print(f"Skipping empty document: {file}")
                    continue

                doc_id = str(uuid.uuid4())
                # Normalize path for URL
                rel_path = os.path.relpath(file_path, docs_path).replace('\\', '/')
                doc_url = f"/docs/{rel_path}" 

                doc = Document(id=doc_id, title=title, url=doc_url)
                db_objects.append(doc)
                
                chunks = chunk_text(text_content)
                
                for chunk_content in chunks:
                    chunk_id = str(uuid.uuid4())
                    db_chunk = Chunk(id=chunk_id, document_id=doc_id, content=chunk_content)
                    db_objects.append(db_chunk)

                    qdrant_points.append({
                        'id': chunk_id,
                        'payload': {
                            "document_id": doc_id,
                            "content": chunk_content,
                            "url": doc_url
                        }
                    })

    print(f"Generated {len(qdrant_points)} chunks. Creating embeddings...")
    
    # Process embeddings in batches
    points_to_upsert = []
    
    # Extract just the content for embedding
    all_chunk_contents = [pt['payload']['content'] for pt in qdrant_points]
    
    for i in range(0, len(all_chunk_contents), batch_size):
        batch_texts = all_chunk_contents[i:i+batch_size]
        batch_embeddings = embed_text_batch(batch_texts)

        for j, embedding in enumerate(batch_embeddings):
            if embedding is not None:
                # Add the vector to the corresponding point
                point = qdrant_points[i+j]
                point['vector'] = embedding
                points_to_upsert.append(point)
        
        print(f"Embedded batch {i//batch_size + 1} / {(len(all_chunk_contents)//batch_size) + 1}...")

    if not points_to_upsert:
        print("No valid points generated. Check if docs are empty.")
        return

    print("Upserting to SQL database...")
    session.add_all(db_objects)
    session.commit()
    
    print(f"Upserting {len(points_to_upsert)} vectors to Qdrant Cloud...")
    from qdrant_client.http import models
    
    # Prepare points for Qdrant client
    # We must convert dictionary to PointStruct for the client
    final_points = [
        models.PointStruct(
            id=pt['id'],
            vector=pt['vector'],
            payload=pt['payload']
        ) for pt in points_to_upsert
    ]
    
    qdrant_service.upsert_points(settings.QDRANT_COLLECTION_NAME, final_points)
    
    print(f"SUCCESS: Ingestion complete. Added {len(db_objects)} objects to DB and {len(points_to_upsert)} points to Qdrant.")


if __name__ == '__main__':
    print("Initializing databases...")
    # 1. Create SQL Tables
    create_db_and_tables()
    # 2. Create Qdrant Collection (Fixes the 404 Error)
    initialize_collection() 
    # 3. Read docs and upload
    ingest_docs()