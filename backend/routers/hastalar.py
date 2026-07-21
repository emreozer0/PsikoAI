from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.hasta import Hasta
from jose import jwt
from routers.auth import get_admin_user
from models.kullanici import User as Kullanici
from core.config import settings


SECRET_KEY = settings.jwt_secret_key
ALGORITHM = "HS256"

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_terapist_id(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")

    email = payload.get("sub")
    from models.kullanici import User
    kullanici = db.query(User).filter(User.email == email).first()

    if not kullanici:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")

    return kullanici.id

@router.get("/")
def getHastalar(terapist_id: int = Depends(get_terapist_id), db: Session = Depends(get_db)):
    return db.query(Hasta).filter(Hasta.terapist_id == terapist_id).all()

@router.get("/{hasta_id}")
def GetHastaBilgi(hasta_id: int, terapist_id: int = Depends(get_terapist_id), db: Session = Depends(get_db)):
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")
    if hasta.terapist_id != terapist_id:
        raise HTTPException(status_code=403, detail="Bu hastaya erişim yetkiniz yok")
    return hasta

@router.post("/")
def hasta_ekle(ad: str, tani: str, terapist_id: int = Depends(get_terapist_id), db: Session = Depends(get_db)):
    yeni_hasta = Hasta(ad=ad, tani=tani, terapist_id=terapist_id)
    db.add(yeni_hasta)
    db.commit()
    db.refresh(yeni_hasta)
    return yeni_hasta

@router.delete("/{hasta_id}")
def hasta_sil(hasta_id: int, terapist_id: int = Depends(get_terapist_id), db: Session = Depends(get_db)):
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")
    if hasta.terapist_id != terapist_id:
        raise HTTPException(status_code=403, detail="Bu hastayı silme yetkiniz yok")
    db.delete(hasta)
    db.commit()
    return {"mesaj": "Hasta silindi"}

@router.put("/{hasta_id}")
def hasta_guncelle(hasta_id: int, ad: str, tani: str, terapist_id: int = Depends(get_terapist_id), db: Session = Depends(get_db)):
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")
    if hasta.terapist_id != terapist_id:
        raise HTTPException(status_code=403, detail="Bu hastayı güncelleme yetkiniz yok")
    hasta.ad = ad
    hasta.tani = tani
    db.commit()
    return hasta

@router.get("/admin/terapist/{terapist_id}")
def admin_terapist_hastalari(
    terapist_id: int,
    admin: Kullanici = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    return db.query(Hasta).filter(Hasta.terapist_id == terapist_id).all()


@router.put("/admin/{hasta_id}/aktar")
def admin_hasta_aktar(
    hasta_id: int,
    yeni_terapist_id: int,
    admin: Kullanici = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")

    yeni_terapist = db.query(Kullanici).filter(Kullanici.id == yeni_terapist_id).first()
    if not yeni_terapist:
        raise HTTPException(status_code=404, detail="Hedef terapist bulunamadı")

    hasta.terapist_id = yeni_terapist_id
    db.commit()
    return {"mesaj": "Hasta aktarıldı"}


@router.delete("/admin/{hasta_id}")
def admin_hasta_sil(
    hasta_id: int,
    admin: Kullanici = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")
    db.delete(hasta)
    db.commit()
    return {"mesaj": "Hasta silindi"}