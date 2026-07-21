
from pathlib import Path
from pydantic_settings import BaseSettings

# Bu dosya core/config.py içinde. Proje kökü bir üst klasör.
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    groq_api_key: str
    jwt_secret_key: str

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

if not ENV_PATH.exists():
    raise FileNotFoundError(
        f".env dosyası bulunamadı: {ENV_PATH}\n"
        f"Bu dosyayı proje kök dizinine (main.py ile aynı yere) koymalısın."
    )