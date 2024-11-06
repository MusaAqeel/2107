import pytest
import requests
import requests_mock
from unittest.mock import Mock, patch
import json
from spotify import get_gpt_recommendations, clean_gpt_response, get_track_ids, main

@pytest.fixture
def auth_token():
   return "BQAH4z2FrZVFRoNpAyzzIdF7xnVd2vkD9RlCRQOlW1ZDobo2zLC3jwveO3ifbIugqWPTonm8sWLRw9tjZtfkWktOVnGmvjm1P5DNWqhWOpO2XH3qkUc"

@pytest.fixture
def sample_recommendations():
   return {
       "recommendations": [
           {
               "title": "Coffee",
               "artist": "Beabadoobee"
           },
           {
               "title": "Sofia",
               "artist": "Clairo" 
           },
           {
               "title": "Valentine", 
               "artist": "Laufey"
           },
           {
               "title": "Best Part",
               "artist": "Daniel Caesar"
           },
           {
               "title": "Get You",
               "artist": "Daniel Caesar" 
           }
       ]
   }

@pytest.fixture
def gpt_raw_response():
   return '''```json
   {
       "recommendations": [
           {
               "title": "Coffee",
               "artist": "Beabadoobee"
           }
       ]
   }
   ```'''

@patch('openai.OpenAI')
def test_main_function(mock_openai_class, requests_mock, auth_token):
    """Test the main function end-to-end"""
    mock_message = Mock()
    mock_message.content = '''{"recommendations": [{"title": "Song #$@", "artist": "Artist #$@"}]}'''
    
    mock_choice = Mock()
    mock_choice.message = mock_message
    
    mock_completion = Mock()
    mock_completion.choices = [mock_choice]
    
    mock_openai = Mock()
    mock_openai.chat.completions.create.return_value = mock_completion
    mock_openai_class.return_value = mock_openai
    
    requests_mock.get(
        'https://api.spotify.com/v1/search',
        json={
            "tracks": {
                "items": [
                    {"id": "test_id"}
                ]
            }
        }
    )
    
    result = main("test prompt", auth_token)
    assert isinstance(result, list)
    assert len(result) > 0

def test_clean_gpt_response(gpt_raw_response):
   """Test cleaning GPT response"""
   cleaned = clean_gpt_response(gpt_raw_response)
   assert isinstance(cleaned, dict)
   assert "recommendations" in cleaned
   assert len(cleaned["recommendations"]) > 0

def test_successful_track_search(requests_mock, auth_token, sample_recommendations):
   """Test successful track search with valid response."""
   requests_mock.get(
       'https://api.spotify.com/v1/search',
       json={
           "tracks": {
               "items": [
                   {
                       "id": "1234567890",
                       "name": "Coffee",
                       "artists": [{"name": "Beabadoobee"}]
                   }
               ]
           }
       }
   )
   
   result = get_track_ids(sample_recommendations, auth_token)
   assert len(result) > 0
   assert result[0] == "1234567890"

def test_track_not_found(requests_mock, auth_token):
   """Test track search with no results."""
   requests_mock.get(
       'https://api.spotify.com/v1/search',
       json={
           "tracks": {
               "items": []
           }
       }
   )
   
   result = get_track_ids({"recommendations": [{"title": "NonexistentTrack", "artist": "NonexistentArtist"}]}, auth_token)
   assert len(result) == 0

def test_invalid_token(requests_mock, auth_token, sample_recommendations):
   """Test search with invalid authentication token."""
   requests_mock.get(
       'https://api.spotify.com/v1/search',
       status_code=401,
       json={
           "error": {
               "status": 401,
               "message": "Invalid access token"
           }
       }
   )
   
   result = get_track_ids(sample_recommendations, "invalid_token")
   assert len(result) == 0

def test_malformed_json_response():
   """Test handling of malformed JSON in GPT response"""
   with pytest.raises(json.JSONDecodeError):
       clean_gpt_response("invalid json")

@patch('spotify.get_gpt_recommendations')
def test_main_function(mock_gpt, requests_mock, auth_token):
   """Test the main function end-to-end"""
   mock_gpt.return_value = {
       "recommendations": [
           {"title": "Test Song", "artist": "Test Artist"}
       ]
   }
   
   requests_mock.get(
       'https://api.spotify.com/v1/search',
       json={
           "tracks": {
               "items": [
                   {"id": "test_id"}
               ]
           }
       }
   )
   
   result = main("test prompt", auth_token)
   assert isinstance(result, list)
   assert len(result) > 0

def test_network_error(requests_mock, auth_token, sample_recommendations):
   """Test handling of network error."""
   requests_mock.get(
       'https://api.spotify.com/v1/search',
       exc=requests.exceptions.ConnectionError
   )
   
   result = get_track_ids(sample_recommendations, auth_token)
   assert len(result) == 0

def test_empty_recommendations():
   """Test handling of empty recommendations"""
   result = get_track_ids({"recommendations": []}, "token")
   assert len(result) == 0

def test_missing_keys_in_recommendations():
   """Test handling of malformed recommendations"""
   bad_recommendations = {
       "recommendations": [
           {"wrong_key": "value"}
       ]
   }
   with pytest.raises(KeyError):
       get_track_ids(bad_recommendations, "token")

@patch.dict('os.environ', {'OPENAI_API_KEY': ''})
def test_missing_api_key():
   """Test behavior when OpenAI API key is missing"""
   with pytest.raises(Exception):
       get_gpt_recommendations("test prompt")