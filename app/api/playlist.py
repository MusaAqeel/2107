from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import requests

router = APIRouter()
security = HTTPBearer()

@router.post("")
async def create_playlist(
    track_ids: List[str] = Body(..., description="List of track IDs to add to playlist"),
    title: str = Query(..., description="The title of your playlist"),
    description: Optional[str] = Query(None, description="Description of your playlist"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
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
            
        return {
            "playlist_id": playlist_id,
            "playlist_url": f"https://open.spotify.com/playlist/{playlist_id}"
        }
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))