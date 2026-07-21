from sqlalchemy import Column, Integer, String, DateTime
from database.db import Base

class Seans(Base):
    __tablename__ = "gorusmeler"

    id = Column(Integer, primary_key=True, index=True)
    hastaid = Column(Integer)
    tarih = Column(DateTime)
    odaurl = Column(String)