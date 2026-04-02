from flask import Flask
from flask_cors import CORS
from routes.projects import projects_bp
from config.database import init_db

app = Flask(__name__)
CORS(app)

# Veritabani baglantisini baslat
init_db(app)

# Route'lari kaydet
app.register_blueprint(projects_bp, url_prefix='/api')

@app.route('/')
def health_check():
    return {'status': 'ok', 'message': 'Portfolyo API calisiyor'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
