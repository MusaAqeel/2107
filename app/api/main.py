from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    playlist_length: int = Field(gt=0, le=25, description="Number of songs (1-25)")

class TrackSearchResult(BaseModel):
    track_id: str
    found: bool
    original: Dict
    matched: Optional[Dict] = None

class PlaylistCreateRequest(BaseModel):
    track_ids: List[str]
    title: str
    description: Optional[str] = None

def get_gpt_recommendations(prompt: str, playlist_length: int) -> dict:
    logger.info(f"Generating recommendations for prompt: {prompt}, length: {playlist_length}")
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
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
        logger.info(f"GPT response: {content}")
        clean_content = content.replace('```json', '').replace('```', '').strip()
        recommendations = json.loads(clean_content)
        
        if not isinstance(recommendations, dict) or 'recommendations' not in recommendations:
            raise ValueError("Invalid response format from GPT")
        
        if len(recommendations['recommendations']) != playlist_length:
            raise ValueError(f"GPT returned {len(recommendations['recommendations'])} recommendations instead of {playlist_length}")
        
        return recommendations
    except json.JSONDecodeError:
        logger.error("Failed to parse GPT response as JSON")
        raise ValueError("Failed to parse GPT response as JSON")

def search_track(song: dict, auth_token: str, try_alternative: bool = False) -> Optional[dict]:
    """Search for a track on Spotify with fallback options."""
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    # First try: exact match with both title and artist
    if not try_alternative:
        query = f'track:"{song["title"]}" artist:"{song["artist"]}"'
        logger.info(f"Trying exact search for: {song['title']} by {song['artist']}")
    else:
        # Second try: more lenient search
        query = f'{song["title"]} {song["artist"]}'
        logger.info(f"Trying lenient search for: {song['title']} by {song['artist']}")
    
    params = {
        "q": query,
        "type": "track",
        "limit": 1,
        "market": "US"
    }
    
    try:
        logger.info(f"Searching Spotify with query: {query}")
        response = requests.get(
            "https://api.spotify.com/v1/search",
            headers=headers,
            params=params
        )
        response.raise_for_status()
        data = response.json()
        
        if data['tracks']['items']:
            found_track = data['tracks']['items'][0]
            logger.info(f"Found track: {found_track['name']} by {found_track['artists'][0]['name']} (ID: {found_track['id']})")
            return found_track
        else:
            logger.warning(f"No tracks found for query: {query}")
            return None
    except Exception as e:
        logger.error(f"Error searching Spotify: {str(e)}")
        return None

def get_track_ids(recommendations: dict, auth_token: str) -> List[TrackSearchResult]:
    """Get track IDs with detailed search results and fallback options."""
    search_results = []
    logger.info(f"Starting search for {len(recommendations['recommendations'])} tracks")
    
    for i, song in enumerate(recommendations['recommendations'], 1):
        logger.info(f"\nProcessing song {i}: {song['title']} by {song['artist']}")
        
        # Try exact match first
        track = search_track(song, auth_token, try_alternative=False)
        
        if not track:
            logger.info("Exact match failed, trying alternative search")
            # If exact match fails, try more lenient search
            track = search_track(song, auth_token, try_alternative=True)
        
        if track:
            logger.info(f"Final match found: {track['name']} by {track['artists'][0]['name']}")
        else:
            logger.warning(f"No match found for: {song['title']} by {song['artist']}")
        
        result = TrackSearchResult(
            track_id=track['id'] if track else "",
            found=bool(track),
            original=song,
            matched={
                'title': track['name'],
                'artist': track['artists'][0]['name']
            } if track else None
        )
        
        search_results.append(result)
    
    return search_results

@app.post("/api/generate")
async def get_recommendations(request: ChatRequest):
    try:
        logger.info("Starting recommendation generation")
        recommendations = get_gpt_recommendations(request.prompt, request.playlist_length)
        logger.info("Starting Spotify track search")
        search_results = get_track_ids(recommendations, request.auth_token)
        
        # Filter found tracks for playlist creation
        track_ids = [result.track_id for result in search_results if result.found]
        logger.info(f"Found {len(track_ids)} valid track IDs out of {len(search_results)} recommendations")
        
        return {
            "recommendations": recommendations,
            "track_ids": track_ids,
            "search_results": [result.dict() for result in search_results],
            "stats": {
                "total": len(search_results),
                "found": len(track_ids),
                "missing": len(search_results) - len(track_ids)
            }
        }
    except Exception as e:
        logger.error(f"Error in get_recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/playlist", response_model=str)
async def create_playlist(
    request: PlaylistCreateRequest,
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
            "name": request.title,
            "description": request.description or "",
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
        track_uris = [f"spotify:track:{track_id}" for track_id in request.track_ids]
        
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