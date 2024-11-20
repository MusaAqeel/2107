# config.py
from pydantic_settings import BaseSettings
from supabase import create_client
from functools import lru_cache

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    OPENAI_API_KEY: str
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str

    class Config:
        env_file = ".env"

settings = Settings()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)