from fastapi import APIRouter, HTTPException
from typing import Dict, List
from spotify import get_gpt_recommendations, get_track_ids  

router = APIRouter()

@router.post("/recommendations")
async def get_recommendations(prompt: str, spotify_token: str) -> Dict[str, List[str]]:
    try:
        recommendations = get_gpt_recommendations(prompt)
        track_ids = get_track_ids(recommendations, spotify_token)
        
        if not track_ids:
            raise HTTPException(status_code=404, detail="No tracks found")
            
        return {"track_ids": track_ids}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))