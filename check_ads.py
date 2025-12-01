from app.database import SessionLocal
from app.models import Oglas

def check_ads():
    db = SessionLocal()
    try:
        # Get total count of ads
        count = db.query(Oglas).count()
        print(f"Total ads in database: {count}")
        
        # Get first few ads if they exist
        if count > 0:
            print("\nSample ads:")
            for ad in db.query(Oglas).limit(5).all():
                print(f"- ID: {ad.oglasID}, Vehicle ID: {ad.voziloID}, User ID: {ad.korisnikID}, Status: {ad.statusOglasa}")
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_ads()
