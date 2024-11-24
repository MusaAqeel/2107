# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.generate import router as generate_router
from api.playlist import router as playlist_router
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI(debug=True)

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

# Add routers
app.include_router(generate_router, prefix="/api/generate")
app.include_router(playlist_router, prefix="/api/playlist")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)