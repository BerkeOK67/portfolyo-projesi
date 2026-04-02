from config.database import db
from datetime import datetime

class Project(db.Model):
    """Proje modeli - Portfolyodaki projeleri temsil eder"""
    
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))  # S3 gorsel linki
    live_url = db.Column(db.String(500))   # Canli site linki
    github_url = db.Column(db.String(500)) # GitHub repo linki
    technologies = db.Column(db.ARRAY(db.String))  # Kullanilan teknolojiler
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Projeyi dictionary formatina cevirir (JSON icin)"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'image_url': self.image_url,
            'live_url': self.live_url,
            'github_url': self.github_url,
            'technologies': self.technologies or [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
