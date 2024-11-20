from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from typing import List
import traceback

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

@router.get("/search")
async def search_tracks(
    query: str = Query(..., description="Search query"),
    limit: int = Query(..., description="Number of tracks to return"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        logger.info(f"Received search request - Query: {query}, Limit: {limit}")
        
        token = credentials.credentials
        logger.info("Token received and extracted")
        
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
        
        logger.info(f"Making request to Spotify API: {url}")
        response = requests.get(url, headers=headers, params=params)
        
        # Log the response status and content for debugging
        logger.info(f"Spotify API Response Status: {response.status_code}")
        if response.status_code != 200:
            logger.error(f"Spotify API Error Response: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Spotify API error: {response.text}"
            )
            
        data = response.json()
        track_ids = []
        
        if data.get('tracks', {}).get('items'):
            track_ids = [track['id'] for track in data['tracks']['items']]
            logger.info(f"Found {len(track_ids)} tracks")
            return track_ids
        else:
            logger.info("No tracks found")
            return []

    except Exception as e:
        logger.error(f"Error in search_tracks: {str(e)}")
        logger.error(traceback.format_exc())  # Log the full traceback
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )