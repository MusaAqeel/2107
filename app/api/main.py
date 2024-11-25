# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from generate import router as generate_router
from playlist import router as playlist_router
from dotenv import load_dotenv
import os

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",    # Next.js development server
    "http://localhost:8000",    # FastAPI server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Add routers
app.include_router(generate_router, prefix="/api/generate")
app.include_router(playlist_router, prefix="/api/playlist")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)