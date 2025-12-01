import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app.database import SQLAlchemyVozilo as Vozilo, Oglas, SQLAlchemyUser

def check_vehicle(vehicle_id):
    db = SessionLocal()
    try:
        # Check if vehicle exists
        vehicle = db.query(Vozilo).filter(Vozilo.voziloID == vehicle_id).first()
        if not vehicle:
            print(f"Error: Vehicle with ID {vehicle_id} not found")
            return
            
        print(f"Vehicle found: {vehicle.marka} {vehicle.model} (ID: {vehicle.voziloID})")
        
        # Check for associated ad
        ad = db.query(Oglas).filter(Oglas.voziloID == vehicle_id).first()
        if not ad:
            print("No associated ad found for this vehicle")
            # Let's check if there are any ads in the database
            total_ads = db.query(Oglas).count()
            print(f"Total ads in database: {total_ads}")
            if total_ads > 0:
                sample_ad = db.query(Oglas).first()
                print(f"Sample ad: ID={sample_ad.oglasID}, VehicleID={sample_ad.voziloID}, UserID={sample_ad.korisnikID}")
        else:
            print(f"Associated ad found: ID={ad.oglasID}, Created: {ad.datumKreiranja}, Expires: {ad.datumIsteka}")
            print(f"Ad created by user ID: {ad.korisnikID}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        vehicle_id = int(sys.argv[1])
    else:
        vehicle_id = 9  # Default to vehicle ID 9 if none provided
    
    check_vehicle(vehicle_id)
