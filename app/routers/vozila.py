import os
import shutil
from datetime import datetime, date, timedelta
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from schemas import Vozilo as SQLAlchemyVozilo, User as SQLAlchemyUser, Oglas
from database import SessionLocal
from pydantic_models import Vozilo, VoziloCreate, VoziloUpdate, User
from typing import List, Optional
from app.auth import get_current_user as auth_get_current_user

# Create uploads directory (match app.main mount)
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_uploaded_files(files: List[UploadFile]) -> List[str]:
    """Save uploaded files and return their paths"""
    saved_paths = []
    
    for file in files:
        # Create a unique filename
        timestamp = int(datetime.now().timestamp())
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / filename

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        saved_paths.append(str(file_path))
    
    return saved_paths


# Use centralized auth from app.auth

@router.post("/vozila/", response_model=Vozilo)
async def create_vozilo(
    marka: str = Form(...),
    model: str = Form(...),
    godinaProizvodnje: int = Form(...),
    cena: float = Form(...),
    tipGoriva: str = Form(...),
    kilometraza: str = Form(...),
    lokacija: str = Form(...),
    stanje: str = Form(...),
    kubikaza: int = Form(...),
    opis: str = Form(...),
    tipKaroserije: str = Form(...),
    snagaMotoraKW: int = Form(...),
    klima: str = Form(...),
    tipMenjaca: str = Form(...),
    ostecenje: bool = Form(False),
    euroNorma: str = Form(...),
    slike: List[UploadFile] = File(...),
    current_user: SQLAlchemyUser = Depends(auth_get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Save uploaded files
        saved_paths = save_uploaded_files(slike)
        
        # Create a comma-separated string of file paths
        slike_paths = ",".join([os.path.basename(path) for path in saved_paths])
        
        # Create the vehicle record
        db_vozilo = SQLAlchemyVozilo(
            marka=marka,
            model=model,
            godinaProizvodnje=godinaProizvodnje,
            cena=cena,
            tipGoriva=tipGoriva,
            kilometraza=kilometraza,
            lokacija=lokacija,
            slike=slike_paths,  # Store comma-separated paths
            stanje=stanje,
            kubikaza=kubikaza,
            opis=opis,
            tipKaroserije=tipKaroserije,
            snagaMotoraKW=snagaMotoraKW,
            klima=klima,
            tipMenjaca=tipMenjaca,
            ostecenje=ostecenje,
            euroNorma=euroNorma
        )
        
        # Add the vehicle to the database
        db.add(db_vozilo)
        
        try:
            # First commit the vehicle to get its ID
            db.commit()
            db.refresh(db_vozilo)
            
            # Now create the ad (oglas) record
            today = date.today()
            expiry_date = today + timedelta(days=30)  # 30 days from now
            
            db_oglas = Oglas(
                datumKreiranja=today,
                datumIsteka=expiry_date,
                voziloID=db_vozilo.voziloID,
                korisnikID=current_user.id,
                statusOglasa='aktivan',
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Add and commit the ad
            db.add(db_oglas)
            db.commit()
            db.refresh(db_oglas)
            
            # Log the created ad for debugging
            print(f"Created ad: ID={db_oglas.oglasID} for vehicle ID={db_oglas.voziloID} by user ID={db_oglas.korisnikID}")
            
            # Refresh the vehicle to include relationships
            db.refresh(db_vozilo)
            
            return db_vozilo
            
        except Exception as e:
            # Rollback in case of error
            db.rollback()
            print(f"Error in create_vozilo: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error creating vehicle ad: {str(e)}")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating vehicle: {str(e)}")

@router.get("/vozila/{vozilo_id}", response_model=Vozilo)
def read_vozilo(vozilo_id: int, db: Session = Depends(get_db)):
    vozilo = db.query(SQLAlchemyVozilo).filter(SQLAlchemyVozilo.voziloID == vozilo_id).first()
    if vozilo is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    oglas = db.query(Oglas).filter(Oglas.voziloID == vozilo_id).first()

    if oglas:
        is_featured = oglas.statusOglasa == 'istaknutiOglas'
        setattr(vozilo, 'isFeatured', is_featured)
        setattr(vozilo, 'istaknuto', is_featured)
        setattr(vozilo, 'statusOglasa', oglas.statusOglasa)
        setattr(vozilo, 'oglasID', oglas.oglasID)

    return vozilo

@router.get("/vozila/", response_model=list[Vozilo])
def read_vozila(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    results = (
        db.query(SQLAlchemyVozilo, Oglas)
        .outerjoin(Oglas, Oglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter((Oglas.statusOglasa != 'prodat') | (Oglas.statusOglasa.is_(None)))
        .offset(skip)
        .limit(limit)
        .all()
    )

    vozila = []
    for vozilo_row, oglas_row in results:
        is_featured = bool(oglas_row and oglas_row.statusOglasa == 'istaknutiOglas')
        setattr(vozilo_row, 'isFeatured', is_featured)
        setattr(vozilo_row, 'istaknuto', is_featured)
        if oglas_row is not None:
            setattr(vozilo_row, 'statusOglasa', oglas_row.statusOglasa)
            setattr(vozilo_row, 'oglasID', oglas_row.oglasID)
        vozila.append(vozilo_row)

    return vozila

@router.get("/vozila/search/", response_model=list[Vozilo])
def search_vozila(
    marka: str = None,
    model: str = None,
    min_cena: float = None,
    max_cena: float = None,
    db: Session = Depends(get_db)
):
    query = db.query(SQLAlchemyVozilo).outerjoin(Oglas, Oglas.voziloID == SQLAlchemyVozilo.voziloID)
    query = query.filter((Oglas.statusOglasa != 'prodat') | (Oglas.statusOglasa.is_(None)))
    if marka:
        query = query.filter(SQLAlchemyVozilo.marka.ilike(f"%{marka}%"))
    if model:
        query = query.filter(SQLAlchemyVozilo.model.ilike(f"%{model}%"))
    if min_cena:
        query = query.filter(SQLAlchemyVozilo.cena >= min_cena)
    if max_cena:
        query = query.filter(SQLAlchemyVozilo.cena <= max_cena)
    return query.all()

@router.get("/vozila/{vozilo_id}/ad-status", response_model=dict)
def get_ad_status(vozilo_id: int, db: Session = Depends(get_db)):
    oglas = db.query(Oglas).filter(Oglas.voziloID == vozilo_id).first()

    if not oglas:
        return {
            "has_active_ad": False,
            "status": "no_ad",
            "message": "No ad found for this vehicle"
        }

    today = date.today()
    is_active = (
        oglas.statusOglasa in ['standardniOglas', 'istaknutiOglas'] and
        oglas.datumIsteka and oglas.datumIsteka >= today
    )

    is_sold = oglas.statusOglasa == 'prodat'
    sale_date = oglas.datumProdaje.isoformat() if oglas.datumProdaje else None

    return {
        "has_active_ad": is_active,
        "status": oglas.statusOglasa,
        "expiration_date": oglas.datumIsteka.isoformat() if oglas.datumIsteka else None,
        "is_featured": oglas.statusOglasa == 'istaknutiOglas',
        "is_sold": is_sold,
        "buyer_id": oglas.buyerID,
        "ad_id": oglas.oglasID,
        "sale_date": sale_date
    }

@router.put("/vozila/{vozilo_id}", response_model=Vozilo)
def update_vozilo(vozilo_id: int, updated_vozilo: VoziloUpdate, db: Session = Depends(get_db)):
    vozilo = db.query(SQLAlchemyVozilo).filter(SQLAlchemyVozilo.voziloID == vozilo_id).first()
    if vozilo is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    oglas = db.query(Oglas).filter(Oglas.voziloID == vozilo_id).first()
    if oglas and oglas.statusOglasa == 'prodat':
        raise HTTPException(status_code=400, detail="Cannot modify sold vehicle")

    for field, value in updated_vozilo.model_dump().items():
        setattr(vozilo, field, value)
    db.commit()
    db.refresh(vozilo)
    return vozilo

@router.delete("/vozila/{vozilo_id}")
def delete_vozilo(vozilo_id: int, db: Session = Depends(get_db)):
    vozilo = db.query(SQLAlchemyVozilo).filter(SQLAlchemyVozilo.voziloID == vozilo_id).first()
    if vozilo is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vozilo)
    db.commit()
    return {"message": "Vehicle deleted successfully"}

@router.get("/vozila/{vozilo_id}/seller", response_model=User)
def get_seller_info(vozilo_id: int, db: Session = Depends(get_db)):
    try:
        print(f"Fetching ad for vehicle ID: {vozilo_id}")
        # Find the ad for this vehicle
        oglas = db.query(Oglas).filter(Oglas.voziloID == vozilo_id).first()
        print(f"Found ad: {oglas}")
        
        if not oglas:
            # Try to find the vehicle first to give a more specific error
            vozilo = db.query(SQLAlchemyVozilo).filter(SQLAlchemyVozilo.voziloID == vozilo_id).first()
            if not vozilo:
                raise HTTPException(status_code=404, detail="Vehicle not found")
            raise HTTPException(status_code=404, detail="Ad for this vehicle not found. The vehicle exists but has no associated ad.")

        # Get the seller (user who created the ad)
        seller = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.id == oglas.korisnikID).first()
        print(f"Found seller: {seller}")
        
        if not seller:
            raise HTTPException(status_code=404, detail="User account for this seller not found")

        return seller
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error in get_seller_info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
