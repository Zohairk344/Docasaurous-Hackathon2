from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI Robotics Textbook API"
    
    # Gemini API Key (direct access)
    GEMINI_API_KEY: str = "" # User specified they are using this key

    # OpenRouter settings for Gemini models
    OPENROUTER_API_KEY: str = "" # Required if using OpenRouter
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_EMBEDDING_MODEL: str = "google/gemini-pro" # OpenRouter's name for Gemini embedding
    OPENROUTER_GENERATION_MODEL: str = "google/gemini-pro" # OpenRouter's name for Gemini generation
    OPENAI_EMBEDDING_DIMENSION: int = 768 # Gemini models typically produce 768-dim embeddings

    # Vector DB settings
    QDRANT_HOST: str = "c75f819d-b0fc-42f9-9b60-6d99b0242a43.us-east4-0.gcp.cloud.qdrant.io"
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION_NAME: str = "ai_robotics_textbook"

    # Database settings
    NEON_DATABASE_URL: str = ""

    # Cohere settings (if used, currently for agent in backend/src/agent)
    COHERE_API_KEY: str = ""

    # BetterAuth settings (Phase 2)
    BETTER_AUTH_CLIENT_ID: str = ""
    BETTER_AUTH_CLIENT_SECRET: str = ""

    # Frontend settings
    FRONTEND_CORS_ORIGINS: str = "http://localhost:3000" # Comma-separated list of origins


    class Config:
        env_file = ".env"
        extra = "ignore" # Temporarily ignore extra fields to get past validation errors, but better to define them.

settings = Settings()
