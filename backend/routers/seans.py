import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.seans import Seans
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/oda-olustur")
def oda_olustur(hasta_id: int, db: Session = Depends(get_db)):
    oda_adi = str(uuid.uuid4())
    url = f"https://meet.jit.si/{oda_adi}"
    yeni_seans = Seans(hastaid=hasta_id, odaurl=url, tarih=datetime.now())
    db.add(yeni_seans)
    db.commit()
    db.refresh(yeni_seans)
    return yeni_seans

@router.get("/")
def getSeanslar(db: Session = Depends(get_db)):
    return db.query(Seans).all()