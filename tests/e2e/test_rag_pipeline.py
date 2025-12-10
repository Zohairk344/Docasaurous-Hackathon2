import requests
import os
import time

# This assumes the backend is running at this address
BASE_URL = "http://localhost:8000/api"

# This assumes there is an ingest script that can be run
# from backend.scripts.ingest import ingest_docs

def wait_for_server():
    for _ in range(30):
        try:
            response = requests.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                print("Server is ready.")
                return True
        except requests.ConnectionError:
            time.sleep(1)
    print("Server is not ready after 30 seconds.")
    return False

def test_rag_pipeline():
    # 1. Run the ingestion script
    # In a real CI, you might run this as a separate step
    # print("Starting ingestion...")
    # ingest_docs() 
    # For now, we assume ingestion has been run manually or in a previous step
    
    # 2. Wait for the server to be healthy
    assert wait_for_server(), "Backend server is not running."

    # 3. Ask a question that should have a clear answer from the ingested docs
    query = "What is physical AI?"
    print(f"Testing with query: '{query}'")

    response = requests.post(f"{BASE_URL}/rag/query", json={"query": query})

    assert response.status_code == 200
    
    data = response.json() 
    
    assert "answer" in data
    assert "sources" in data
    
    print(f"Received answer: {data['answer']}")
    assert data['answer'] is not None
    
    print(f"Received {len(data['sources'])} sources.")
    assert len(data['sources']) > 0

    print("E2E RAG pipeline test passed.")

if __name__ == "__main__":
    # Create a dummy doc for testing if it doesn't exist
    if not os.path.exists("book/docs/test_doc.md"):
        with open("book/docs/test_doc.md", "w") as f:
            f.write("# Test Document\n\nThis is a test document about physical AI.")
            
    # In a real scenario, you'd start the backend server here as a subprocess
    # For now, please run the backend server in a separate terminal
    # e.g., uvicorn backend.src.main:app --reload

    # You would also run the ingest script here
    # ingest_docs()

    print("Please ensure the backend server is running and ingestion is complete before running this test.")
    
    # This is a simplified run. A real test suite would use pytest.
    test_rag_pipeline()
