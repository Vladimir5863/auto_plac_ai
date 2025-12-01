from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

try:
    # Use the same connection string as in your database.py
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Vladimir@localhost/auto_plac_ai"
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create a configured "Session" class
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create a new session
    db = SessionLocal()
    
    # Test the connection
    with engine.connect() as conn:
        print("✅ Successfully connected to the database!")
        
        # Use SQLAlchemy's inspector to get table information
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if tables:
            print("\nTables in the database:")
            for table in tables:
                print(f"- {table}")
                
                # Get columns for each table
                columns = inspector.get_columns(table)
                for column in columns:
                    print(f"  - {column['name']} ({column['type']})")
        else:
            print("\nNo tables found in the database.")
            print("\nCreating tables from models...")
            from app.database import Base
            Base.metadata.create_all(bind=engine)
            print("✅ Tables created successfully!")
        
except Exception as e:
    print("❌ Error:")
    print(str(e))
    
    # Additional error information
    import traceback
    print("\nStack trace:")
    traceback.print_exc()
    
finally:
    # Close the session
    if 'db' in locals():
        db.close()
