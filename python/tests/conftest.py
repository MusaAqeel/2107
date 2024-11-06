import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent / "ai-chat" / "python"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
import os
from dotenv import load_dotenv

load_dotenv(".env.test", override=True)

from main import app

@pytest.fixture(scope="module")
def test_client():
    """Create a TestClient instance for testing API endpoints."""
    with TestClient(app) as client:
        yield client

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
            }
        ]
    }