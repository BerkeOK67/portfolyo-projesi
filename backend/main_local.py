from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock data - veritabani olmadan test icin
MOCK_PROJECTS = [
    {
        'id': 1,
        'name': 'Kisisel Muhasebe Uygulamasi',
        'description': 'Flask + Firebase ile gelistirilmis kisisel finans yonetim uygulamasi. Gelir/gider takibi, taksit yonetimi ve finansal analiz grafikleri iceriyor.',
        'image_url': 'https://via.placeholder.com/400x250/3498db/ffffff?text=Muhasebe+App',
        'live_url': 'https://example.com/muhasebe',
        'github_url': 'https://github.com/BerkeOK67/muhasebeAPP',
        'technologies': ['Python', 'Flask', 'Firebase', 'JavaScript', 'HTML/CSS']
    },
    {
        'id': 2,
        'name': 'Portfolyo Web Sitesi',
        'description': 'AWS altyapili full-stack portfolyo projesi. React frontend, Flask backend, PostgreSQL veritabani.',
        'image_url': 'https://via.placeholder.com/400x250/2ecc71/ffffff?text=Portfolyo',
        'live_url': 'https://example.com/portfolyo',
        'github_url': 'https://github.com/BerkeOK67/portfolyo-projesi',
        'technologies': ['React', 'Flask', 'PostgreSQL', 'AWS S3', 'AWS RDS']
    },
    {
        'id': 3,
        'name': 'E-Ticaret API',
        'description': 'RESTful API ile gelistirilmis e-ticaret backend sistemi. Urun yonetimi, siparis takibi ve odeme entegrasyonu.',
        'image_url': 'https://via.placeholder.com/400x250/9b59b6/ffffff?text=E-Ticaret+API',
        'live_url': None,
        'github_url': 'https://github.com/BerkeOK67/ecommerce-api',
        'technologies': ['Node.js', 'Express', 'MongoDB', 'JWT', 'Stripe']
    }
]

@app.route('/')
def health_check():
    return {'status': 'ok', 'message': 'Portfolyo API calisiyor (Local Mode)'}

@app.route('/api/projects', methods=['GET'])
def get_all_projects():
    return jsonify(MOCK_PROJECTS)

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = next((p for p in MOCK_PROJECTS if p['id'] == project_id), None)
    if project:
        return jsonify(project)
    return jsonify({'error': 'Proje bulunamadi'}), 404

if __name__ == '__main__':
    print("=" * 50)
    print("Portfolyo API - Local Development Server")
    print("API: http://localhost:5000/api/projects")
    print("=" * 50)
    app.run(debug=True, port=5000)
