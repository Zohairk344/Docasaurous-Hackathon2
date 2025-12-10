from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import health, rag, translate, auth, personalize

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(translate.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(personalize.router, prefix="/api")
