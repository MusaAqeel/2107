import os
from openai import OpenAI
from dotenv import load_dotenv
import json
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

load_dotenv()

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
                   {
                    {song title} {artist}
                   }
               ]
               }

               Rules:
               - Return only the JSON object without any other text
               - Include full artist names (no abbreviations)
               - Include exact song titles as they would appear on Spotify
               - Do not include additional commentary or explanations
               - Do not include song descriptions or reasons for recommendations
               - Ensure consistent JSON formatting
           """},
           {
               "role": "user", 
               "content": f"Prompt: {prompt}"
           }
       ]
   )
   return clean_gpt_response(completion.choices[0].message.content)

def clean_gpt_response(response_string: str) -> dict:
   cleaned = response_string.replace('```json', '').replace('```', '')
   return json.loads(cleaned)

def get_track_ids(recommendations: dict, auth_token: str) -> list:
   track_ids = []
   url = "https://api.spotify.com/v1/search"
   headers = {
       "Authorization": f"Bearer {auth_token}"
   }

   for song in recommendations['recommendations']:
       query = f"{song['title']} {song['artist']}"
       params = {
           "q": query,
           "type": "track",
           "limit": 1
       }
       
       try:
           response = requests.get(url, headers=headers, params=params)
           if response.status_code == 200:
               data = response.json()
               if data['tracks']['items']:
                   track_ids.append(data['tracks']['items'][0]['id'])
               else:
                   print(f"No track found for {song['title']} by {song['artist']}")
       except Exception as e:
           print(f"Error searching for {song['title']} by {song['artist']}: {str(e)}")
           continue

   return track_ids

def main(prompt: str, auth_token: str) -> list:
   recommendations = get_gpt_recommendations(prompt)
   return get_track_ids(recommendations, auth_token)

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
   try:
       track_ids = main(request.prompt, request.auth_token)
       return {"track_ids": track_ids}
   except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
   # For local testing only
   import uvicorn
   uvicorn.run("chat:app", host="0.0.0.0", port=8000, reload=True)