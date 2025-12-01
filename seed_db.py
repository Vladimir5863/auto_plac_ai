#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    exec(open('app/seed_database.py').read())
    print("Database seeding completed successfully!")
except Exception as e:
    print(f"Error during database seeding: {e}")
    import traceback
    traceback.print_exc()
