from pydantic import BaseModel, Field
from typing import List, Optional

class PlaylistRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=200)
    playlist_length: int = Field(..., ge=1, le=25)

class PlaylistResponse(BaseModel):
    status: str
    playlist_id: str
    playlist_url: str
    track_count: int

class SearchResponse(BaseModel):
    track_ids: List[str]

class CreatePlaylistRequest(BaseModel):
    title: str
    description: Optional[str] = None
    track_ids: List[str]