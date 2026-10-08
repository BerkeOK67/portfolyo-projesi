# Portfolyo Projesi

Kisisel portfolyo web sitesi. Flask sunucusu sayfalari sunar, icerik (projeler, yazilar, hakkimda, iletisim) Firebase uzerinden yonetilir. Render Web Service olarak yayinlanir.

## Teknolojiler

- **Sunucu:** Python, Flask, Gunicorn
- **Frontend:** HTML, CSS, JavaScript
- **Icerik ve admin paneli:** Firebase Realtime Database, Authentication, Storage
- **Iletisim formu:** EmailJS
- **Istege bagli API:** PostgreSQL + Flask-SQLAlchemy (`/api/projects`)
- **Hosting:** Render (`*.onrender.com`)

## Klasor Yapisi

```
portfolyo-projesi/
├── backend/
│   ├── config/           # Veritabani ayarlari
│   ├── models/           # Veritabani tablo yapilari
│   ├── routes/           # API uc noktalari (/api/projects)
│   ├── main.py           # Flask uygulamasi (sayfalar + API)
│   └── requirements.txt
├── frontend/public/      # HTML/CSS/JS dosyalari ve admin paneli (/admin/)
├── docs/GIT_LOG.md
└── render.yaml           # Render yapilandirmasi
```

## Lokal Calistirma

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Site: http://localhost:5000

`DATABASE_URL` tanimli degilse `/api` devre disi kalir; site Firebase ile calismaya devam eder. Ortam degiskenleri icin `backend/.env.example` dosyasina bakin.

## Render'a Deploy

1. Render panelinde **New > Blueprint** secip bu repoyu baglayin (`render.yaml` okunur).
   Elle kurulum icin **New > Web Service**:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `gunicorn --chdir backend main:app --bind 0.0.0.0:$PORT --workers 2`
   - Health Check Path: `/healthz`
   - Ortam degiskeni: `PYTHON_VERSION=3.12.8`
2. Istege bagli: API icin Render Postgres olusturup `DATABASE_URL` ortam degiskenini ekleyin.
3. Firebase Console > Authentication > Settings > Authorized domains listesine `<servis>.onrender.com` adresini ekleyin.

Canonical, sitemap ve robots adresleri Render'in tanimladigi `RENDER_EXTERNAL_URL` ile otomatik doldurulur.

## Lisans

MIT License
