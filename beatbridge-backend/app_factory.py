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
    password_hash = db.Column(db.String(128))
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)

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

    # Routes
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

    return app 