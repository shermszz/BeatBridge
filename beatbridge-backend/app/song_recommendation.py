from flask import Blueprint, request, jsonify, current_app
from flask import g
import requests
import os
from sqlalchemy import text
from app_factory import create_app

song_recommendation_bp = Blueprint('song_recommendation', __name__)

# BPM Ranges for skill levels
BPM_RANGES = {
    1: (0, 80),      # First timer
    2: (80, 110),    # Beginner
    3: (110, 140),   # Intermediate
    4: (140, 300),   # Advanced (upper bound arbitrary)
}

# Helper to get DB connection

def get_db():
    if 'db' not in g:
        g.db = current_app.config['DB_CONN']
    return g.db

@song_recommendation_bp.route('/api/recommend-song', methods=['GET'])
def recommend_song():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400

    # 1. Get user skill level
    db = get_db()
    skill_query = text('SELECT skill_level FROM users_customisation WHERE user_id = :user_id')
    result = db.execute(skill_query, {'user_id': user_id}).fetchone()
    if not result:
        return jsonify({'error': 'User not found or no skill level set'}), 404
    skill_level = int(result[0])
    bpm_min, bpm_max = BPM_RANGES.get(skill_level, (0, 300))

    # 2. Fetch songs from Last.fm
    lastfm_api_key = os.environ.get('LASTFM_API_KEY')
    if not lastfm_api_key:
        return jsonify({'error': 'Last.fm API key not set'}), 500
    lastfm_url = f'https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key={lastfm_api_key}&format=json&limit=20'
    lastfm_resp = requests.get(lastfm_url)
    if lastfm_resp.status_code != 200:
        return jsonify({'error': 'Failed to fetch songs from Last.fm'}), 500
    tracks = lastfm_resp.json().get('tracks', {}).get('track', [])

    # 3. For each song, get BPM from getSongBPM
    songbpm_api_key = os.environ.get('GETSONGBPM_API_KEY')
    if not songbpm_api_key:
        return jsonify({'error': 'getSongBPM API key not set'}), 500
    candidates = []
    for track in tracks:
        artist = track.get('artist', {}).get('name')
        title = track.get('name')
        if not artist or not title:
            continue
        # getSongBPM API
        songbpm_url = f'https://api.getsongbpm.com/search/?api_key={songbpm_api_key}&type=song&lookup={title} {artist}'
        bpm_resp = requests.get(songbpm_url)
        if bpm_resp.status_code != 200:
            continue
        bpm_data = bpm_resp.json().get('search', [])
        if not bpm_data:
            continue
        bpm = bpm_data[0].get('bpm')
        try:
            bpm = float(bpm)
        except (TypeError, ValueError):
            continue
        if bpm_min <= bpm < bpm_max:
            candidates.append({
                'title': title,
                'artist': artist,
                'bpm': bpm,
                'url': track.get('url'),
            })
    if not candidates:
        return jsonify({'error': 'No suitable song found for your skill level.'}), 404
    import random
    song = random.choice(candidates)
    return jsonify({'song': song}) 