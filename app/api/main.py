from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Validate required environment variables
required_env_vars = ["OPENAI_API_KEY", "NEXT_PUBLIC_APP_URL"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = FastAPI()
security = HTTPBearer()

# CORS Configuration
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

# Models
class ChatRequest(BaseModel):
    prompt: str
    auth_token: str
    playlist_length: int = 5  # Default to 5 if not provided

# Generate Route Functions
def get_gpt_recommendations(prompt: str, playlist_length: int) -> dict:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Modify the system prompt to include the dynamic playlist length
    system_prompt = f"""
    You are a Spotify playlist curator. Your task is to analyze user prompts 
    and generate song recommendations. Always return a JSON array containing 
    exactly {playlist_length} song recommendations. Each song must include 
    "title" and "artist" fields.

    Example format:
    {{
        "recommendations": [
            {{"title": "Song Name", "artist": "Artist Name"}},
            {{"title": "Another Song", "artist": "Another Artist"}}
        ]
    }}
    """

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    )
    
    try:
        content = completion.choices[0].message.content
        clean_content = content.replace('```json', '').replace('```', '').strip()
        recommendations = json.loads(clean_content)
        
        if not isinstance(recommendations, dict) or 'recommendations' not in recommendations:
            raise ValueError("Invalid response format from GPT")
        
        # Validate that we got the correct number of recommendations
        if len(recommendations['recommendations']) != playlist_length:
            raise ValueError(f"GPT returned {len(recommendations['recommendations'])} recommendations instead of {playlist_length}")
        
        return recommendations
    except json.JSONDecodeError:
        raise ValueError("Failed to parse GPT response as JSON")

def get_track_ids(recommendations: dict, auth_token: str) -> List[str]:
    track_ids = []
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

    for song in recommendations['recommendations']:
        query = f"\"{song['title']}\" artist:\"{song['artist']}\""
        params = {
            "q": query,
            "type": "track",
            "limit": 1,
            "market": "US"
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            if data['tracks']['items']:
                track_ids.append(data['tracks']['items'][0]['id'])
        except:
            continue

    return track_ids

# Routes
@app.post("/api/generate")
async def get_recommendations(request: ChatRequest):
    try:
        recommendations = get_gpt_recommendations(request.prompt, request.playlist_length)
        track_ids = get_track_ids(recommendations, request.auth_token)
        return {"recommendations": recommendations, "track_ids": track_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/playlist", response_model=str)
async def create_playlist(
    track_ids: List[str] = Body(..., description="List of track IDs to add to playlist"),
    title: str = Query(..., description="The title of your playlist"),
    description: Optional[str] = Query(None, description="Description of your playlist"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    try:
        token = credentials.credentials
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Get user profile
        profile_url = "https://api.spotify.com/v1/me"
        profile_response = requests.get(profile_url, headers=headers)
        
        if profile_response.status_code != 200:
            raise HTTPException(
                status_code=profile_response.status_code,
                detail=f"Failed to get user profile: {profile_response.text}"
            )
            
        user_id = profile_response.json()['id']
        
        # Create playlist
        playlist_data = {
            "name": title,
            "description": description or "",
            "public": True
        }
        
        playlist_response = requests.post(
            f"https://api.spotify.com/v1/users/{user_id}/playlists",
            headers=headers,
            json=playlist_data
        )
        
        if playlist_response.status_code != 201:
            raise HTTPException(
                status_code=playlist_response.status_code,
                detail=f"Failed to create playlist: {playlist_response.text}"
            )
            
        playlist_id = playlist_response.json()['id']
        
        # Add tracks
        track_uris = [f"spotify:track:{track_id}" for track_id in track_ids]
        
        add_tracks_response = requests.post(
            f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks",
            headers=headers,
            json={"uris": track_uris}
        )
        
        if add_tracks_response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=add_tracks_response.status_code,
                detail=f"Failed to add tracks: {add_tracks_response.text}"
            )
            
        return f"https://open.spotify.com/playlist/{playlist_id}"
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)