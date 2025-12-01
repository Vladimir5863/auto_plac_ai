#!/usr/bin/env python3
import requests
import json
import sys
import os

# Add app directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    print("Testing registration...")
    register_data = {
        'korisnickoIme': 'testuser',
        'email': 'test@example.com',
        'brojTelefona': '+381601234567',
        'lozinka': 'testpass123',
        'tipKorisnika': 'Kupac'
    }

    response = requests.post('http://localhost:8000/auth/register', json=register_data)
    print(f'Registration Status: {response.status_code}')
    print(f'Response: {response.text}')
    print()

    print("Testing login with marko@example.com...")
    login_data = {
        'username': 'marko@example.com',
        'password': 'password123'
    }

    response = requests.post('http://localhost:8000/auth/login', data=login_data)
    print(f'Login Status: {response.status_code}')
    print(f'Response: {response.text}')
    print()

    print("Testing login with ana@example.com...")
    login_data = {
        'username': 'ana@example.com',
        'password': 'password123'
    }

    response = requests.post('http://localhost:8000/auth/login', data=login_data)
    print(f'Login Status: {response.status_code}')
    print(f'Response: {response.text}')

except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
