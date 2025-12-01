import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the JWT token from local storage (this is just for testing)
# In a real app, you'd get this from your frontend's localStorage
token = None
try:
    with open(os.path.expanduser('~/.auto_plac_token'), 'r') as f:
        token = f.read().strip()
except FileNotFoundError:
    print("No token found. Please log in first.")
    exit(1)

if not token:
    print("No token available. Please log in first.")
    exit(1)

# Test the token by making a request to a protected endpoint
print(f"Testing token: {token[:10]}...")

# Test 1: Get current user info
print("\nTesting /auth/me endpoint...")
try:
    response = requests.get(
        "http://localhost:8000/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Try to create a car (without actually creating one)
print("\nTesting car creation endpoint...")
try:
    response = requests.post(
        "http://localhost:8000/vozila/",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        json={"test": "test"}  # Invalid data, but we just want to test auth
    )
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Check token expiration
print("\nChecking token expiration...")
try:
    import jwt
    from datetime import datetime
    
    # This is just for testing - in production, you should never expose the SECRET_KEY
    SECRET_KEY = "your-secret-key"  # Should match your backend's SECRET_KEY
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        exp = payload.get('exp')
        if exp:
            exp_time = datetime.fromtimestamp(exp)
            now = datetime.now()
            print(f"Token expires at: {exp_time}")
            print(f"Current time: {now}")
            if now > exp_time:
                print("Token has expired!")
            else:
                print("Token is still valid.")
        else:
            print("No expiration time in token")
    except jwt.ExpiredSignatureError:
        print("Token has expired!")
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
    
except Exception as e:
    print(f"Error checking token: {e}")
