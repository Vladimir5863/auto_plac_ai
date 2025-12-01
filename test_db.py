#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    print("Testing database connection...")
    from database import SessionLocal
    from schemas import User

    # Test database connection
    db = SessionLocal()
    print('Database connection successful')

    # Check users and their password hashes
    users = db.query(User).all()
    print(f'Found {len(users)} users:')
    for user in users:
        print(f'  {user.email} ({user.korisnickoIme}) - Hash: {user.lozinka}')

    # Test password verification
    from werkzeug.security import check_password_hash, generate_password_hash
    print('\nTesting password verification with werkzeug:')
    for user in users:
        is_valid = check_password_hash(user.lozinka, 'password123')
        print(f'  {user.email}: password123 = {is_valid}')

    # Test creating new hash
    print('\nTesting new hash generation:')
    new_hash = generate_password_hash('password123')
    print(f'New hash: {new_hash}')
    is_valid_new = check_password_hash(new_hash, 'password123')
    print(f'New hash verification: {is_valid_new}')

    db.close()
    print("Database test completed successfully!")

except Exception as e:
    print(f'Database error: {e}')
    import traceback
    traceback.print_exc()
