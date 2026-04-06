# Portfolyo Projesi

Kisisel portfolyo web sitesi - Projelerimi sergilediklerim, AWS altyapili full-stack uygulama.

Güncel URL : berkeokportfolyo.duckdns.org

## Teknolojiler

### Backend
- Python (Flask)
- PostgreSQL (AWS RDS)
- RESTful API

### Frontend
- React (Vite)
- Modern CSS / Tailwind

### Bulut Servisleri
- AWS S3 (Gorseller + Frontend Hosting)
- AWS RDS (Veritabani)
- AWS App Runner / EC2 (Backend Hosting)

## Klasor Yapisi

```
portfolyo-projesi/
├── backend/
│   ├── controllers/      # API isteklerini isleyen fonksiyonlar
│   ├── models/           # Veritabani tablo yapilari
│   ├── routes/           # API uc noktalari (/api/projects)
│   ├── config/           # Veritabani ve S3 baglanti ayarlari
│   └── main.py           # Ana sunucu dosyasi
├── frontend/
│   ├── public/           # index.html
│   └── src/
│       ├── components/   # ProjeKarti, Header, Footer
│       ├── services/     # API cagri fonksiyonlari
│       └── assets/       # Ikonlar, yerel tasarim dosyalari
└── docs/
    ├── README.md         # Proje aciklamasi
    └── GIT_LOG.md        # Git surec dokumantasyonu
```

## Kurulum

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Lisans

MIT License
