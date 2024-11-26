from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import requests
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

client = OpenAI()
load_dotenv()
app = FastAPI()
security = HTTPBearer()
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "https://*.vercel.app",
]
# Initialize Supabase
supabase: Client = create_client(
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

# CORS configuration
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

class PlaylistRequest(BaseModel):
    track_ids: List[str]
    title: str
    description: Optional[str] = None

def get_gpt_recommendations(prompt: str) -> dict:
    """Generate song recommendations using GPT-4"""
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": """
                    You are a Spotify playlist curator. Your task is to analyze user prompts 
                    and generate song recommendations. Always return a JSON array containing 
                    exactly 5 song recommendations. Each song must include "title" and 
                    "artist" fields.
                    
                    Example format:
                    {
                        "recommendations": [
                            {"title": "Song Name", "artist": "Artist Name"},
                            {"title": "Another Song", "artist": "Another Artist"}
                        ]
                    }
                """},
                {"role": "user", "content": prompt}
            ]
        )
        
        content = completion.choices[0].message.content
        clean_content = content.replace('```json', '').replace('```', '').strip()
        recommendations = json.loads(clean_content)
        
        if not isinstance(recommendations, dict) or 'recommendations' not in recommendations:
            raise ValueError("Invalid response format from GPT")
        
        print(f"GPT Recommendations: {recommendations}")
        return recommendations
        
    except Exception as e:
        print(f"Error in get_gpt_recommendations: {str(e)}")
        raise ValueError(f"Failed to generate recommendations: {str(e)}")

def search_spotify_tracks(recommendations: dict, auth_token: str) -> List[str]:
    """Search Spotify for track IDs based on recommendations"""
    track_ids = []
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

    print(f"Starting Spotify search with token: {auth_token[:10]}...")

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
            
            print(f"Search response for {query}: {data['tracks']['total']} results")
            
            if data['tracks']['items']:
                track_ids.append(data['tracks']['items'][0]['id'])
        except Exception as e:
            print(f"Error searching for track {query}: {str(e)}")
            continue

    return track_ids

# API Routes
@app.post("/api/generate")
async def generate_recommendations(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Generate and search for track recommendations"""
    try:
        spotify_token = credentials.credentials
        print(f"Processing request with prompt: {request.prompt}")
        
        # Get GPT recommendations
        recommendations = get_gpt_recommendations(request.prompt)
        print(f"Got recommendations: {recommendations}")
        
        # Search Spotify for tracks
        track_ids = search_spotify_tracks(recommendations, spotify_token)
        print(f"Found track IDs: {track_ids}")
        
        if not track_ids:
            raise HTTPException(
                status_code=404,
                detail="No matching tracks found on Spotify"
            )
        
        return track_ids
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error in generate_recommendations endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/playlist", response_model=str)
async def create_playlist(
    request: PlaylistRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Create a Spotify playlist with the given tracks"""
    try:
        spotify_token = credentials.credentials
        headers = {
            "Authorization": f"Bearer {spotify_token}",
            "Content-Type": "application/json"
        }
        
        # Get user profile
        profile_url = "https://api.spotify.com/v1/me"
        profile_response = requests.get(profile_url, headers=headers)
        profile_response.raise_for_status()
        spotify_user_id = profile_response.json()['id']
        
        # Create playlist
        playlist_data = {
            "name": request.title,
            "description": request.description or "",
            "public": True
        }
        
        playlist_url = f"https://api.spotify.com/v1/users/{spotify_user_id}/playlists"
        playlist_response = requests.post(
            playlist_url,
            headers=headers,
            json=playlist_data
        )
        playlist_response.raise_for_status()
        playlist_id = playlist_response.json()['id']
        
        # Add tracks
        track_uris = [f"spotify:track:{track_id}" for track_id in request.track_ids]
        add_tracks_url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
        add_tracks_response = requests.post(
            add_tracks_url,
            headers=headers,
            json={"uris": track_uris}
        )
        add_tracks_response.raise_for_status()
        
        return f"https://open.spotify.com/playlist/{playlist_id}"
        
    except requests.exceptions.RequestException as e:
        print(f"Spotify API error: {str(e)}")
        raise HTTPException(
            status_code=e.response.status_code if hasattr(e, 'response') else 500,
            detail=f"Spotify API error: {str(e)}"
        )
    except Exception as e:
        print(f"Error in create_playlist endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)