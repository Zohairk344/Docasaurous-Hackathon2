import requests
import xml.etree.ElementTree as ET
import trafilatura
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
import google.generativeai as genai
import os
from dotenv import load_dotenv

# -------------------------------------
# CONFIG
# -------------------------------------
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Path to the locally generated Docusaurus sitemap
SITEMAP_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'book', 'build', 'sitemap.xml')
COLLECTION_NAME = "humanoid_ai_book"

GEMINI_EMBED_MODEL = "models/embedding-001"
VECTOR_DIMENSION = 768  # Gemini embedding-001 dimension

# Connect to Qdrant Cloud
qdrant = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# -------------------------------------
# Step 1 — Extract URLs from local sitemap file
# -------------------------------------
def get_all_urls(sitemap_file_path):
    if not os.path.exists(sitemap_file_path):
        print(f"ERROR: Sitemap file not found at {sitemap_file_path}")
        return []

    with open(sitemap_file_path, 'r', encoding='utf-8') as f:
        xml = f.read()
    
    root = ET.fromstring(xml)

    urls = []
    for child in root.findall("{http://www.sitemaps.org/schemas/sitemap/0.9}url"):
        loc_tag = child.find("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
        if loc_tag is not None:
            urls.append(loc_tag.text)

    print("\nFOUND URLS:")
    for u in urls:
        print(" -", u)

    return urls


# -------------------------------------
# Step 2 — Download page + extract text
# -------------------------------------
def extract_text_from_url(url):
    html = requests.get(url).text
    text = trafilatura.extract(html)

    if not text:
        print("[WARNING] No text extracted from:", url)

    return text


# -------------------------------------
# Step 3 — Chunk the text
# -------------------------------------
def chunk_text(text, max_chars=1200):
    chunks = []
    while len(text) > max_chars:
        split_pos = text[:max_chars].rfind(". ")
        if split_pos == -1:
            split_pos = max_chars
        chunks.append(text[:split_pos])
        text = text[split_pos:]
    chunks.append(text)
    return chunks


# -------------------------------------
# Step 4 — Create embedding
# -------------------------------------
def embed(text: str) -> list[float]:
    """Get embedding vector from Gemini."""
    response = genai.embed_content(
        model=GEMINI_EMBED_MODEL,
        content=text,
        task_type="retrieval_document"
    )
    return response['embedding']


# -------------------------------------
# Step 5 — Store in Qdrant
# -------------------------------------
def create_collection():
    print("\nCreating Qdrant collection...")
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
        size=VECTOR_DIMENSION,
        distance=Distance.COSINE
        )
    )

def save_chunk_to_qdrant(chunk, chunk_id, url):
    vector = embed(chunk)

    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=chunk_id,
                vector=vector,
                payload={
                    "url": url,
                    "text": chunk,
                    "chunk_id": chunk_id
                }
            )
        ]
    )


# -------------------------------------
# MAIN INGESTION PIPELINE
# -------------------------------------
def ingest_book():
    urls = get_all_urls(SITEMAP_FILE_PATH)

    create_collection()

    global_id = 1

    for url in urls:
        print("\nProcessing:", url)
        text = extract_text_from_url(url)

        if not text:
            continue

        chunks = chunk_text(text)

        for ch in chunks:
            save_chunk_to_qdrant(ch, global_id, url)
            print(f"Saved chunk {global_id}")
            global_id += 1

    print("\n✔️ Ingestion completed!")
    print("Total chunks stored:", global_id - 1)


if __name__ == "__main__":
    ingest_book()