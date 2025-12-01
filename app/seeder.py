import json
import random
import shutil
from datetime import datetime, timedelta, date, timezone
from pathlib import Path
from typing import List

from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from schemas import User as UserModel, Vozilo, Oglas
from auth import get_password_hash

FIRST_NAMES = [
    "Marko", "Jovan", "Nikola", "Ana", "Milica", "Petar", "Maja", "Stefan",
    "Ivana", "Sara", "Vladimir", "Jelena", "Filip", "Katarina", "Nemanja",
    "Luka", "Teodora", "Aleksandar", "Miloš", "Tamara"
]
LAST_NAMES = [
    "Nikolic", "Petrovic", "Jovanovic", "Ilic", "Stankovic", "Markovic",
    "Milosevic", "Savic", "Kovacevic", "Popovic", "Mitrovic", "Knezevic",
    "Vasic", "Lukic", "Vukovic", "Pavlovic", "Gajic", "Ivanovic", "Bozic", "Zivkovic"
]

CAR_DATA = {
    "Audi": ["A3", "A4", "A6", "Q3", "Q5"],
    "BMW": ["3", "5", "X1", "X3", "X5"],
    "Mercedes": ["C 200", "E 220", "GLA", "GLC", "S 350"],
    "Volkswagen": ["Golf", "Passat", "Tiguan", "Arteon", "Polo"],
    "Toyota": ["Corolla", "Camry", "RAV4", "Yaris", "Auris"],
    "Hyundai": ["i30", "Tucson", "Kona", "Elantra", "Santa Fe"],
    "Skoda": ["Octavia", "Superb", "Kodiaq", "Kamiq", "Fabia"],
    "Peugeot": ["208", "308", "3008", "2008", "508"],
    "Ford": ["Focus", "Mondeo", "Kuga", "Fiesta", "Puma"],
    "Renault": ["Clio", "Megane", "Kadjar", "Captur", "Talisman"]
}

FUEL_TYPES = ["benzin", "dizel", "plin", "struja", "hibrid"]
BODY_TYPES = ["Limuzina", "Hecbek", "Karavan", "SUV", "Kupe"]
GEARBOX_TYPES = ["Manuelni", "Automatski", "Poluautomatski"]
CLIMATE_TYPES = ["Automatska", "Manuelna", "Dvozonska", "Troznoska"]
EURO_NORMS = ["Euro 4", "Euro 5", "Euro 6"]
CITIES = [
    "Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica", "Zrenjanin",
    "Pančevo", "Čačak", "Kraljevo", "Leskovac", "Vranje", "Sombor",
    "Požarevac", "Užice", "Sremska Mitrovica"
]
STATES = ["Novo", "Polovno"]

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
UPLOADS_DIR = BASE_DIR / "uploads"
SOURCE_IMAGE = PROJECT_ROOT / "Auto.jpg"
TARGET_IMAGE = UPLOADS_DIR / "Auto.jpg"
IMAGES_JSON = json.dumps([f"/uploads/{TARGET_IMAGE.name}"])


def ensure_sample_image() -> None:
    """Copy the sample car image into the uploads directory if needed."""
    if not SOURCE_IMAGE.exists():
        print(f"⚠️ Nije pronađena slika vozila na lokaciji: {SOURCE_IMAGE}")
        return

    TARGET_IMAGE.parent.mkdir(parents=True, exist_ok=True)

    if not TARGET_IMAGE.exists():
        shutil.copy2(SOURCE_IMAGE, TARGET_IMAGE)
        print(f"📸 Kopirana slika vozila u {TARGET_IMAGE}")


def reset_database() -> None:
    """Drop and recreate all tables."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def generate_phone_number() -> str:
    base = random.randint(6000000, 6999999)
    return f"06{random.randint(0, 9)}{base}"


def pick_random(sequence: List[str]) -> str:
    return random.choice(sequence)


def create_vehicle(session: Session, owner_id: int) -> Vozilo:
    marka = pick_random(list(CAR_DATA.keys()))
    model = pick_random(CAR_DATA[marka])
    godina = random.randint(2005, 2024)
    cena = random.randint(4000, 60000)
    fuel = pick_random(FUEL_TYPES)
    body = pick_random(BODY_TYPES)
    gearbox = pick_random(GEARBOX_TYPES)
    klima = pick_random(CLIMATE_TYPES)
    euro = pick_random(EURO_NORMS)
    stanje = pick_random(STATES)
    kubikaza = random.randint(1000, 4000)
    snaga = random.randint(60, 320)
    kilometraza = random.randint(5000, 250000)
    ostecenje = random.choice([True, False])
    today = datetime.now(timezone.utc)

    vozilo = Vozilo(
        marka=marka,
        model=model,
        godinaProizvodnje=godina,
        cena=float(cena),
        tipGoriva=fuel,
        kilometraza=f"{kilometraza} km",
        tipKaroserije=body,
        snagaMotoraKW=float(snaga),
        stanje=stanje,
        opis=f"{marka} {model} iz {godina}. Vrlo očuvan, redovno servisiran.",
        slike=IMAGES_JSON,
        lokacija=pick_random(CITIES),
        klima=klima,
        tipMenjaca=gearbox,
        ostecenje=ostecenje,
        euroNorma=euro,
        kubikaza=kubikaza,
        created_at=today,
        updated_at=today,
    )
    session.add(vozilo)
    session.flush()  # ensure voziloID is generated

    featured = random.choice([True, False])
    created_date = date.today() - timedelta(days=random.randint(0, 90))
    expires_in_days = 45 if featured else 30
    oglas = Oglas(
        datumKreiranja=created_date,
        datumIsteka=created_date + timedelta(days=expires_in_days),
        cenaIstaknutogOglasa=30.0 if featured else None,
        voziloID=vozilo.voziloID,
        korisnikID=owner_id,
        statusOglasa="istaknutiOglas" if featured else "standardniOglas",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(oglas)
    return vozilo


def seed_database(users_count: int = 50, vehicles_per_user: int = 15) -> None:
    ensure_sample_image()
    reset_database()
    session = SessionLocal()

    try:
        for idx in range(1, users_count + 1):
            full_name = f"{pick_random(FIRST_NAMES)} {pick_random(LAST_NAMES)}"
            email = f"user{idx}@example.com"
            user = UserModel(
                korisnickoIme=f"user{idx}",
                email=email,
                brojTelefona=generate_phone_number(),
                tipKorisnika="Prodavac",
                lozinka=get_password_hash("password123"),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            session.add(user)
            session.flush()  # obtain user.id

            for _ in range(vehicles_per_user):
                create_vehicle(session, user.id)

            if idx % 5 == 0:
                session.commit()
                print(f"✔️ Kreirano {idx} korisnika ({idx * vehicles_per_user} vozila)")

        session.commit()
        print(f"✅ Baza je popunjena sa {users_count} korisnika i {users_count * vehicles_per_user} vozila.")
    except Exception as exc:
        session.rollback()
        print("❌ Greška tokom seeder-a:", exc)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_database()
