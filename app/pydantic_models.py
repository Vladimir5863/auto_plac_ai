from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# Auth models
class UserLogin(BaseModel):
    email: EmailStr
    lozinka: str

class UserRegister(BaseModel):
    korisnickoIme: str
    email: EmailStr
    brojTelefona: str
    lozinka: str
    tipKorisnika: str = "Kupac"

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    korisnickoIme: Optional[str] = None
    email: EmailStr
    brojTelefona: Optional[str] = None
    tipKorisnika: Optional[str] = None

class UserCreate(UserBase):
    lozinka: str

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
    email_verified_at: Optional[datetime] = None
    remember_token: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Vozilo Pydantic models
class VoziloBase(BaseModel):
    marka: str
    model: str
    godinaProizvodnje: int
    cena: float
    tipGoriva: str
    kilometraza: str
    tipKaroserije: str
    snagaMotoraKW: float
    stanje: str
    opis: str
    slike: str  # JSON field
    lokacija: str
    klima: str
    tipMenjaca: str
    ostecenje: bool
    euroNorma: str
    kubikaza: int

class VoziloCreate(VoziloBase):
    pass

class VoziloUpdate(VoziloBase):
    pass

class Vozilo(VoziloBase):
    voziloID: int
    istaknuto: Optional[bool] = None
    isFeatured: Optional[bool] = None
    deleted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Oglas Pydantic models
class OglasBase(BaseModel):
    datumKreiranja: date
    datumIsteka: date
    cenaIstaknutogOglasa: Optional[float] = None
    voziloID: int
    korisnikID: int
    buyerID: Optional[int] = None
    statusOglasa: str = 'standardniOglas'
    datumProdaje: Optional[date] = None

class OglasCreate(OglasBase):
    pass

class OglasUpdate(OglasBase):
    pass

class Oglas(OglasBase):
    oglasID: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
