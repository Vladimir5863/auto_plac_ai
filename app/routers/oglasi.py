from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from schemas import Oglas as SQLAlchemyOglas, Uplata, User, Vozilo as SQLAlchemyVozilo
from database import SessionLocal
from pydantic_models import Oglas, OglasCreate, OglasUpdate, Vozilo
from datetime import datetime, date, timedelta
from typing import Optional
from app.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MyAdResponse(BaseModel):
    oglas: Oglas
    vozilo: Vozilo

    class Config:
        from_attributes = True

@router.post("/oglasi/", response_model=Oglas)
def create_oglas(oglas: OglasCreate, db: Session = Depends(get_db)):
    db_oglas = SQLAlchemyOglas(**oglas.model_dump())
    db.add(db_oglas)
    db.commit()
    db.refresh(db_oglas)
    return db_oglas

@router.get("/oglasi/{oglas_id}", response_model=Oglas)
def read_oglas(oglas_id: int, db: Session = Depends(get_db)):
    oglas = db.query(SQLAlchemyOglas).filter(SQLAlchemyOglas.oglasID == oglas_id).first()
    if oglas is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return oglas


@router.get("/oglasi/{oglas_id}/detail", response_model=MyAdResponse)
def read_oglas_with_vehicle(
    oglas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
        db.query(SQLAlchemyOglas, SQLAlchemyVozilo)
        .outerjoin(SQLAlchemyVozilo, SQLAlchemyOglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter(SQLAlchemyOglas.oglasID == oglas_id)
        .first()
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")

    oglas_row, vozilo_row = result

    if oglas_row.korisnikID != current_user.id and oglas_row.buyerID != current_user.id:
        if getattr(current_user, "tipKorisnika", None) != "admin":
            raise HTTPException(status_code=403, detail="Nemate pristup ovom oglasu")

    if vozilo_row is None:
        raise HTTPException(status_code=404, detail="Vehicle not found for advertisement")

    return MyAdResponse(
        oglas=Oglas.model_validate(oglas_row),
        vozilo=Vozilo.model_validate(vozilo_row)
    )

@router.get("/oglasi/", response_model=list[Oglas])
def read_oglasi(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    oglasi = (
        db.query(SQLAlchemyOglas)
        .filter(SQLAlchemyOglas.statusOglasa != 'prodat')
        .offset(skip)
        .limit(limit)
        .all()
    )
    return oglasi

@router.get("/oglasi/active/", response_model=list[Oglas])
def read_active_oglasi(db: Session = Depends(get_db)):
    oglasi = db.query(SQLAlchemyOglas).filter(
        SQLAlchemyOglas.statusOglasa.in_(['standardniOglas', 'istaknutiOglas']),
        SQLAlchemyOglas.datumIsteka >= db.func.current_date()
    ).all()
    return oglasi

@router.get("/oglasi/my/active", response_model=list[MyAdResponse])
def read_my_active_oglasi(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    active_statuses = ['standardniOglas', 'istaknutiOglas', 'aktivan']
    oglasi = (
        db.query(SQLAlchemyOglas)
        .join(SQLAlchemyVozilo, SQLAlchemyOglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter(
            SQLAlchemyOglas.korisnikID == current_user.id,
            SQLAlchemyOglas.statusOglasa.in_(active_statuses),
            or_(
                SQLAlchemyOglas.datumIsteka == None,
                SQLAlchemyOglas.datumIsteka >= today
            )
        )
        .all()
    )

    return [
        MyAdResponse(
            oglas=Oglas.model_validate(oglas),
            vozilo=Vozilo.model_validate(oglas.vozilo)
        )
        for oglas in oglasi
    ]


@router.get("/oglasi/my/sold", response_model=list[MyAdResponse])
def read_my_sold_oglasi(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    oglasi = (
        db.query(SQLAlchemyOglas)
        .join(SQLAlchemyVozilo, SQLAlchemyOglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter(
            SQLAlchemyOglas.statusOglasa == 'prodat',
            SQLAlchemyOglas.korisnikID == current_user.id
        )
        .all()
    )

    return [
        MyAdResponse(
            oglas=Oglas.model_validate(oglas),
            vozilo=Vozilo.model_validate(oglas.vozilo)
        )
        for oglas in oglasi
    ]

@router.put("/oglasi/{oglas_id}", response_model=Oglas)
def update_oglas(oglas_id: int, updated_oglas: OglasUpdate, db: Session = Depends(get_db)):
    oglas = db.query(SQLAlchemyOglas).filter(SQLAlchemyOglas.oglasID == oglas_id).first()
    if oglas is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    for field, value in updated_oglas.model_dump().items():
        setattr(oglas, field, value)
    db.commit()
    db.refresh(oglas)
    return oglas

@router.delete("/oglasi/{oglas_id}")
def delete_oglas(oglas_id: int, db: Session = Depends(get_db)):
    oglas = db.query(SQLAlchemyOglas).filter(SQLAlchemyOglas.oglasID == oglas_id).first()
    if oglas is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    db.delete(oglas)
    db.commit()
    return {"message": "Advertisement deleted successfully"}

@router.post("/oglasi/{oglas_id}/feature", response_model=Oglas)
async def feature_oglas(
    oglas_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # You'll need to implement this dependency
):
    # Get the ad
    oglas = db.query(SQLAlchemyOglas).filter(SQLAlchemyOglas.oglasID == oglas_id).first()
    if not oglas:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    # Check if the current user is the owner of the ad
    if oglas.korisnikID != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to feature this ad")
    
    # Check if the ad is already featured
    if oglas.statusOglasa == 'istaknutiOglas':
        raise HTTPException(status_code=400, detail="This ad is already featured")
    
    # Calculate expiration date (30 days from now)
    expiration_date = date.today() + timedelta(days=30)
    
    # Create a payment record
    payment = Uplata(
        fromUserID=current_user.id,
        toUserID=1,  # Admin/System account ID
        toOglasID=oglas.oglasID,
        datumUplate=datetime.now(),
        iznos=30.00,  # 30 EUR for featured ad
        tip='featured_ad',
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    # Update ad status
    oglas.statusOglasa = 'istaknutiOglas'
    oglas.cenaIstaknutogOglasa = 30.00
    oglas.datumIsteka = expiration_date
    oglas.updated_at = datetime.now()
    
    # Save changes
    db.add(payment)
    db.add(oglas)
    db.commit()
    db.refresh(oglas)
    
    return oglas

@router.get("/oglasi/featured/", response_model=list[Oglas])
def get_featured_oglasi(db: Session = Depends(get_db)):
    """Get all currently featured ads"""
    today = date.today()
    return db.query(SQLAlchemyOglas).filter(
        SQLAlchemyOglas.statusOglasa == 'istaknutiOglas',
        SQLAlchemyOglas.datumIsteka >= today
    ).all()


@router.post("/oglasi/{oglas_id}/purchase", response_model=Oglas)
def purchase_oglas(
    oglas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    oglas = (
        db.query(SQLAlchemyOglas)
        .join(SQLAlchemyVozilo, SQLAlchemyOglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter(SQLAlchemyOglas.oglasID == oglas_id)
        .first()
    )

    if not oglas:
        raise HTTPException(status_code=404, detail="Advertisement not found")

    if oglas.korisnikID == current_user.id:
        raise HTTPException(status_code=400, detail="Ne možete kupiti sopstveni oglas")

    if oglas.statusOglasa == 'prodat' or oglas.buyerID is not None:
        raise HTTPException(status_code=400, detail="Ovaj oglas je već prodat")

    vozilo = oglas.vozilo
    if vozilo is None:
        raise HTTPException(status_code=400, detail="Vozilo za ovaj oglas nije pronađeno")

    try:
        today = date.today()
        oglas.statusOglasa = 'prodat'
        oglas.buyerID = current_user.id
        oglas.datumProdaje = today
        oglas.updated_at = datetime.utcnow()

        payment = Uplata(
            fromUserID=current_user.id,
            toUserID=oglas.korisnikID,
            toOglasID=oglas.oglasID,
            datumUplate=datetime.utcnow(),
            iznos=vozilo.cena,
            tip='kupovina',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(payment)
        db.commit()
        db.refresh(oglas)
        return oglas

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Greška prilikom obrade kupovine: {str(e)}")


@router.get("/oglasi/{oglas_id}/sold-detail", response_model=MyAdResponse)
def get_sold_oglas_detail(
    oglas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    oglas = (
        db.query(SQLAlchemyOglas)
        .join(SQLAlchemyVozilo, SQLAlchemyOglas.voziloID == SQLAlchemyVozilo.voziloID)
        .filter(SQLAlchemyOglas.oglasID == oglas_id)
        .first()
    )

    if not oglas or oglas.statusOglasa != 'prodat':
        raise HTTPException(status_code=404, detail="Sold advertisement not found")

    if oglas.korisnikID != current_user.id and oglas.buyerID != current_user.id:
        raise HTTPException(status_code=403, detail="Nemate pristup ovom oglasu")

    return MyAdResponse(
        oglas=Oglas.model_validate(oglas),
        vozilo=Vozilo.model_validate(oglas.vozilo)
    )

@router.get("/oglasi/sold/", response_model=list[Oglas])
def get_sold_oglasi(db: Session = Depends(get_db)):
    """Get all sold ads"""
    return db.query(SQLAlchemyOglas).filter(
        SQLAlchemyOglas.statusOglasa == 'prodat'
    ).all()

@router.get("/oglasi/vozilo/{vozilo_id}/status")
async def get_vozilo_ad_status(vozilo_id: int, db: Session = Depends(get_db)):
    """Get the status of an ad for a specific vehicle"""
    oglas = db.query(SQLAlchemyOglas).filter(
        SQLAlchemyOglas.voziloID == vozilo_id
    ).first()
    
    if not oglas:
        return {
            "has_active_ad": False,
            "status": "no_ad",
            "message": "No ad found for this vehicle"
        }
    
    is_active = (
        oglas.statusOglasa in ['standardniOglas', 'istaknutiOglas'] and
        oglas.datumIsteka >= date.today()
    )
    
    return {
        "has_active_ad": is_active,
        "status": oglas.statusOglasa,
        "expiration_date": oglas.datumIsteka.isoformat() if oglas.datumIsteka else None,
        "is_featured": oglas.statusOglasa == 'istaknutiOglas',
        "ad_id": oglas.oglasID
    }
