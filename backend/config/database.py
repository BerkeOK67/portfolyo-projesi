import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def get_database_url():
    """DATABASE_URL ortam degiskenini SQLAlchemy formatinda dondurur (yoksa None)"""
    url = os.getenv('DATABASE_URL')
    if url and url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
    return url

def init_db(app):
    """Veritabani baglantisini yapilandirir. DATABASE_URL yoksa False dondurur."""
    url = get_database_url()
    if not url:
        return False

    app.config['SQLALCHEMY_DATABASE_URI'] = url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'pool_pre_ping': True}

    db.init_app(app)

    with app.app_context():
        db.create_all()

    return True
