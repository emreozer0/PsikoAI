from sqlalchemy import Column, Integer, String
from database.db import Base


class Hasta(Base):
    __tablename__ = "hastalar"

    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String)
    tani = Column(String)
    terapist_id = Column(Integer)