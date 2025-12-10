from fastapi.testclient import TestClient
from backend.src.main import app

client = TestClient(app)

def test_personalize_content():
    response = client.post(
        "/api/personalize",
        json={"content": "This is the original content."},
    )
    assert response.status_code == 200
    data = response.json()
    assert "personalized_content" in data
    assert "[Personalized for a default user]" in data["personalized_content"]

def test_personalize_content_with_profile():
    response = client.post(
        "/api/personalize",
        json={
            "content": "This is the original content.",
            "profile": {"background": "expert"}
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "[Personalized for {'background': 'expert'}]" in data["personalized_content"]
