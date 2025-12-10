import openai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..core.config import settings

# Configure OpenAI client for OpenRouter
client = openai.OpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url=settings.OPENROUTER_BASE_URL
)

class TranslateRequest(BaseModel):
    text: str
    target_language: str

router = APIRouter()

@router.post("/translate")
def translate_text(req: TranslateRequest):
    try:
        response = client.chat.completions.create(
            model=settings.OPENROUTER_GENERATION_MODEL, # Use OpenRouter Gemini model for translation
            messages=[
                {"role": "system", "content": f"You are a highly skilled translator. Translate the following English text into {req.target_language}."},
                {"role": "user", "content": req.text}
            ],
            temperature=0.3,
            max_tokens=1000,
        )
        translated_text = response.choices[0].message.content
        return {"translated_text": translated_text}
    except Exception as e:
        print(f"Error translating text: {e}")
        raise HTTPException(status_code=500, detail="Failed to translate text.")
