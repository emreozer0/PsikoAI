from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import hastalar
from routers import seans as seans_router
from database.db import Base, engine
from models import hasta
from models import seans as seans_model
from routers import transkripsiyon
from routers import analiz as analiz_router
from routers import auth 
from models import kullanici
from models import analiz



Base.metadata.create_all(bind=engine)

app = FastAPI(
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hastalar.router, prefix="/hastalar")
app.include_router(seans_router.router, prefix="/seans")
app.include_router(transkripsiyon.router, prefix="/transkripsiyon")
app.include_router(analiz_router.router, prefix="/analiz")
app.include_router(auth.router, prefix="/auth")
