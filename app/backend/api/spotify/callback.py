# callback.py
from fastapi import APIRouter, HTTPException
from ..config import settings, supabase
import base64
import requests
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/callback")
async def spotify_callback(code: str):
   try:
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
       
       token_data = response.json()
       
       # Get user profile
       profile_response = await requests.get(
           "https://api.spotify.com/v1/me",
           headers={"Authorization": f"Bearer {token_data['access_token']}"}
       )
       
       if not profile_response.ok:
           raise HTTPException(status_code=400, detail="Failed to get profile")
           
       profile_data = profile_response.json()
       
       # Calculate token expiry time
       expires_at = datetime.now() + timedelta(seconds=token_data['expires_in'])
       
       # Store in Supabase
       await supabase.table("user_connections").upsert({
           "provider": "spotify",
           "provider_id": profile_data["id"],
           "access_token": token_data["access_token"],
           "refresh_token": token_data["refresh_token"],
           "expires_at": expires_at.isoformat()
       }).execute()
           
       return {"status": "success"}
   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))