from datetime import datetime, date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from schemas import User as SQLAlchemyUser, Uplata as SQLAlchemyUplata, Oglas as SQLAlchemyOglas
from pydantic_models import User
from app.auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_admin(current_user: SQLAlchemyUser = Depends(get_current_user)) -> SQLAlchemyUser:
    if current_user.tipKorisnika != 'admin':
        raise HTTPException(status_code=403, detail="Pristup dozvoljen samo administratorima")
    return current_user


class PaymentResponse(User.model_construct().__class__):
    pass


from pydantic import BaseModel, EmailStr


class PaymentDTO(BaseModel):
    uplataID: int
    fromUserID: Optional[int]
    toUserID: Optional[int]
    toOglasID: Optional[int]
    datumUplate: datetime
    iznos: float
    tip: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdateAdmin(BaseModel):
    tipKorisnika: Optional[str] = None
    brojTelefona: Optional[str] = None
    email: Optional[EmailStr] = None
    korisnickoIme: Optional[str] = None
    is_active: Optional[bool] = None


class RevenueSummary(BaseModel):
    total_featured_revenue: float
    total_featured_count: int
    total_purchase_volume: float
    total_purchase_count: int


class ReportSummary(BaseModel):
    tip: str
    total_count: int
    total_amount: float


@router.get("/admin/users", response_model=List[User])
def admin_list_users(
    skip: int = 0,
    limit: int = Query(100, le=500),
    include_deleted: bool = False,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    query = db.query(SQLAlchemyUser)
    
    # If not including deleted users, filter them out
    if not include_deleted:
        query = query.filter(SQLAlchemyUser.deleted_at.is_(None))
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    return users


@router.put("/admin/users/{user_id}", response_model=User)
async def admin_update_user(
    user_id: int,
    user_update: UserUpdateAdmin,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    # Find the user (including soft-deleted ones for admin)
    user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    # Update only the provided fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/admin/users/{user_id}/restore", response_model=User)
async def admin_restore_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    # Find the user (including soft-deleted ones)
    user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    if not user.deleted_at:
        raise HTTPException(status_code=400, detail="Korisnik nije obrisan")
    
    # Restore the user
    user.deleted_at = None
    db.commit()
    db.refresh(user)
    
    return user


def parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value).date()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Neispravan format datuma: {value}")


@router.get("/admin/payments", response_model=List[PaymentDTO])
def admin_list_payments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    tip: Optional[str] = None,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    query = db.query(SQLAlchemyUplata)

    start = parse_date(start_date)
    end = parse_date(end_date)

    if start:
        query = query.filter(SQLAlchemyUplata.datumUplate >= datetime.combine(start, datetime.min.time()))
    if end:
        query = query.filter(SQLAlchemyUplata.datumUplate <= datetime.combine(end, datetime.max.time()))
    if tip:
        query = query.filter(SQLAlchemyUplata.tip == tip)

    payments = query.order_by(SQLAlchemyUplata.datumUplate.desc()).all()
    return [PaymentDTO.model_validate(p) for p in payments]


@router.get("/admin/revenue", response_model=RevenueSummary)
def admin_revenue_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    start = parse_date(start_date)
    end = parse_date(end_date)

    def date_filters(query):
        if start:
            query = query.filter(SQLAlchemyUplata.datumUplate >= datetime.combine(start, datetime.min.time()))
        if end:
            query = query.filter(SQLAlchemyUplata.datumUplate <= datetime.combine(end, datetime.max.time()))
        return query

    # Featured revenue (site profit)
    featured_query = date_filters(
        db.query(
            func.coalesce(func.sum(SQLAlchemyUplata.iznos), 0),
            func.count(SQLAlchemyUplata.uplataID)
        ).filter(SQLAlchemyUplata.tip == 'featured_ad')
    )
    featured_sum, featured_count = featured_query.one()

    purchase_query = date_filters(
        db.query(
            func.coalesce(func.sum(SQLAlchemyUplata.iznos), 0),
            func.count(SQLAlchemyUplata.uplataID)
        ).filter(SQLAlchemyUplata.tip == 'kupovina')
    )
    purchase_sum, purchase_count = purchase_query.one()

    return RevenueSummary(
        total_featured_revenue=float(featured_sum or 0),
        total_featured_count=featured_count,
        total_purchase_volume=float(purchase_sum or 0),
        total_purchase_count=purchase_count
    )


@router.get("/admin/reports", response_model=List[ReportSummary])
def admin_reports(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    tip: Optional[str] = None,
    db: Session = Depends(get_db),
    _: SQLAlchemyUser = Depends(ensure_admin)
):
    start = parse_date(start_date)
    end = parse_date(end_date)

    query = db.query(
        SQLAlchemyUplata.tip,
        func.count(SQLAlchemyUplata.uplataID).label('total_count'),
        func.coalesce(func.sum(SQLAlchemyUplata.iznos), 0).label('total_amount')
    )

    if tip:
        query = query.filter(SQLAlchemyUplata.tip == tip)

    if start:
        query = query.filter(SQLAlchemyUplata.datumUplate >= datetime.combine(start, datetime.min.time()))
    if end:
        query = query.filter(SQLAlchemyUplata.datumUplate <= datetime.combine(end, datetime.max.time()))

    results = query.group_by(SQLAlchemyUplata.tip).all()

    return [
        ReportSummary(
            tip=row.tip,
            total_count=row.total_count,
            total_amount=float(row.total_amount or 0)
        )
        for row in results
    ]


class UserPaymentDTO(BaseModel):
    uplataID: int
    toUserID: Optional[int]
    toOglasID: Optional[int]
    datumUplate: datetime
    iznos: float
    tip: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/payments/my", response_model=List[UserPaymentDTO])
def my_payments(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    tip: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_user)
):
    query = db.query(SQLAlchemyUplata).filter(SQLAlchemyUplata.fromUserID == current_user.id)

    start = parse_date(start_date)
    end = parse_date(end_date)

    if start:
        query = query.filter(SQLAlchemyUplata.datumUplate >= datetime.combine(start, datetime.min.time()))
    if end:
        query = query.filter(SQLAlchemyUplata.datumUplate <= datetime.combine(end, datetime.max.time()))
    if tip:
        query = query.filter(SQLAlchemyUplata.tip == tip)

    payments = query.order_by(SQLAlchemyUplata.datumUplate.desc()).all()
    return [UserPaymentDTO.model_validate(p) for p in payments]
