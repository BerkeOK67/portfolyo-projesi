import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, redirect, request, send_from_directory
from flask_cors import CORS
from werkzeug.security import safe_join

from config.database import init_db

load_dotenv()

PUBLIC_DIR = (Path(__file__).resolve().parent.parent / 'frontend' / 'public').resolve()

# Bu dosyalardaki {{SITE_URL}} yer tutucusu istek aninda sitenin adresiyle degistirilir
TEMPLATED_FILES = {'index.html', 'sitemap.xml', 'robots.txt'}

app = Flask(__name__, static_folder=None)
CORS(app, resources={r'/api/*': {'origins': os.getenv('CORS_ORIGINS', '*')}})

db_enabled = init_db(app)
if db_enabled:
    from routes.projects import projects_bp
    app.register_blueprint(projects_bp, url_prefix='/api')


def site_url():
    """Sitenin kok adresi. Render'da RENDER_EXTERNAL_URL otomatik tanimlidir."""
    url = os.getenv('SITE_URL') or os.getenv('RENDER_EXTERNAL_URL') or request.url_root
    return url.rstrip('/')


def serve_public_file(rel_path):
    if rel_path in TEMPLATED_FILES:
        mimetypes = {'.html': 'text/html', '.xml': 'application/xml', '.txt': 'text/plain'}
        content = (PUBLIC_DIR / rel_path).read_text(encoding='utf-8')
        content = content.replace('{{SITE_URL}}', site_url())
        return Response(content, mimetype=mimetypes[Path(rel_path).suffix])
    return send_from_directory(PUBLIC_DIR, rel_path)


def is_public_file(rel_path):
    full = safe_join(str(PUBLIC_DIR), rel_path)
    return full is not None and os.path.isfile(full)


@app.route('/healthz')
def health_check():
    return {'status': 'ok', 'database': db_enabled}


@app.route('/api/<path:_path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_not_found(_path):
    return jsonify({'error': 'API endpoint bulunamadi'}), 404


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Uzantisiz URL destegi: /projeler -> projeler.html, /admin -> admin/index.html
    clean = path.strip('/')

    if clean and is_public_file(clean):
        return serve_public_file(clean)

    if clean and is_public_file(f'{clean}.html'):
        return serve_public_file(f'{clean}.html')

    index_rel = f'{clean}/index.html' if clean else 'index.html'
    if is_public_file(index_rel):
        if clean and not path.endswith('/'):
            query = request.query_string.decode()
            return redirect(f'/{clean}/' + (f'?{query}' if query else ''), code=301)
        return serve_public_file(index_rel)

    return serve_public_file('index.html'), 404


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG') == '1',
    )
