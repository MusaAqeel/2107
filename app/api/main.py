# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .generate import router as generate_router
from .playlist import router as playlist_router
import os

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://*.vercel.app",
]

if os.getenv("NEXT_PUBLIC_APP_URL"):
    origins.append(os.getenv("NEXT_PUBLIC_APP_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router, prefix="/generate", tags=["generate"])
app.include_router(playlist_router, prefix="/playlist", tags=["playlist"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)