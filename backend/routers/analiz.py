import json
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.db import SessionLocal
from models.analiz import Analiz
from models.hasta import Hasta
from routers.hastalar import get_terapist_id
from services.ai_analysis import analyze_session

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_hasta_or_403(hasta_id: int, terapist_id: int, db: Session) -> Hasta:
    hasta = db.query(Hasta).filter(Hasta.id == hasta_id).first()
    if not hasta:
        raise HTTPException(status_code=404, detail="Hasta bulunamadı")
    if hasta.terapist_id != terapist_id:
        raise HTTPException(status_code=403, detail="Bu hastaya erişim yetkiniz yok")
    return hasta


class FormulasyonRequest(BaseModel):
    hasta_id: int
    transkript: str
    seans_no: int = 1
    seans_tarihi: str = ""


@router.post("/formulasyon")
def formulasyon_olustur(
    istek: FormulasyonRequest,
    terapist_id: int = Depends(get_terapist_id),
    db: Session = Depends(get_db),
):
    get_hasta_or_403(istek.hasta_id, terapist_id, db)

    # 1. Bu hastanın en son ONAYLANMIŞ formülasyonunu DB'den çek.
    onceki_kayit = (
        db.query(Analiz)
        .filter(Analiz.hasta_id == istek.hasta_id, Analiz.durum == "onaylandı")
        .order_by(Analiz.tarih.desc())
        .first()
    )
    onceki_formulasyon = None
    if onceki_kayit and onceki_kayit.analiz_metni:
        try:
            onceki_formulasyon = json.loads(onceki_kayit.analiz_metni)
        except json.JSONDecodeError:
            onceki_formulasyon = None

    # 2. AI analizini çalıştır
    try:
        sonuc = analyze_session(
            transkript=istek.transkript,
            onceki_formulasyon=onceki_formulasyon,
            seans_no=istek.seans_no,
            seans_tarihi=istek.seans_tarihi,
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI analizi başarısız: {e}")

    # 3. Sonucu "beklemede" durumuyla DB'ye kaydet.
    yeni_kayit = Analiz(
        hasta_id=istek.hasta_id,
        seans_no=istek.seans_no,
        transkript=istek.transkript,
        analiz_metni=json.dumps(sonuc.model_dump(mode="json"), ensure_ascii=False),
        durum="beklemede",
        tarih=datetime.now(),
    )
    db.add(yeni_kayit)
    db.commit()
    db.refresh(yeni_kayit)

    return {
        "id": yeni_kayit.id,
        "durum": yeni_kayit.durum,
        "analiz": sonuc.model_dump(mode="json"),
    }


@router.patch("/{analiz_id}/onayla")
def formulasyonu_onayla(
    analiz_id: int,
    terapist_id: int = Depends(get_terapist_id),
    db: Session = Depends(get_db),
):
    kayit = db.query(Analiz).filter(Analiz.id == analiz_id).first()
    if not kayit:
        raise HTTPException(status_code=404, detail="Analiz kaydı bulunamadı")
    get_hasta_or_403(kayit.hasta_id, terapist_id, db)
    kayit.durum = "onaylandı"
    db.commit()
    return {"id": kayit.id, "durum": kayit.durum}


@router.patch("/{analiz_id}/reddet")
def formulasyonu_reddet(
    analiz_id: int,
    terapist_id: int = Depends(get_terapist_id),
    db: Session = Depends(get_db),
):
    kayit = db.query(Analiz).filter(Analiz.id == analiz_id).first()
    if not kayit:
        raise HTTPException(status_code=404, detail="Analiz kaydı bulunamadı")
    get_hasta_or_403(kayit.hasta_id, terapist_id, db)
    kayit.durum = "reddedildi"
    db.commit()
    return {"id": kayit.id, "durum": kayit.durum}


@router.get("/hasta/{hasta_id}")
def hastanin_analizleri(
    hasta_id: int,
    terapist_id: int = Depends(get_terapist_id),
    db: Session = Depends(get_db),
):
    get_hasta_or_403(hasta_id, terapist_id, db)

    kayitlar = (
        db.query(Analiz)
        .filter(Analiz.hasta_id == hasta_id)
        .order_by(Analiz.tarih.desc())
        .all()
    )
    return [
        {
            "id": k.id,
            "seans_no": k.seans_no,
            "durum": k.durum,
            "tarih": k.tarih,
            "analiz": json.loads(k.analiz_metni) if k.analiz_metni else None,
        }
        for k in kayitlar
    ]