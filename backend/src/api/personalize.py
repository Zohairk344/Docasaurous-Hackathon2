import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.config import settings

# Configure OpenAI client for OpenRouter
client = openai.OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url=settings.OPENROUTER_BASE_URL
)

class PersonalizeRequest(BaseModel):
    content: str
    profile: dict | None = None

router = APIRouter()

@router.post("/personalize")
def personalize_content(req: PersonalizeRequest):
    try:
        profile_desc = req.profile or {"level": "beginner"}
        
        response = client.chat.completions.create(
            model=settings.OPENROUTER_GENERATION_MODEL, # Use OpenRouter Gemini model for personalization
            messages=[
                {"role": "system", "content": f"You are a helpful assistant. Rewrite the following text to be suitable for a user with the following profile: {profile_desc}. Keep the core meaning the same but adjust the language and complexity."},
                {"role": "user", "content": req.content}
            ],
            temperature=0.7, # Higher temperature for more creative rewriting
            max_tokens=2000,
        )
        personalized_content = response.choices[0].message.content
        return {"personalized_content": personalized_content}
    except Exception as e:
        print(f"Error personalizing content: {e}")
        raise HTTPException(status_code=500, detail="Failed to personalize content.")
