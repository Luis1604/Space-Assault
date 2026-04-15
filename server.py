import os
import sqlite3
import re
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL')
    return conn


def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            score INTEGER NOT NULL,
            wave INTEGER NOT NULL,
            kills INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    ''')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)')
    conn.commit()
    conn.close()


def sanitize_name(name):
    if not name or not isinstance(name, str):
        return 'AAA'
    name = name.strip()
    name = re.sub(r'[^a-zA-Z0-9_\- ]', '', name)
    return name[:15] if name else 'AAA'


# ---- Rutas ----

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/test.html')
def test():
    return send_from_directory('.', 'test.html')


@app.route('/api/score', methods=['POST'])
def save_score():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data'}), 400

    name = sanitize_name(data.get('name'))
    score = data.get('score', 0)
    wave = data.get('wave', 0)
    kills = data.get('kills', 0)

    if not isinstance(score, int) or score < 0:
        return jsonify({'error': 'Invalid score'}), 400
    if not isinstance(wave, int) or wave < 0:
        return jsonify({'error': 'Invalid wave'}), 400

    # Limitar valores razonables
    score = min(score, 9999999)
    wave = min(wave, 999)
    kills = min(max(int(kills), 0), 9999)

    conn = get_db()
    conn.execute(
        'INSERT INTO scores (name, score, wave, kills, created_at) VALUES (?, ?, ?, ?, ?)',
        (name, score, wave, kills, datetime.utcnow().isoformat())
    )
    conn.commit()

    # Obtener posicion en ranking
    row = conn.execute(
        'SELECT COUNT(*) as pos FROM scores WHERE score > ?', (score,)
    ).fetchone()
    position = row['pos'] + 1

    conn.close()

    return jsonify({
        'ok': True,
        'position': position,
        'name': name,
        'score': score
    })


@app.route('/api/ranking', methods=['GET'])
def get_ranking():
    limit = request.args.get('limit', 10, type=int)
    limit = min(max(limit, 1), 50)

    conn = get_db()
    rows = conn.execute(
        'SELECT name, score, wave, kills, created_at FROM scores ORDER BY score DESC LIMIT ?',
        (limit,)
    ).fetchall()
    conn.close()

    ranking = []
    for i, row in enumerate(rows):
        ranking.append({
            'position': i + 1,
            'name': row['name'],
            'score': row['score'],
            'wave': row['wave'],
            'kills': row['kills'],
            'date': row['created_at'][:10]
        })

    return jsonify({'ranking': ranking})


if __name__ == '__main__':
    init_db()
    print('Space Assault server running on http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
