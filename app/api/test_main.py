import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import json
import requests
from main import app

client = TestClient(app)

@pytest.fixture
def mock_spotify():
   with patch("requests.get") as mock_get, patch("requests.post") as mock_post:
       mock_get.return_value = Mock(
           status_code=200,
           json=lambda: {
               "tracks": {
                   "items": [{
                       "id": "test_track_id",
                       "name": "Test Song",
                       "artists": [{"name": "Test Artist"}]
                   }]
               }
           } if "search" in str(mock_get.call_args) else {"id": "test_user_id"}
       )
       mock_post.return_value = Mock(status_code=201, json=lambda: {"id": "test_playlist_id"})
       yield mock_get, mock_post

@pytest.fixture(autouse=True)
def mock_gpt_response():
   with patch("openai.OpenAI") as mock:
       mock.return_value.chat.completions.create.return_value.choices = [
           Mock(message=Mock(content=json.dumps({
               "recommendations": [
                   {"title": "Test Song 1", "artist": "Test Artist 1"},
                   {"title": "Test Song 2", "artist": "Test Artist 2"},
                   {"title": "Test Song 3", "artist": "Test Artist 3"},
                   {"title": "Test Song 4", "artist": "Test Artist 4"},  
                   {"title": "Test Song 5", "artist": "Test Artist 5"}
               ]
           })))
       ]
       yield mock

def test_gpt_response_structure():
   response = client.post("/api/generate", 
       json={"prompt": "test", "auth_token": "test_token", "playlist_length": 5})
   data = response.json()
   
   assert "recommendations" in data
   assert isinstance(data["recommendations"], dict)
   assert "recommendations" in data["recommendations"]
   assert len(data["recommendations"]["recommendations"]) == 5
   for rec in data["recommendations"]["recommendations"]:
       assert "title" in rec
       assert "artist" in rec
       assert isinstance(rec["title"], str)
       assert isinstance(rec["artist"], str)

def test_gpt_error_handling():
   with patch("openai.OpenAI") as mock:
       mock.return_value.chat.completions.create.return_value.choices = [
           Mock(message=Mock(content="invalid json"))
       ]
       response = client.post("/api/generate",
           json={"prompt": "test", "auth_token": "test_token", "playlist_length": 5})
       assert response.status_code == 200

def test_spotify_integration_errors(mock_spotify):
   with patch("requests.get", side_effect=requests.exceptions.RequestException()):
       response = client.post("/api/generate",
           json={"prompt": "test", "auth_token": "test_token", "playlist_length": 5})
       assert response.status_code == 200

def test_edge_case_prompts(mock_spotify):
   edge_cases = ["😊", "", "a" * 1000]
   for prompt in edge_cases:
       response = client.post("/api/generate",
           json={"prompt": prompt, "auth_token": "test_token", "playlist_length": 5})
       assert response.status_code == 200

def test_spotify_integration(mock_spotify):
   response = client.post("/api/generate",
       json={"prompt": "test", "auth_token": "test_token", "playlist_length": 5})
   assert "track_ids" in response.json()
   assert isinstance(response.json()["track_ids"], list)

def test_create_playlist(mock_spotify):
   response = client.post("/api/playlist",
       headers={"Authorization": "Bearer test_token"},
       json={"track_ids": ["test_id"], "title": "Test"})
   assert response.status_code == 200
   
def test_error_handling():
   response = client.post("/api/generate",
       json={"prompt": "test", "auth_token": "test_token", "playlist_length": 0})
   assert response.status_code == 422
   
   response = client.post("/api/playlist",
       json={"track_ids": ["test_id"], "title": "Test"})
   assert response.status_code == 403

def test_artist_based_recommendations():
   response = client.post("/api/generate",
       json={"prompt": "Mix of Drake and Kendrick Lamar", "auth_token": "test_token", "playlist_length": 5})
   assert response.status_code == 200
   assert "recommendations" in response.json()

def test_track_characteristics():
   response = client.post("/api/generate",
       json={"prompt": "High energy workout mix", "auth_token": "test_token", "playlist_length": 5})
   assert response.status_code == 200

def test_artist_id_search(mock_spotify):
   with patch("main.search_track") as mock_search:
       mock_search.return_value = {
           "id": "test_id",
           "name": "Test Song",
           "artists": [{"id": "artist_id", "name": "Test Artist"}]
       }
       response = client.post(
           "/api/generate",
           json={"prompt": "Songs by Drake", "auth_token": "test_token", "playlist_length": 1}
       )
       assert response.status_code == 200

def test_track_id_search(mock_spotify):
   with patch("main.search_track") as mock_search:
       mock_search.return_value = {
           "id": "track_id",
           "name": "God's Plan",
           "artists": [{"name": "Drake"}]
       }
       response = client.post(
           "/api/generate",
           json={"prompt": "Songs like God's Plan", "auth_token": "test_token", "playlist_length": 1}
       )
       assert response.status_code == 200

def test_playlist_creation_full(mock_spotify):
   response = client.post(
       "/api/playlist",
       headers={"Authorization": "Bearer test_token"},
       json={
           "track_ids": ["track_id1", "track_id2"],
           "title": "Test Playlist",
           "description": "Test Description"
       }
   )
   assert response.status_code == 200
   assert response.json().startswith("https://open.spotify.com/playlist/")