from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from schemas import User as SQLAlchemyUser
from database import SessionLocal
from pydantic_models import User, UserCreate, UserUpdate, UserLogin, UserRegister, Token
from auth import (
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from datetime import timedelta

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = SQLAlchemyUser(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users/{user_id}", response_model=User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/users/", response_model=list[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(SQLAlchemyUser).offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, updated_user: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in updated_user.model_dump().items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", response_model=User)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: SQLAlchemyUser = Depends(get_current_active_user)
):
    # Only admin or the user themselves can delete the account
    if current_user.id != user_id and current_user.tipKorisnika != 'Admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Niste ovlašćeni za brisanje ovog naloga"
        )
        
    user = db.query(SQLAlchemyUser).filter(
        SQLAlchemyUser.id == user_id,
        SQLAlchemyUser.deleted_at.is_(None)  # Don't allow deleting already deleted users
    ).first()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Korisnik nije pronađen ili je već obrisan"
        )
        
    # Soft delete by setting deleted_at timestamp
    user.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

# Auth routes
@router.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login endpoint that returns JWT token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/register", response_model=User)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    try:
        # Check if user already exists
        db_user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Check if username already exists
        db_user = db.query(SQLAlchemyUser).filter(SQLAlchemyUser.korisnickoIme == user.korisnickoIme).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Username already taken")

        # Create new user
        hashed_password = get_password_hash(user.lozinka)
        db_user = SQLAlchemyUser(
            korisnickoIme=user.korisnickoIme,
            email=user.email,
            brojTelefona=user.brojTelefona,
            tipKorisnika=user.tipKorisnika,
            lozinka=hashed_password,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        print(f"Registration error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print(f"User data: {user.dict()}")
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/auth/me", response_model=User)
async def read_current_user(current_user: SQLAlchemyUser = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user
