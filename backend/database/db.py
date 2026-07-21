import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# .env dosyasında DATABASE_URL tanımlıysa onu kullanır,
# tanımlı değilse varsayılan olarak SQLite kullanır.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./therapy.db")

# SQLite için ekstra ayar gerekiyor (aynı anda birden fazla thread erişebilsin diye)
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
