# playlist.py
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import settings, supabase
import requests

router = APIRouter()
security = HTTPBearer()

@router.get("/search")
async def search_tracks(
    query: str = Query(..., description="Search query"),
    limit: int = Query(..., description="Number of tracks to return"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials
        url = "https://api.spotify.com/v1/search"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        params = {
            "q": query,
            "type": "track", 
            "limit": limit
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Spotify API error: {response.text}"
            )
            
        data = response.json()
        track_ids = []
        
        if data['tracks']['items']:
            track_ids = [track['id'] for track in data['tracks']['items']]
            return track_ids  # Just return array of IDs
        else:
            return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_playlist(
   title: str = Query(..., description="The title of your playlist"),
   description: str | None = Query(None, description="Description of your playlist"),
   request: list[str] = Body(..., description="List of track IDs to add to playlist"),
   credentials: HTTPAuthorizationCredentials = Depends(security)
):
   try:
       token = credentials.credentials
       
       # Get user profile
       profile_response = requests.get(
           "https://api.spotify.com/v1/me",
           headers={"Authorization": f"Bearer {token}"}
       )
       
       if profile_response.status_code != 200:
           raise HTTPException(
               status_code=400, 
               detail=f"Failed to get user profile: {profile_response.text}"
           )
           
       user_id = profile_response.json()['id']
       
       # Create playlist
       playlist_data = {
           "name": title,
           "description": description,
           "public": True
       }
       
       playlist_response = requests.post(
           f"https://api.spotify.com/v1/users/{user_id}/playlists",
           headers={
               "Authorization": f"Bearer {token}",
               "Content-Type": "application/json"
           },
           json=playlist_data
       )
       
       if playlist_response.status_code != 201:
           raise HTTPException(
               status_code=400, 
               detail=f"Failed to create playlist: {playlist_response.text}"
           )
           
       playlist_id = playlist_response.json()['id']
       
       # Add tracks
       track_uris = [f"spotify:track:{track_id.strip()}" for track_id in request]
       
       add_tracks_response = requests.post(
           f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks",
           headers={
               "Authorization": f"Bearer {token}",
               "Content-Type": "application/json"
           },
           json={"uris": track_uris}
       )
       
       if add_tracks_response.status_code not in [200, 201]:
           raise HTTPException(
               status_code=400,
               detail=f"Failed to add tracks: {add_tracks_response.text}"
           )
           
       return {
           "status": "success",
           "playlist_id": playlist_id,
           "playlist_url": f"https://open.spotify.com/playlist/{playlist_id}",
           "track_count": len(request)
       }
       
   except Exception as e:
       print(f"Error in create_playlist: {str(e)}")
       raise HTTPException(status_code=500, detail=str(e))