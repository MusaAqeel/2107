from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from openai import OpenAI
import json
import requests
from typing import List

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str
    auth_token: str

def get_gpt_recommendations(prompt: str) -> dict:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": """
                You are a Spotify playlist curator. Your task is to analyze user prompts and generate song recommendations. Always return a JSON array containing exactly 5 song recommendations. Each song must include "title" and "artist" fields.

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
    return json.loads(completion.choices[0].message.content.replace('```json', '').replace('```', '').strip())

def get_track_ids(recommendations: dict, auth_token: str) -> List[str]:
    track_ids = []
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }

    for song in recommendations['recommendations']:
        query = f"track:{song['title']} artist:{song['artist']}"
        params = {
            "q": query,
            "type": "track",
            "limit": 1
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

@router.post("")
async def get_recommendations(request: ChatRequest):
    try:
        recommendations = get_gpt_recommendations(request.prompt)
        track_ids = get_track_ids(recommendations, request.auth_token)
        return track_ids
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
