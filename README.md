# PsikoAI

PsikoAI, terapistlerin danışan seanslarını kaydetmesine, yapay zeka destekli analiz 
ve formülasyon raporları oluşturmasına, hasta geçmişini takip etmesine ve seans 
sürecini daha verimli yönetmesine yardımcı olan bir platformdur.

Seans kayıtları otomatik olarak transkribe edilir, AI ile analiz edilerek terapiste 
klinik formülasyon önerileri sunulur — böylece terapistler idari işlere daha az, 
danışanlarına daha çok zaman ayırabilir.

## Özellikler

- 🎙️ Seans kayıtlarının otomatik transkripsiyonu
- 🤖 AI destekli klinik formülasyon ve analiz üretimi
- 👥 Hasta/danışan yönetimi
- 📊 Terapist ve admin panelleri
- 🔐 Güvenli kimlik doğrulama (JWT)

---

## Proje Yapısı

psikoai/
├── backend/ # FastAPI tabanlı API
└── frontend/ # Next.js tabanlı arayüz

## Gereksinimler

- Python 3.10+
- Node.js 18+
- npm

## Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/emreozer0/PsikoAI.git
cd PsikoAI
```

### 2. Backend kurulumu

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Mac/Linux

pip install -r requirements.txt
```

`backend/.env.example` dosyasını kopyalayıp `backend/.env` adıyla kaydedin, içindeki değerleri kendi API anahtarlarınızla doldurun:

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

Backend'i çalıştırın:

```bash
uvicorn main:app --reload
```

API varsayılan olarak `http://localhost:8000` adresinde çalışır.

### 3. Frontend kurulumu

Yeni bir terminal açın:

```bash
cd frontend
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Ortam Değişkenleri

Backend için gerekli anahtarlar `backend/.env.example` dosyasında listelenmiştir:

- `DAILY_API_KEY` — Daily.co video/ses entegrasyonu için
- `GROQ_API_KEY` — Groq AI analiz/transkripsiyon için
- `JWT_SECRET_KEY` — JWT token imzalama için (rastgele, güçlü bir değer olmalı)
- `DATABASE_URL` — (opsiyonel) PostgreSQL kullanmak isteyenler için, tanımlanmazsa SQLite kullanılır

## Veritabanı

Proje varsayılan olarak **SQLite** kullanır (`therapy.db`), ekstra kurulum gerektirmez 
ve geliştirme için idealdir.

### PostgreSQL ile Kullanmak İsteyenler

`.env` dosyasında `DATABASE_URL` tanımlanmazsa otomatik olarak SQLite kullanılır. 
PostgreSQL'e geçmek isterseniz:

1. PostgreSQL sürücüsünü kurun:
```bash
   pip install psycopg2-binary
```
   ve `requirements.txt` dosyasına `psycopg2-binary` satırını ekleyin.

2. Yerel bir PostgreSQL veritabanı oluşturun (Docker ile hızlıca):
```bash
   docker run --name psikoai-db -e POSTGRES_PASSWORD=sifre -e POSTGRES_DB=psikoai -p 5432:5432 -d postgres
```

3. `.env` dosyanıza bağlantı adresini ekleyin:
```dotenv
   DATABASE_URL=postgresql://postgres:sifre@localhost:5432/psikoai
```

Backend'i yeniden başlattığınızda otomatik olarak PostgreSQL kullanılmaya başlar.

## Notlar

- `.venv` ve `node_modules` klasörleri git'e dahil edilmez, kurulum sırasında yukarıdaki adımlarla oluşturulmalıdır.
- `therapy.db` dosyası da git'e dahil edilmez; uygulama ilk çalıştırıldığında otomatik oluşturulur.
