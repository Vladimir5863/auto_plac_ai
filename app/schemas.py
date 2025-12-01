from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, BigInteger, Date, DECIMAL, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    korisnickoIme = Column(String(255))
    email = Column(String(255), nullable=False)
    email_verified_at = Column(DateTime)
    lozinka = Column(String(255), nullable=False)
    brojTelefona = Column(String(255))
    tipKorisnika = Column(String(255))
    remember_token = Column(String(100))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime)

    # Relationships
    oglasi = relationship(
        "Oglas",
        back_populates="user",
        foreign_keys="Oglas.korisnikID",
        primaryjoin="User.id == Oglas.korisnikID"
    )
    uplate_from = relationship("Uplata", foreign_keys="Uplata.fromUserID", back_populates="from_user")
    uplate_to = relationship("Uplata", foreign_keys="Uplata.toUserID", back_populates="to_user")
    izvestaj_oglas = relationship("IzvestajOglas", back_populates="user")
    kupljeni_oglasi = relationship(
        "Oglas",
        foreign_keys="Oglas.buyerID",
        back_populates="buyer",
        primaryjoin="User.id == Oglas.buyerID"
    )

class Vozilo(Base):
    __tablename__ = "vozilo"
    voziloID = Column(Integer, primary_key=True, index=True)
    marka = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    godinaProizvodnje = Column(Integer, nullable=False)
    cena = Column(Float, nullable=False)  # Changed from DECIMAL to Float for compatibility
    tipGoriva = Column(String(255), nullable=False)
    kilometraza = Column(String(255), nullable=False)
    tipKaroserije = Column(String(255), nullable=False)
    snagaMotoraKW = Column(Float, nullable=False)
    stanje = Column(String(255), nullable=False)
    opis = Column(Text, nullable=False)
    slike = Column(Text, nullable=False)  # JSON field
    lokacija = Column(String(255), nullable=False)
    klima = Column(String(255), nullable=False)
    tipMenjaca = Column(String(255), nullable=False)
    ostecenje = Column(Boolean, nullable=False)
    euroNorma = Column(String(255), nullable=False)
    kubikaza = Column(Integer, nullable=False)
    deleted_at = Column(DateTime)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # Note: No direct relationship to users table in schema provided
    # Adding back reference for potential future use
    oglas = relationship("Oglas", back_populates="vozilo")

class Oglas(Base):
    __tablename__ = "oglas"
    oglasID = Column(Integer, primary_key=True, index=True)
    datumKreiranja = Column(Date, nullable=False)
    datumIsteka = Column(Date, nullable=False)
    cenaIstaknutogOglasa = Column(Float)
    voziloID = Column(Integer, ForeignKey("vozilo.voziloID"), nullable=False)
    korisnikID = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyerID = Column(Integer, ForeignKey("users.id"), nullable=True)
    statusOglasa = Column(String(50), nullable=False, default='standardniOglas')
    datumProdaje = Column(Date, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime)

    # Relationships
    vozilo = relationship("Vozilo", back_populates="oglas")
    user = relationship(
        "User",
        back_populates="oglasi",
        foreign_keys=[korisnikID],
        primaryjoin="User.id == Oglas.korisnikID"
    )
    buyer = relationship("User", foreign_keys=[buyerID], back_populates="kupljeni_oglasi")
    uplate = relationship("Uplata", back_populates="oglas")
    izvestaj_oglas = relationship("IzvestajOglas", back_populates="oglas")

class Uplata(Base):
    __tablename__ = "uplata"
    uplataID = Column(Integer, primary_key=True, index=True)
    fromUserID = Column(Integer, ForeignKey("users.id"))
    toUserID = Column(Integer, ForeignKey("users.id"))
    toOglasID = Column(Integer, ForeignKey("oglas.oglasID"))
    datumUplate = Column(DateTime, nullable=False)
    iznos = Column(DECIMAL(12, 2), nullable=False)
    tip = Column(String(20), nullable=False, default='wallet')
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

    # Relationships
    from_user = relationship("User", foreign_keys=[fromUserID], back_populates="uplate_from")
    to_user = relationship("User", foreign_keys=[toUserID], back_populates="uplate_to")
    oglas = relationship("Oglas", back_populates="uplate")

class Izvestaj(Base):
    __tablename__ = "izvestaj"
    izvestajID = Column(Integer, primary_key=True, index=True)
    brojUplata = Column(Integer, nullable=False)
    datumOd = Column(Date, nullable=False)
    datumDo = Column(Date, nullable=False)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    deleted_at = Column(DateTime)

    # Relationships
    izvestaj_oglas = relationship("IzvestajOglas", back_populates="izvestaj")

class IzvestajOglas(Base):
    __tablename__ = "izvestaj_oglas"
    id = Column(Integer, primary_key=True, index=True)
    izvestajID = Column(Integer, ForeignKey("izvestaj.izvestajID"), nullable=False)
    oglasID = Column(Integer, ForeignKey("oglas.oglasID"))
    korisnikID = Column(Integer, ForeignKey("users.id"))
    tip = Column(String(20), nullable=False)
    datumUplate = Column(Date)
    iznos = Column(DECIMAL(12, 2))
    deleted_at = Column(DateTime)

    # Relationships
    izvestaj = relationship("Izvestaj", back_populates="izvestaj_oglas")
    oglas = relationship("Oglas", back_populates="izvestaj_oglas")
    user = relationship("User", back_populates="izvestaj_oglas")
