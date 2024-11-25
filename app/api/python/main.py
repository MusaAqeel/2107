# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from generate.main import router as generate_router
from playlist.main import router as playlist_router
from dotenv import load_dotenv
import os

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    os.getenv("VERCEL_URL", ""),
    "https://*.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

app.include_router(generate_router, prefix="/api/python/generate")
app.include_router(playlist_router, prefix="/api/python/playlist")

# Handler for Vercel serverless function
def handler(request, context):
    return app(request, context)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)