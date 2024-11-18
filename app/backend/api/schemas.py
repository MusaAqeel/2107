from pydantic import BaseModel
from typing import List, Optional

class Song(BaseModel):
    title: str
    artist: str

class PlaylistRequest(BaseModel):
    name: str
    description: str
    tracks: List[str]

class PromptRequest(BaseModel):
    prompt: str

class SpotifyTokens(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str