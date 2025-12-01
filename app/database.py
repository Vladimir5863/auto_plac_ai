from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

# PostgreSQL URL format: postgresql://user:password@localhost/dbname
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Vladimir@localhost/auto_plac_ai"

# Create engine and check if database exists
engine = create_engine(SQLALCHEMY_DATABASE_URL)
if not database_exists(engine.url):
    create_database(engine.url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
