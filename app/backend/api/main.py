# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.spotify import playlist  # Make sure this path is correct
from api.ai_chat import chat     # Add this if you're using chat endpoints

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(playlist.router, prefix="/api/spotify", tags=["spotify"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# Test endpoint to verify server is running
@app.get("/")
async def read_root():
    return {"status": "API is running"}