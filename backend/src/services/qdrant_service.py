from qdrant_client import QdrantClient
from qdrant_client.http import models
from ..core.config import settings

COLLECTION_NAME = settings.QDRANT_COLLECTION_NAME

class QdrantService:
    def __init__(self):
        self.client = QdrantClient(host=settings.QDRANT_HOST, api_key=settings.QDRANT_API_KEY)

    def create_collection(self, collection_name: str, vector_size: int):
        self.client.recreate_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
        )

    def upsert_points(self, collection_name: str, points: list):
        self.client.upsert(
            collection_name=collection_name,
            wait=True,
            points=points,
        )

    def search(self, collection_name: str, query_vector: list, limit: int = 5):
        # FIX IS HERE: The Qdrant client expects 'query', not 'query_vector'
        return self.client.query_points(
            collection_name=collection_name,
            query=query_vector,   # <--- Updated from query_vector to query
            limit=limit,
            with_payload=True 
        )

qdrant_service = QdrantService()

def initialize_collection():
    # Use VECTOR_SIZE from settings
    VECTOR_SIZE = settings.OPENAI_EMBEDDING_DIMENSION 
    try:
        qdrant_service.create_collection(COLLECTION_NAME, VECTOR_SIZE)
        print(f"Collection '{COLLECTION_NAME}' created successfully with vector size {VECTOR_SIZE}.")
    except Exception as e:
        print(f"Collection '{COLLECTION_NAME}' may already exist. Error: {e}")

if __name__ == '__main__':
    initialize_collection()