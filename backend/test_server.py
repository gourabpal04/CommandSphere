import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from server import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/api/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    # Note: Health check might fail in test environment without MongoDB
    # but the endpoint should still respond

@pytest.mark.skip(reason="Requires MongoDB connection")
def test_create_status_check():
    test_data = {"client_name": "Test Client"}
    response = client.post("/api/status", json=test_data)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "client_name" in data
    assert "timestamp" in data
    assert data["client_name"] == "Test Client"

@pytest.mark.skip(reason="Requires MongoDB connection")
def test_get_status_checks():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)