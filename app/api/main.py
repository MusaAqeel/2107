# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from playlist import router as playlist_router
from generate import router as generate_router

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only Python routers
app.include_router(playlist_router, prefix="/api/spotify/create-playlist", tags=["playlist"])
app.include_router(generate_router, prefix="/api/ai-chat/generate", tags=["ai"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "mixify-api"}