# Git Gelistirme Sureci Dokumantasyonu

Bu dosya, proje gelistirme surecinde yapilan tum adimlari kronolojik olarak icerir.

---

## Asama 1: Temel Kurulum ve Git

### 1.1 Proje Klasor Yapisi Olusturuldu
**Tarih:** 2026-04-02

Olusturulan klasorler:
- `backend/` - Python API katmani
  - `controllers/` - API isteklerini isleyen fonksiyonlar
  - `models/` - Veritabani tablo yapilari
  - `routes/` - API uc noktalari
  - `config/` - Yapilandirma dosyalari
- `frontend/` - React on yuz katmani
  - `public/` - Statik dosyalar
  - `src/components/` - UI parcalari
  - `src/services/` - API servisleri
  - `src/assets/` - Gorseller ve ikonlar
- `docs/` - Dokumantasyon

### 1.2 Git Reposu Baslatildi
**Tarih:** 2026-04-02

```bash
git init
git add .
git commit -m "Initial project structure"
```

### 1.3 GitHub'a Push Edildi
**Tarih:** 2026-04-02

```bash
git remote add origin https://github.com/KULLANICI_ADI/portfolyo-projesi.git
git branch -M main
git push -u origin main
```

---

## Asama 2: Veritabani ve Bulut Depolama (S3)

### 2.1 S3 Bucket Olusturuldu
**Tarih:** [TARIH EKLE]

- Bucket adi: `portfolyo-projesi-images`
- Region: [REGION EKLE]
- Public access: Acik

### 2.2 RDS PostgreSQL Olusturuldu
**Tarih:** [TARIH EKLE]

- Instance: db.t3.micro (Free Tier)
- Veritabani adi: portfolyo_db
- Endpoint: [ENDPOINT EKLE]

---

## Asama 3: Backend Gelistirimi

[DEVAM EDECEK...]

---

## Asama 4: Frontend Gelistirimi

[DEVAM EDECEK...]

---

## Asama 5: Deployment

[DEVAM EDECEK...]
