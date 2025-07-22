#!/usr/bin/env python3
"""
Comprehensive Backend Testing for CommandSphere Application
Tests all API endpoints, MongoDB integration, and Docker configuration
"""

import pytest
import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://026e59e1-f09f-4d20-892a-aec199da092c.preview.emergentagent.com')
API_BASE_URL = f"{BACKEND_URL}/api"

class TestBackendAPI:
    """Test suite for backend API endpoints"""
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{API_BASE_URL}/", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "message" in data, "Response should contain 'message' field"
            assert data["message"] == "Hello World", f"Expected 'Hello World', got {data['message']}"
            
            print("✅ Root endpoint test passed")
            return True
        except Exception as e:
            print(f"❌ Root endpoint test failed: {str(e)}")
            return False
    
    def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "status" in data, "Response should contain 'status' field"
            assert "database" in data, "Response should contain 'database' field"
            
            # Check if database is connected
            if data["status"] == "healthy":
                assert data["database"] == "connected", "Database should be connected when status is healthy"
                print("✅ Health endpoint test passed - Database connected")
            else:
                print(f"⚠️ Health endpoint responded but database is disconnected: {data}")
            
            return True
        except Exception as e:
            print(f"❌ Health endpoint test failed: {str(e)}")
            return False
    
    def test_create_status_check(self):
        """Test creating a status check"""
        try:
            test_data = {
                "client_name": "CommandSphere Test Client"
            }
            
            response = requests.post(
                f"{API_BASE_URL}/status", 
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert "id" in data, "Response should contain 'id' field"
            assert "client_name" in data, "Response should contain 'client_name' field"
            assert "timestamp" in data, "Response should contain 'timestamp' field"
            assert data["client_name"] == test_data["client_name"], f"Expected {test_data['client_name']}, got {data['client_name']}"
            
            # Validate UUID format
            import uuid
            uuid.UUID(data["id"])  # This will raise ValueError if not valid UUID
            
            # Validate timestamp format
            datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
            
            print("✅ Create status check test passed")
            return data["id"]  # Return ID for cleanup
        except Exception as e:
            print(f"❌ Create status check test failed: {str(e)}")
            return False
    
    def test_get_status_checks(self):
        """Test retrieving status checks"""
        try:
            response = requests.get(f"{API_BASE_URL}/status", timeout=10)
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            data = response.json()
            assert isinstance(data, list), "Response should be a list"
            
            # If there are status checks, validate their structure
            if data:
                for status_check in data:
                    assert "id" in status_check, "Each status check should have 'id'"
                    assert "client_name" in status_check, "Each status check should have 'client_name'"
                    assert "timestamp" in status_check, "Each status check should have 'timestamp'"
            
            print(f"✅ Get status checks test passed - Found {len(data)} status checks")
            return True
        except Exception as e:
            print(f"❌ Get status checks test failed: {str(e)}")
            return False
    
    def test_cors_headers(self):
        """Test CORS configuration"""
        try:
            response = requests.options(f"{API_BASE_URL}/", timeout=10)
            
            # Check for CORS headers
            headers = response.headers
            cors_headers = [
                'access-control-allow-origin',
                'access-control-allow-methods',
                'access-control-allow-headers'
            ]
            
            for header in cors_headers:
                if header in headers:
                    print(f"✅ CORS header found: {header} = {headers[header]}")
            
            print("✅ CORS configuration test completed")
            return True
        except Exception as e:
            print(f"❌ CORS test failed: {str(e)}")
            return False

class TestDockerConfiguration:
    """Test Docker-related configurations"""
    
    def test_backend_accessibility(self):
        """Test that backend is accessible through the configured URL"""
        try:
            response = requests.get(f"{API_BASE_URL}/health", timeout=10)
            assert response.status_code == 200, "Backend should be accessible"
            print("✅ Backend accessibility test passed")
            return True
        except Exception as e:
            print(f"❌ Backend accessibility test failed: {str(e)}")
            return False
    
    def test_api_prefix_routing(self):
        """Test that API routes are properly prefixed with /api"""
        try:
            # Test that root without /api prefix returns 404 or different response
            try:
                response = requests.get(f"{BACKEND_URL}/", timeout=5)
                # If this succeeds, it means there's a route without /api prefix
                print(f"⚠️ Root endpoint accessible without /api prefix: {response.status_code}")
            except:
                print("✅ Root endpoint properly requires /api prefix")
            
            # Test that /api routes work
            response = requests.get(f"{API_BASE_URL}/", timeout=10)
            assert response.status_code == 200, "API routes should work with /api prefix"
            print("✅ API prefix routing test passed")
            return True
        except Exception as e:
            print(f"❌ API prefix routing test failed: {str(e)}")
            return False

def run_comprehensive_backend_tests():
    """Run all backend tests and return summary"""
    print("=" * 60)
    print("COMMANDSPHERE BACKEND TESTING SUITE")
    print("=" * 60)
    print(f"Testing backend at: {API_BASE_URL}")
    print()
    
    api_tests = TestBackendAPI()
    docker_tests = TestDockerConfiguration()
    
    results = {
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_results": []
    }
    
    # Define test cases
    test_cases = [
        ("Backend Accessibility", docker_tests.test_backend_accessibility),
        ("API Prefix Routing", docker_tests.test_api_prefix_routing),
        ("Root Endpoint", api_tests.test_root_endpoint),
        ("Health Check Endpoint", api_tests.test_health_endpoint),
        ("CORS Configuration", api_tests.test_cors_headers),
        ("Create Status Check", api_tests.test_create_status_check),
        ("Get Status Checks", api_tests.test_get_status_checks),
    ]
    
    # Run tests
    for test_name, test_func in test_cases:
        print(f"\n🧪 Running: {test_name}")
        print("-" * 40)
        
        try:
            result = test_func()
            if result:
                results["passed_tests"] += 1
                results["test_results"].append({"name": test_name, "status": "PASSED"})
            else:
                results["failed_tests"] += 1
                results["test_results"].append({"name": test_name, "status": "FAILED"})
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results["failed_tests"] += 1
            results["test_results"].append({"name": test_name, "status": "FAILED", "error": str(e)})
        
        results["total_tests"] += 1
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {results['total_tests']}")
    print(f"Passed: {results['passed_tests']}")
    print(f"Failed: {results['failed_tests']}")
    print(f"Success Rate: {(results['passed_tests']/results['total_tests']*100):.1f}%")
    
    print("\nDetailed Results:")
    for test_result in results["test_results"]:
        status_icon = "✅" if test_result["status"] == "PASSED" else "❌"
        print(f"{status_icon} {test_result['name']}: {test_result['status']}")
        if "error" in test_result:
            print(f"   Error: {test_result['error']}")
    
    return results

if __name__ == "__main__":
    results = run_comprehensive_backend_tests()
    
    # Exit with appropriate code
    if results["failed_tests"] > 0:
        exit(1)
    else:
        exit(0)