#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    print("Testing werkzeug...")
    from werkzeug.security import generate_password_hash, check_password_hash

    # Test password hashing
    hashed = generate_password_hash('password123')
    print(f'Hashed password: {hashed}')

    # Test password verification
    is_valid = check_password_hash(hashed, 'password123')
    print(f'Password verification: {is_valid}')

    print("Werkzeug test completed successfully!")

except Exception as e:
    print(f'Passlib error: {e}')
    import traceback
    traceback.print_exc()
