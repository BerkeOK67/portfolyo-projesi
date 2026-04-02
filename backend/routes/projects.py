from flask import Blueprint, jsonify, request
from models.project import Project
from config.database import db

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
def get_all_projects():
    """Tum projeleri listele"""
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([project.to_dict() for project in projects])

@projects_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Tek bir projeyi getir"""
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())

@projects_bp.route('/projects', methods=['POST'])
def create_project():
    """Yeni proje olustur"""
    data = request.get_json()
    
    project = Project(
        name=data.get('name'),
        description=data.get('description'),
        image_url=data.get('image_url'),
        live_url=data.get('live_url'),
        github_url=data.get('github_url'),
        technologies=data.get('technologies', [])
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@projects_bp.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Projeyi guncelle"""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    project.image_url = data.get('image_url', project.image_url)
    project.live_url = data.get('live_url', project.live_url)
    project.github_url = data.get('github_url', project.github_url)
    project.technologies = data.get('technologies', project.technologies)
    
    db.session.commit()
    
    return jsonify(project.to_dict())

@projects_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Projeyi sil"""
    project = Project.query.get_or_404(project_id)
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Proje silindi'}), 200
