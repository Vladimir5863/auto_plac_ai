#!/usr/bin/env python3
"""
Database seeder for AutoPlac AI
Populates the database with sample data for testing and development
"""

import sys
import os
import random
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from pathlib import Path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from schemas import User, Vozilo, Oglas, Uplata, Izvestaj, IzvestajOglas
from werkzeug.security import generate_password_hash

def create_sample_users(db: Session):
    """Create sample users"""
    print("Creating sample users...")

    users_data = [
        {
            "korisnickoIme": "marko_petrovic",
            "email": "marko@example.com",
            "lozinka": "password123",
            "brojTelefona": "+381 65 123 4567",
            "tipKorisnika": "Kupac",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "korisnickoIme": "ana_jovanovic",
            "email": "ana@example.com",
            "lozinka": "password123",
            "brojTelefona": "+381 66 234 5678",
            "tipKorisnika": "Prodavac",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "korisnickoIme": "nikola_stojanovic",
            "email": "nikola@example.com",
            "lozinka": "password123",
            "brojTelefona": "+381 64 345 6789",
            "tipKorisnika": "Kupac",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "korisnickoIme": "marija_ilic",
            "email": "marija@example.com",
            "lozinka": "password123",
            "brojTelefona": "+381 63 456 7890",
            "tipKorisnika": "Prodavac",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "korisnickoIme": "admin",
            "email": "admin@autoplac.com",
            "lozinka": "admin123",
            "brojTelefona": "+381 11 000 0000",
            "tipKorisnika": "Admin",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            # Hash the password before saving
            user_data["lozinka"] = generate_password_hash(user_data["lozinka"])
            user = User(**user_data)
            db.add(user)

    db.commit()
    print(f"Created {len(users_data)} users")

def get_random_car_image():
    """Get a random car image from the Auti folder"""
    auti_dir = Path("C:/Users/Vladimir Nikolic/Desktop/auto_plac-ai/Auti")
    if not auti_dir.exists():
        print(f"Warning: Directory {auti_dir} not found. Using default image.")
        return '"/images/default-car.jpg"'
    
    # Get list of all image files in the directory
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    image_files = [f for f in os.listdir(auti_dir) 
                  if os.path.isfile(os.path.join(auti_dir, f)) and 
                  os.path.splitext(f)[1].lower() in image_extensions]
    
    if not image_files:
        print("Warning: No image files found in the Auti directory. Using default image.")
        return '"/images/default-car.jpg"'
    
    # Select a random image
    selected_image = random.choice(image_files)
    # Return as a JSON string
    return f'"{selected_image}"'


def create_sample_vozila(db: Session):
    """Create sample vehicles"""
    print("Creating sample vehicles...")

    # Get a random image for each vehicle
    car_image_1 = get_random_car_image()
    car_image_2 = get_random_car_image()
    car_image_3 = get_random_car_image()

    vozila_data = [
        {
            "marka": "BMW",
            "model": "X5",
            "godinaProizvodnje": 2022,
            "cena": 85000.0,
            "tipGoriva": "Dizel",
            "kilometraza": "15000",
            "tipKaroserije": "SUV",
            "snagaMotoraKW": 250.0,
            "stanje": "Polovno",
            "opis": "Odlicno ocuvan BMW X5 iz 2022. godine sa svim servisima. Vozilo je redovno odrzavano u ovlascenom servisu. Ima punu fabricu garanciju. Opremljen sa svim modernim sistemima: navigacija, kamera za voznju unazad, parking senzori, automatska klima, kozna sedista, panoramski krov.",
            "slike": f'["{car_image_1}"]',
            "lokacija": "Beograd",
            "klima": "Automatska",
            "tipMenjaca": "Automatski",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 3000,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "marka": "Mercedes",
            "model": "C-Class",
            "godinaProizvodnje": 2023,
            "cena": 65000.0,
            "tipGoriva": "Benzin",
            "kilometraza": "5000",
            "tipKaroserije": "Limuzina",
            "snagaMotoraKW": 200.0,
            "stanje": "Novo",
            "opis": "Potpuno nov Mercedes C-Class iz 2023. godine. Vozilo je kupljeno u ovlascenom salonu, ima punu garanciju. Opremljen sa najnovijim tehnologijama i sigurnosnim sistemima.",
            "slike": f'["{car_image_2}"]',
            "lokacija": "Novi Sad",
            "klima": "Automatska",
            "tipMenjaca": "Automatski",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 2000,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "marka": "Audi",
            "model": "A4",
            "godinaProizvodnje": 2021,
            "cena": 45000.0,
            "tipGoriva": "Hibrid",
            "kilometraza": "25000",
            "tipKaroserije": "Limuzina",
            "snagaMotoraKW": 180.0,
            "stanje": "Polovno",
            "opis": "Odlican Audi A4 hibrid iz 2021. godine. Ekonimican i ekoloski prihvatljiv. Redovno servisiran, bez udesa. Idealno za gradsku voznju.",
            "slike": f'["{car_image_3}"]',
            "lokacija": "Nis",
            "klima": "Automatska",
            "tipMenjaca": "Automatski",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 1800,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "marka": "Volkswagen",
            "model": "Golf",
            "godinaProizvodnje": 2020,
            "cena": 25000.0,
            "tipGoriva": "Benzin",
            "kilometraza": "45000",
            "tipKaroserije": "Hatchback",
            "snagaMotoraKW": 150.0,
            "stanje": "Polovno",
            "opis": "Pouzdan Volkswagen Golf iz 2020. godine. Odlican za pocetnike i porodice. Ekonimican u potrosnji, jeftin za odrzavanje.",
            "slike": '["/images/vw-golf-1.jpg", "/images/vw-golf-2.jpg"]',
            "lokacija": "Kragujevac",
            "klima": "Manuelna",
            "tipMenjaca": "Manuelni",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 1600,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "marka": "Toyota",
            "model": "Corolla",
            "godinaProizvodnje": 2023,
            "cena": 30000.0,
            "tipGoriva": "Hibrid",
            "kilometraza": "8000",
            "tipKaroserije": "Limuzina",
            "snagaMotoraKW": 120.0,
            "stanje": "Novo",
            "opis": "Nova Toyota Corolla hibrid. Najbolji odnos cene i kvaliteta. Ekonimicna, pouzdana i ekoloski prihvatljiva. Savrsena za gradsku voznju.",
            "slike": '["/images/toyota-corolla-1.jpg", "/images/toyota-corolla-2.jpg"]',
            "lokacija": "Beograd",
            "klima": "Automatska",
            "tipMenjaca": "Automatski",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 1800,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "marka": "Honda",
            "model": "Civic",
            "godinaProizvodnje": 2022,
            "cena": 35000.0,
            "tipGoriva": "Benzin",
            "kilometraza": "12000",
            "tipKaroserije": "Hatchback",
            "snagaMotoraKW": 160.0,
            "stanje": "Polovno",
            "opis": "Sportski Honda Civic iz 2022. godine. Dinamicna i zabavna za voznju. Opremljena sa najnovijim tehnologijama.",
            "slike": '["/images/honda-civic-1.jpg", "/images/honda-civic-2.jpg"]',
            "lokacija": "Subotica",
            "klima": "Automatska",
            "tipMenjaca": "Automatski",
            "ostecenje": False,
            "euroNorma": "Euro 6",
            "kubikaza": 2000,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for vozilo_data in vozila_data:
        # Check if vehicle already exists
        existing_vozilo = db.query(Vozilo).filter(
            Vozilo.marka == vozilo_data["marka"],
            Vozilo.model == vozilo_data["model"],
            Vozilo.godinaProizvodnje == vozilo_data["godinaProizvodnje"]
        ).first()
        if not existing_vozilo:
            vozilo = Vozilo(**vozilo_data)
            db.add(vozilo)

    db.commit()
    print(f"Created {len(vozila_data)} vehicles")

def create_sample_oglasi(db: Session):
    """Create sample advertisements"""
    print("Creating sample advertisements...")

    # Get users and vehicles
    users = db.query(User).all()
    vozila = db.query(Vozilo).all()

    if not users or not vozila:
        print("No users or vehicles found. Please run user and vehicle seeders first.")
        return

    oglasi_data = []
    for i, vozilo in enumerate(vozila):
        user = users[i % len(users)]  # Cycle through users
        oglas_data = {
            "datumKreiranja": date.today(),
            "datumIsteka": date.today() + timedelta(days=30),
            "cenaIstaknutogOglasa": None,
            "voziloID": vozilo.voziloID,
            "korisnikID": user.id,
            "statusOglasa": "standardniOglas",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        oglasi_data.append(oglas_data)

    for oglas_data in oglasi_data:
        # Check if oglas already exists
        existing_oglas = db.query(Oglas).filter(
            Oglas.voziloID == oglas_data["voziloID"],
            Oglas.korisnikID == oglas_data["korisnikID"]
        ).first()
        if not existing_oglas:
            oglas = Oglas(**oglas_data)
            db.add(oglas)

    db.commit()
    print(f"Created {len(oglasi_data)} advertisements")

def seed_database():
    """Main seeding function"""
    print("Starting database seeding...")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified")

    # Create database session
    db = SessionLocal()

    try:
        # Seed data
        create_sample_users(db)
        create_sample_vozila(db)
        create_sample_oglasi(db)

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
