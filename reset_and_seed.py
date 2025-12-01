#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

try:
    print("Resetting database...")
    from database import engine, Base

    print('Dropping all tables...')
    Base.metadata.drop_all(bind=engine)
    print('Creating all tables...')
    Base.metadata.create_all(bind=engine)
    print('Database reset completed!')

    print("Running seed database...")
    exec(open('app/seed_database_clean.py').read())
    print("Database setup completed successfully!")

except Exception as e:
    print(f'Database error: {e}')
    import traceback
    traceback.print_exc()
