# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .spotify import auth, callback, playlist
from .config import settings  # Use relative import

app = FastAPI(title="Mixify API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/spotify", tags=["spotify"])
app.include_router(callback.router, prefix="/api/spotify", tags=["spotify"])
app.include_router(playlist.router, prefix="/api/spotify", tags=["spotify"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)