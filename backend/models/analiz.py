from sqlalchemy import Column, Integer, String, Text, DateTime
from database.db import Base
from datetime import datetime


class Analiz(Base):
    __tablename__ = "analizler"

    id = Column(Integer, primary_key=True, index=True)
    hasta_id = Column(Integer)
    seans_no = Column(Integer, nullable=True)
    transkript = Column(Text)
    analiz_metni = Column(Text)
    # beklemede | onaylandı | reddedildi
    durum = Column(String, default="beklemede")
    tarih = Column(DateTime, default=datetime.now)