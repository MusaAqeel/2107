from fastapi import APIRouter, HTTPException
from ..config import settings, supabase
import base64
import requests

router = APIRouter()

@router.get("/login")
async def login():
    auth_url = "https://accounts.spotify.com/authorize"
    params = {
        "client_id": settings.SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": "http://localhost:3000/callback",
        "scope": "playlist-modify-public playlist-modify-private user-read-private"
    }
    return {"url": f"{auth_url}?client_id={params['client_id']}&response_type={params['response_type']}&redirect_uri={params['redirect_uri']}&scope={params['scope']}"}

@router.post("/callback")
async def callback(code: str):
    auth_header = base64.b64encode(
        f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}".encode()
    ).decode()
    
    response = requests.post(
        "https://accounts.spotify.com/api/token",
        headers={"Authorization": f"Basic {auth_header}"},
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": "http://localhost:3000/callback"
        }
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Token exchange failed")
        
    return response.json()
__all__ = ['router']