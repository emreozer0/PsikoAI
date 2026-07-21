from sqlalchemy import Column, Integer, String, Boolean
from database.db import Base


class User(Base):
    __tablename__ = "kullanicilar"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    sifre_hash = Column(String)
    ad = Column(String)
    is_admin = Column(Boolean, default=False)