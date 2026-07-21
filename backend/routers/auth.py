from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from models.kullanici import User as Kullanici
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import re
from core.config import settings

router = APIRouter()
SECRET_KEY = settings.jwt_secret_key
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def token_olustur(email: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def sifre_kontrol(sifre: str):
    if len(sifre) < 8:
        raise HTTPException(status_code=400, detail="Şifre en az 8 karakter olmalı")
    if not re.search(r'[A-Z]', sifre):
        raise HTTPException(status_code=400, detail="Şifre en az bir büyük harf içermeli")
    if not re.search(r'[a-z]', sifre):
        raise HTTPException(status_code=400, detail="Şifre en az bir küçük harf içermeli")
    if not re.search(r'[0-9]', sifre):
        raise HTTPException(status_code=400, detail="Şifre en az bir rakam içermeli")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', sifre):
        raise HTTPException(status_code=400, detail="Şifre en az bir özel karakter içermeli (!@#$%^&* vb.)")


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz veya süresi dolmuş token")

    email = payload.get("sub")
    kullanici = db.query(Kullanici).filter(Kullanici.email == email).first()
    if not kullanici:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    return kullanici


def get_admin_user(current_user: Kullanici = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Bu işlem için admin yetkisi gerekli")
    return current_user


@router.post("/kayit")
def kayit(
    email: str,
    sifre: str,
    ad: str,
    is_admin: bool = False,
    admin: Kullanici = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    sifre_kontrol(sifre)
    var_mi = db.query(Kullanici).filter(Kullanici.email == email).first()
    if var_mi:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    yeni = Kullanici(
        email=email,
        sifre_hash=pwd_context.hash(sifre),
        ad=ad,
        is_admin=is_admin
    )
    db.add(yeni)
    db.commit()
    return {"mesaj": "Kayıt başarılı"}


@router.get("/terapistler")
def terapistleri_listele(db: Session = Depends(get_db)):
    terapistler = db.query(Kullanici).all()
    return [{"id": t.id, "ad": t.ad, "email": t.email, "is_admin": t.is_admin} for t in terapistler]


@router.post("/giris")
def giris(email: str, sifre: str, db: Session = Depends(get_db)):
    kullanici = db.query(Kullanici).filter(Kullanici.email == email).first()
    if not kullanici or not pwd_context.verify(sifre, kullanici.sifre_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre yanlış")
    token = token_olustur(kullanici.email)
    return {"token": token, "ad": kullanici.ad, "is_admin": kullanici.is_admin}


@router.delete("/terapist/{terapist_id}")
def terapist_sil(
    terapist_id: int,
    admin: Kullanici = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    from models.hasta import Hasta

    if terapist_id == admin.id:
        raise HTTPException(status_code=400, detail="Kendi hesabınızı silemezsiniz")

    terapist = db.query(Kullanici).filter(Kullanici.id == terapist_id).first()
    if not terapist:
        raise HTTPException(status_code=404, detail="Terapist bulunamadı")

    hasta_sayisi = db.query(Hasta).filter(Hasta.terapist_id == terapist_id).count()
    if hasta_sayisi > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Bu terapistin {hasta_sayisi} hastası var. Önce hastaları başka bir terapiste aktarın veya silin."
        )

    db.delete(terapist)
    db.commit()
    return {"mesaj": "Terapist silindi"}