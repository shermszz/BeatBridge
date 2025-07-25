from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, UTC
import os
from dotenv import load_dotenv
import requests
import json as _json

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
cors = CORS()

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
JWT_EXPIRATION_DELTA = timedelta(days=1)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)
    google_id = db.Column(db.String(255), unique=True)  # For Google OAuth users

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_verification_token(self):
        token = jwt.encode(
            {'user_id': self.id, 'exp': datetime.now(UTC) + timedelta(days=1)},
            JWT_SECRET_KEY,
            algorithm='HS256'
        )
        self.verification_token = token
        db.session.commit()
        return token

class UserFavorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_name = db.Column(db.String(255), nullable=False)
    artist_name = db.Column(db.String(255), nullable=False)
    album_name = db.Column(db.String(255))
    song_url = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer)
    album_image = db.Column(db.String(255))
    rhythm_complexity = db.Column(db.Integer)
    tempo_rating = db.Column(db.Integer)
    skill_level = db.Column(db.String(50))
    tags = db.Column(db.String(255))  # Comma-separated
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserCustomization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    skill_level = db.Column(db.String(50), nullable=False)
    practice_frequency = db.Column(db.String(50), nullable=False)
    favorite_genres = db.Column(db.String(500), nullable=False)  # Comma-separated
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class JamSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    pattern_json = db.Column(db.Text, nullable=False)  # Store as JSON string
    is_public = db.Column(db.Boolean, default=True)
    instruments_json = db.Column(db.Text)  # Store as JSON string
    time_signature = db.Column(db.String(20))
    note_resolution = db.Column(db.String(20))
    bpm = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///beatbridge.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['LASTFM_API_KEY'] = os.getenv('LASTFM_API_KEY')

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    cors.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    def get_current_user():
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None, jsonify({'error': 'No token provided'}), 401
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            if not user:
                return None, jsonify({'error': 'User not found'}), 404
            return user, None, None
        except jwt.ExpiredSignatureError:
            return None, jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return None, jsonify({'error': 'Invalid token'}), 401

    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        
        if data['password'] != data['confirmation']:
            return jsonify({'error': 'Passwords do not match'}), 400
            
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
            
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
            
        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate verification token
        token = user.generate_verification_token()
        
        # Send verification email
        msg = Message('Verify your email',
                     sender='noreply@beatbridge.com',
                     recipients=[user.email])
        msg.body = f'Click the following link to verify your email: http://localhost:3000/verify/{token}'
        mail.send(msg)
        
        return jsonify({'message': 'User registered successfully'}), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        
        if user and user.check_password(data['password']):
            login_user(user)
            
            # Generate JWT token
            token = jwt.encode(
                {'user_id': user.id, 'exp': datetime.now(UTC) + JWT_EXPIRATION_DELTA},
                JWT_SECRET_KEY,
                algorithm='HS256'
            )
            
            return jsonify({'access_token': token}), 200
            
        return jsonify({'error': 'Invalid username or password'}), 401

    @app.route('/api/verify-email/<token>')
    def verify_email(token):
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user:
                return jsonify({'error': 'Invalid token'}), 400
                
            user.is_verified = True
            db.session.commit()
            
            return jsonify({'message': 'Email verified successfully'}), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 400
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 400

    @app.route('/api/user')
    def get_user():
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
            
        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            return jsonify({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_verified': user.is_verified
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    @app.route('/api/favorites', methods=['POST'])
    def add_favorite():
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        data = request.get_json()
        required_fields = ['song_name', 'artist_name', 'song_url']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        # Check for duplicate
        existing = UserFavorite.query.filter_by(user_id=user.id, song_name=data['song_name'], artist_name=data['artist_name']).first()
        if existing:
            return jsonify({'error': 'Song already in favorites'}), 409
        fav = UserFavorite(
            user_id=user.id,
            song_name=data['song_name'],
            artist_name=data['artist_name'],
            album_name=data.get('album_name'),
            song_url=data['song_url'],
            duration=data.get('duration'),
            album_image=data.get('album_image'),
            rhythm_complexity=data.get('rhythm_complexity'),
            tempo_rating=data.get('tempo_rating'),
            skill_level=data.get('skill_level'),
            tags=','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags')
        )
        db.session.add(fav)
        db.session.commit()
        return jsonify({'id': fav.id}), 200

    @app.route('/api/favorites', methods=['GET'])
    def get_favorites():
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        favorites = UserFavorite.query.filter_by(user_id=user.id).order_by(UserFavorite.created_at.desc()).all()
        return jsonify({'favorites': [
            {
                'id': f.id,
                'song_name': f.song_name,
                'artist_name': f.artist_name,
                'album_name': f.album_name,
                'song_url': f.song_url,
                'duration': f.duration,
                'album_image': f.album_image,
                'rhythm_complexity': f.rhythm_complexity,
                'tempo_rating': f.tempo_rating,
                'skill_level': f.skill_level,
                'tags': f.tags.split(',') if f.tags else [],
                'created_at': f.created_at.isoformat()
            } for f in favorites
        ]}), 200

    @app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
    def remove_favorite(favorite_id):
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        fav = UserFavorite.query.filter_by(id=favorite_id, user_id=user.id).first()
        if not fav:
            return jsonify({'error': 'Favorite not found'}), 404
        db.session.delete(fav)
        db.session.commit()
        return jsonify({'message': 'Song removed from favorites'}), 200

    @app.route('/api/save-customization', methods=['POST'])
    def save_customization():
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        data = request.get_json()
        errors = {}
        if not data.get('skill_level'):
            errors['skill'] = 'Please select your skill level'
        if not data.get('practice_frequency'):
            errors['practice'] = 'Please select your practice frequency'
        if not data.get('favorite_genres') or not isinstance(data.get('favorite_genres'), list) or len(data.get('favorite_genres')) == 0:
            errors['genres'] = 'Please select at least one genre'
        if errors:
            return jsonify({'errors': errors}), 400
        # Update or create customization
        customization = UserCustomization.query.filter_by(user_id=user.id).first()
        if customization:
            customization.skill_level = data['skill_level']
            customization.practice_frequency = data['practice_frequency']
            customization.favorite_genres = ','.join(data['favorite_genres'])
        else:
            customization = UserCustomization(
                user_id=user.id,
                skill_level=data['skill_level'],
                practice_frequency=data['practice_frequency'],
                favorite_genres=','.join(data['favorite_genres'])
            )
            db.session.add(customization)
        db.session.commit()
        return jsonify({'message': 'Customization saved successfully'}), 200

    @app.route('/api/get-customization', methods=['GET'])
    def get_customization():
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        customization = UserCustomization.query.filter_by(user_id=user.id).first()
        if not customization:
            return jsonify({'error': 'No customization found'}), 404
        return jsonify({
            'skill_level': customization.skill_level,
            'practice_frequency': customization.practice_frequency,
            'favorite_genres': customization.favorite_genres.split(',')
        }), 200

    @app.route('/api/genres')
    def get_genres():
        genres = [
            {'id': 'rock', 'name': 'Rock'},
            {'id': 'pop', 'name': 'Pop'},
            {'id': 'hip-hop', 'name': 'Hip Hop'},
            {'id': 'jazz', 'name': 'Jazz'},
            {'id': 'classical', 'name': 'Classical'},
            {'id': 'electronic', 'name': 'Electronic'},
            {'id': 'metal', 'name': 'Metal'},
            {'id': 'indie', 'name': 'Indie'},
            {'id': 'folk', 'name': 'Folk'},
            {'id': 'blues', 'name': 'Blues'}
        ]
        return jsonify({'genres': genres})

    @app.route('/api/recommend-song', methods=['POST'])
    def recommend_song():
        data = request.get_json()
        
        if not isinstance(data.get('genres'), list):
            return jsonify({'error': 'Invalid genre format'}), 400
            
        if not data.get('genres'):
            return jsonify({'error': 'No genres selected'}), 400
            
        try:
            # Get top tracks for the first selected genre
            genre = data['genres'][0]
            response = requests.get(
                'http://ws.audioscrobbler.com/2.0/',
                params={
                    'method': 'tag.gettoptracks',
                    'tag': genre,
                    'api_key': app.config['LASTFM_API_KEY'],
                    'format': 'json',
                    'limit': 50
                }
            )
            
            if response.status_code != 200:
                return jsonify({'error': 'Failed to fetch recommendations'}), 500
                
            tracks = response.json()['tracks']['track']

            if not tracks:
                return jsonify({'error': f'No tracks found for genre: {genre}. Please try another genre or try again later.'}), 404

            # Return a random track from the list
            import random
            track = random.choice(tracks)
            
            return jsonify({
                'recommendation': {
                    'name': track['name'],
                    'artist': track['artist']['name'],
                    'url': track['url']
                }
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/jam-sessions', methods=['POST'])
    def create_jam_session():
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        data = request.get_json()
        title = data.get('title')
        pattern_json = data.get('pattern_json')
        if not title or pattern_json is None:
            return jsonify({'error': 'Title and pattern are required'}), 400
        jam = JamSession(
            user_id=user.id,
            title=title,
            pattern_json=_json.dumps(pattern_json),
            is_public=data.get('is_public', True),
            instruments_json=_json.dumps(data.get('instruments_json')) if data.get('instruments_json') is not None else None,
            time_signature=data.get('time_signature'),
            note_resolution=data.get('note_resolution'),
            bpm=data.get('bpm')
        )
        db.session.add(jam)
        db.session.commit()
        return jsonify({'message': 'Jam session created', 'jam_id': jam.id}), 201

    @app.route('/api/jam-sessions/<int:jam_id>', methods=['PUT'])
    def update_jam_session(jam_id):
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        data = request.get_json()
        jam = JamSession.query.filter_by(id=jam_id, user_id=user.id).first()
        if not jam:
            return jsonify({'error': 'Jam session not found or you do not have permission to update it'}), 404
        title = data.get('title')
        pattern_json = data.get('pattern_json')
        if not title or pattern_json is None:
            return jsonify({'error': 'Title and pattern are required'}), 400
        jam.title = title
        jam.pattern_json = _json.dumps(pattern_json)
        jam.is_public = data.get('is_public', True)
        jam.instruments_json = _json.dumps(data.get('instruments_json')) if data.get('instruments_json') is not None else None
        jam.time_signature = data.get('time_signature')
        jam.note_resolution = data.get('note_resolution')
        jam.bpm = data.get('bpm')
        db.session.commit()
        return jsonify({'message': 'Jam session updated'}), 200

    @app.route('/api/jam-sessions/<int:jam_id>', methods=['GET'])
    def get_jam_session(jam_id):
        jam = JamSession.query.get(jam_id)
        if not jam:
            return jsonify({'error': 'Jam session not found'}), 404
        return jsonify({
            'id': jam.id,
            'user_id': jam.user_id,
            'title': jam.title,
            'pattern_json': _json.loads(jam.pattern_json),
            'is_public': jam.is_public,
            'instruments_json': _json.loads(jam.instruments_json) if jam.instruments_json else None,
            'time_signature': jam.time_signature,
            'note_resolution': jam.note_resolution,
            'bpm': jam.bpm,
            'created_at': jam.created_at.isoformat(),
            'updated_at': jam.updated_at.isoformat() if jam.updated_at else None
        }), 200

    @app.route('/api/jam-sessions/<int:jam_id>', methods=['DELETE'])
    def delete_jam_session(jam_id):
        user, err_resp, err_code = get_current_user()
        if not user:
            return err_resp, err_code
        jam = JamSession.query.filter_by(id=jam_id, user_id=user.id).first()
        if not jam:
            return jsonify({'error': 'Jam session not found or you do not have permission to delete it'}), 404
        db.session.delete(jam)
        db.session.commit()
        return jsonify({'message': 'Jam session deleted successfully'}), 200

    @app.route('/api/jam-sessions/user/<int:user_id>', methods=['GET'])
    def get_user_jam_sessions(user_id):
        jams = JamSession.query.filter_by(user_id=user_id).order_by(JamSession.created_at.desc()).all()
        return jsonify([
            {
                'id': jam.id,
                'user_id': jam.user_id,
                'title': jam.title,
                'pattern_json': _json.loads(jam.pattern_json),
                'is_public': jam.is_public,
                'instruments_json': _json.loads(jam.instruments_json) if jam.instruments_json else None,
                'time_signature': jam.time_signature,
                'note_resolution': jam.note_resolution,
                'bpm': jam.bpm,
                'created_at': jam.created_at.isoformat(),
                'updated_at': jam.updated_at.isoformat() if jam.updated_at else None
            } for jam in jams
        ]), 200

    @app.route('/api/jam-sessions/explore', methods=['GET'])
    def explore_jam_sessions():
        jams = JamSession.query.filter_by(is_public=True).order_by(JamSession.created_at.desc()).all()
        return jsonify([
            {
                'id': jam.id,
                'user_id': jam.user_id,
                'title': jam.title,
                'pattern_json': _json.loads(jam.pattern_json),
                'is_public': jam.is_public,
                'instruments_json': _json.loads(jam.instruments_json) if jam.instruments_json else None,
                'time_signature': jam.time_signature,
                'note_resolution': jam.note_resolution,
                'bpm': jam.bpm,
                'created_at': jam.created_at.isoformat(),
                'updated_at': jam.updated_at.isoformat() if jam.updated_at else None
            } for jam in jams
        ]), 200

    return app 