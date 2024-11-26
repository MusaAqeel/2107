import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not supabase_url or not supabase_key:
    logger.error("Supabase URL or key is missing")
    raise ValueError("Supabase URL or key is missing")

supabase: Client = create_client(supabase_url, supabase_key)

def get_authenticated_user():
    """Get the authenticated user from Supabase"""
    try:
        # Retrieve the current session
        session = supabase.auth.get_session()
        if not session:
            logger.error("No session found")
            raise ValueError("No session found")
        
        access_token = session.get('access_token')
        if not access_token:
            logger.error("No access token found in session")
            raise ValueError("No access token found in session")
        
        logger.info(f"Access token: {access_token}")

        # Retrieve the user with the access token
        user_response = supabase.auth.get_user(access_token)
        user = user_response.user
        if not user:
            logger.error("No authenticated user found")
            raise ValueError("No authenticated user found")
        logger.info(f"Authenticated user: {user}")
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise

def get_spotify_token(user_id: str) -> str:
    """Get Spotify access token from Supabase"""
    try:
        spotify_connection = (supabase
            .table('user_connections')
            .select('*')
            .eq('user_id', user_id)
            .eq('provider', 'spotify')
            .single()
            .execute()
        )
        
        if not spotify_connection.data:
            logger.error("Spotify connection not found")
            raise ValueError("Spotify connection not found")
        
        access_token = spotify_connection.data.get('access_token')
        logger.info(f"Spotify access token: {access_token}")
        return access_token
    except Exception as e:
        logger.error(f"Error getting Spotify token: {str(e)}")
        raise

def main():
    try:
        # Get authenticated user
        user = get_authenticated_user()
        
        # Get Spotify token
        spotify_token = get_spotify_token(user['id'])
        
        logger.info("Successfully retrieved user and Spotify token")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()