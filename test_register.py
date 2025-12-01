import requests
import json

def test_register():
    url = "http://localhost:8000/auth/register"
    
    # Test user data
    user_data = {
        "korisnickoIme": "testuser1",
        "email": "test1@example.com",
        "brojTelefona": "+381641234567",
        "lozinka": "password123",
        "tipKorisnika": "Kupac"
    }
    
    try:
        print("Sending registration request...")
        response = requests.post(url, json=user_data)
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            print("Response:", json.dumps(response.json(), indent=2))
        else:
            print("❌ Registration failed!")
            print("Response:", response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_register()
