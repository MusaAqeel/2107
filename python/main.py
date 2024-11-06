from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from spotify_route import router 

app = FastAPI()
app.include_router(router, prefix="/api/spotify")

@app.get("/", include_in_schema=False)
async def root():
    """Redirect root to docs"""
    return RedirectResponse(url='/docs')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)