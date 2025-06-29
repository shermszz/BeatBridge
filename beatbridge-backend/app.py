from flask import Flask, request, session, jsonify, make_response, send_from_directory, url_for, redirect
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from datetime import datetime, timedelta
from tempfile import mkdtemp
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
import jwt
import random
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from oauthlib.oauth2 import WebApplicationClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Global configurations
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')  # In production, use environment variable
JWT_EXPIRATION_DELTA = timedelta(hours=24)  # Token expires in 24 hours

# Google OAuth config
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Configure application
app = Flask(__name__)
CORS(app)

# Database configuration
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'flask_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure session
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = os.environ.get('SECRET_KEY', 'your-secret-key')  # Get from environment variable
Session(app)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

# Initialize Flask-Mail
mail = Mail(app)

# Initialize OAuth client
client = WebApplicationClient(GOOGLE_CLIENT_ID) if GOOGLE_CLIENT_ID else None

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Custom unauthorized handler
@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith('/api/'):
        return jsonify({"error": "Unauthorized", "message": "Please log in"}), 401
    return jsonify({"error": "Unauthorized"}), 401

# Database model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hash = db.Column(db.String(200), nullable=False)
    profile_pic_url = db.Column(db.String(255))  # Profile picture URL
    customization = db.relationship('UserCustomization', backref='user', uselist=False)
    is_verified = db.Column(db.Boolean, default=False)  # Track email verification status
    verification_code = db.Column(db.String(6))  # Store temporary verification code
    google_id = db.Column(db.String(100), unique=True)  # For Google OAuth users

    def get_id(self):
        return str(self.id)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def generate_verification_code(self):
        # Generates a random 6-digit code
        self.verification_code = ''.join(random.choices('0123456789', k=6))
        return self.verification_code

    def generate_jwt_token(self):
        # Generates a JWT token for the user
        payload = {
            'user_id': self.id,
            'exp': datetime.utcnow() + JWT_EXPIRATION_DELTA
        }
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')

class UserCustomization(db.Model):
    __tablename__ = 'user_customizations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    skill_level = db.Column(db.String(50), nullable=False)
    practice_frequency = db.Column(db.String(50), nullable=False)
    favorite_genres = db.Column(db.String(500), nullable=False)  # Store as comma-separated string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    return jsonify({"message": "Backend server is running"}), 200

@app.before_request
def before_request_func():
    if request.method == 'OPTIONS':
        response = make_response()
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:3000", "https://your-frontend-domain.vercel.app"]:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@app.after_request
def after_request(response):
    """Ensure responses aren't cached and CORS headers are set"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    
    # Handle CORS for both development and production
    origin = request.headers.get('Origin')
    if origin in ["http://localhost:3000", "https://your-frontend-domain.vercel.app"]:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route("/api/register", methods=["POST", "OPTIONS"])
def register():
    data = request.get_json()
    
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    confirmation = data.get("confirmation")
    
    errors = {}
    
    if not username:
        errors['username'] = "Please provide a username"

    if not email:
        errors['email'] = "Please provide an email address"

    if not password:
        errors['password'] = "Password is required to continue"
    
    if password != confirmation:
        errors['confirmation'] = "Passwords do not match"
    
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Check if username already exists
    if User.query.filter_by(username=username).first():
        errors['username'] = "Username already exists"
        return jsonify({"errors": errors}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        errors['email'] = "Email already exists"
        return jsonify({"errors": errors}), 400
    
    try:
        # Create new user (always unverified initially)
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(
            username=username,
            email=email,
            hash=hashed_password,
            is_verified=False  # Always start as unverified
        )
        db.session.add(new_user)
        db.session.commit()
        
        verification_message = "Please check your email for verification code."
        requires_verification = True
        
        # Try to send verification email
        try:
            if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
                send_verification_email(new_user)
            else:
                # If email is not configured, auto-verify the user
                new_user.is_verified = True
                db.session.commit()
                verification_message = "Email verification is not configured."
                requires_verification = False
        except Exception as e:
            print(f"Email sending error: {str(e)}")
            # If email sending fails, auto-verify the user
            new_user.is_verified = True
            db.session.commit()
            verification_message = "Email verification is not available."
            requires_verification = False
        
        # Log the user in after registration
        login_user(new_user)
        session["user_id"] = new_user.id
        
        return jsonify({
            "message": f"Registration successful. {verification_message}",
            "user_id": new_user.id,
            "requires_verification": requires_verification
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "An error occurred during registration"}), 500

@app.route("/api/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return jsonify({"message": "Please log in"}), 200
        
    try:
        # Get form information
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Ensure username was submitted
        if not username:
            return jsonify({"errors": {"username": "Must provide username"}}), 400

        # Ensure password was submitted
        if not password:
            return jsonify({"errors": {"password": "Must provide password"}}), 400

        # Query database for username
        user = User.query.filter_by(username=username).first()

        # Ensure username exists and password is correct
        if user is None or not check_password_hash(user.hash, password):
            return jsonify({"errors": {"general": "Invalid username and/or password"}}), 401

        # Remember which user has logged in
        login_user(user)
        session["user_id"] = user.id

        return jsonify({"user_id": user.id}), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"errors": {"general": "An error occurred during login"}}), 500

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    try:
        logout_user()
        session.clear()
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"error": "An error occurred during logout"}), 500

@app.route('/api/user', methods=["GET"])
def get_user():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_pic_url": user.profile_pic_url  # Return profile picture URL
    }), 200

@app.route("/api/get-customization", methods=["GET"])
@login_required
def get_customization():
    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "User not authenticated"}), 401
        
        customization = UserCustomization.query.filter_by(user_id=user_id).first()
        if not customization:
            return jsonify({"error": "No customization found"}), 404
        
        return jsonify({
            "skill_level": customization.skill_level,
            "practice_frequency": customization.practice_frequency,
            "favorite_genres": customization.favorite_genres
        }), 200
        
    except Exception as e:
        print(f"Error fetching customization: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/save-customization", methods=["POST"])
@login_required
def save_customization():
    try:
        data = request.get_json()
        errors = {}
        
        # Validate skill level
        if not data.get("skill_level"):
            errors["skill"] = "Please select your skill level"
        
        # Validate practice frequency
        if not data.get("practice_frequency"):
            errors["practice"] = "Please select your practice frequency"
        
        # Validate favorite genres
        if not data.get("favorite_genres") or len(data.get("favorite_genres", [])) == 0:
            errors["genres"] = "Please select at least one genre"
            
        if errors:
            return jsonify({"errors": errors}), 400
            
        # Get current user's ID from session
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "User not authenticated"}), 401
        
        # Update or create customization
        customization = UserCustomization.query.filter_by(user_id=user_id).first()
        if customization:
            customization.skill_level = data["skill_level"]
            customization.practice_frequency = data["practice_frequency"]
            customization.favorite_genres = ','.join(data["favorite_genres"])
        else:
            customization = UserCustomization(
                user_id=user_id,
                skill_level=data["skill_level"],
                practice_frequency=data["practice_frequency"],
                favorite_genres=','.join(data["favorite_genres"])
            )
            db.session.add(customization)
        
        db.session.commit()
        return jsonify({"message": "Customization saved successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error saving customization: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Update user profile
@app.route('/api/update-user', methods=["POST"])
@login_required
def update_user():
    # Get new password, email, and username from request if provided
    data = request.get_json()
    new_username = data.get("username")
    new_email = data.get("email")
    new_password = data.get("password")
    user_id = session.get("user_id")
    errors = {}

    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if username is taken by another user
    if new_username and new_username != user.username:
        if User.query.filter(User.username == new_username, User.id != user_id).first():
            errors["username"] = "Username already exists"
    # Check if email is taken by another user
    if new_email and new_email != user.email:
        if User.query.filter(User.email == new_email, User.id != user_id).first():
            errors["email"] = "Email already exists"

    if errors:
        return jsonify({"errors": errors}), 400

    # Update username if changed and not taken
    if new_username:
        user.username = new_username
    # Update email if changed and not taken
    if new_email:
        user.email = new_email
    # If a new password is provided, hash and update it
    if new_password:
        user.hash = generate_password_hash(new_password, method='pbkdf2:sha256')
    # Update the user in the database with the new information
    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads', 'profile_pics')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-profile-pic', methods=['POST'])
@login_required
def upload_profile_pic():
    if 'profile_pic' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_id = session.get('user_id')
        ext = filename.rsplit('.', 1)[1].lower()
        filename = f"user_{user_id}.{ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        user = User.query.get(user_id)
        user.profile_pic_url = f"/uploads/profile_pics/{filename}"
        db.session.commit()
        return jsonify({'profile_pic_url': user.profile_pic_url}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/uploads/profile_pics/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    verification_code = data.get('verification_code')
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.verification_code != verification_code:
        return jsonify({"error": "Invalid verification code"}), 400

    user.is_verified = True
    user.verification_code = None
    db.session.commit()

    return jsonify({
        "message": "Email verified successfully",
        "token": user.generate_jwt_token()
    }), 200

def send_verification_email(user):
    verification_code = user.generate_verification_code()
    db.session.commit()
    
    msg = Message('Verify your BeatBridge account',
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[user.email])
    
    msg.body = f'''Welcome to BeatBridge!
    
Your verification code is: {verification_code}

Please enter this code to verify your email address.

If you did not create a BeatBridge account, please ignore this email.
'''
    mail.send(msg)

@app.route('/api/google-login')
def google_login():
    # Find out what URL to hit for Google login
    google_provider_cfg = google_requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    # Use library to construct the request for Google login
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return jsonify({"auth_url": request_uri})

@app.route('/api/google-login/callback')
def google_callback():
    # Get authorization code Google sent back
    code = request.args.get("code")
    
    # Find out what URL to hit to get tokens
    google_provider_cfg = google_requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Get tokens
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = google_requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    ).json()

    # Parse the tokens
    id_token_jwt = token_response['id_token']
    
    # Verify the token
    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_jwt, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 401

    google_id = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']
    picture = idinfo.get('picture')

    # Check if user exists
    user = User.query.filter_by(google_id=google_id).first()
    if not user:
        # Create new user
        user = User(
            username=name,
            email=email,
            google_id=google_id,
            profile_pic_url=picture,
            is_verified=True,  # Google users are pre-verified
            hash=generate_password_hash('google-oauth-user')  # Placeholder password
        )
        db.session.add(user)
        db.session.commit()

    # Log in the user
    login_user(user)
    session['user_id'] = user.id

    return jsonify({
        "message": "Google login successful",
        "token": user.generate_jwt_token(),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_pic_url": user.profile_pic_url
        }
    }), 200

# --- Song Recommendation System (Last.fm Integration) ---

# Last.fm API configuration
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY', 'your-lastfm-api-key')  # Get from environment variable
LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/'

# List of popular genres for the frontend genre selection
POPULAR_GENRES = [
    "rock", "pop", "hip-hop", "electronic", "jazz", "classical", "indie", "metal", "country", "blues",
    "reggae", "folk", "punk", "soul", "funk", "disco", "house", "techno", "trance", "k-pop"
]

@app.route('/api/genres', methods=['GET'])
def get_genres():
    """
    Returns a static list of popular genres for the frontend to display.
    """
    genres = [{"id": g, "name": g.title(), "count": ""} for g in POPULAR_GENRES]
    return jsonify({'genres': genres}), 200

@app.route('/api/recommend-song', methods=['POST'])
def recommend_song():
    """Get song recommendations based on genre preferences"""
    try:
        data = request.get_json()
        genres = data.get('genres', [])
        
        if not genres:
            return jsonify({'error': 'Please select at least one genre'}), 400
        

        selected_genre = genres[0]
        
        # Get top tracks for the selected genre from Last.fm
        params = {
            'method': 'tag.gettoptracks',
            'tag': selected_genre,
            'api_key': LASTFM_API_KEY,
            'format': 'json',
            'limit': 50  # Get top 50 tracks
        }
        
        response = requests.get(LASTFM_BASE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        tracks = []
        
        # Build a list of tracks, using .get() for safety in case fields are missing
        if 'tracks' in data and 'track' in data['tracks']:
            for track in data['tracks']['track']:
                tracks.append({
                    'name': track.get('name', 'Unknown'),
                    'artist': track.get('artist', {}).get('name', 'Unknown'),
                    'url': track.get('url', ''),
                    'listeners': track.get('listeners', 0)
                })
        
        if not tracks:
            return jsonify({'error': f'No tracks found for genre: {selected_genre}'}), 404
        
        # Select a random track from the top tracks
        recommended_track = random.choice(tracks)
        
        # Get additional track info including album and tags
        track_params = {
            'method': 'track.getInfo',
            'track': recommended_track['name'],
            'artist': recommended_track['artist'],
            'api_key': LASTFM_API_KEY,
            'format': 'json'
        }
        
        track_response = requests.get(LASTFM_BASE_URL, params=track_params)
        if track_response.status_code == 200:
            track_data = track_response.json()
            if 'track' in track_data:
                track_info = track_data['track']
                recommended_track['album'] = track_info.get('album', {}).get('title', 'Unknown Album')
                recommended_track['duration'] = track_info.get('duration', 'Unknown')
                recommended_track['tags'] = [tag['name'] for tag in track_info.get('toptags', {}).get('tag', [])]
        
        return jsonify({
            'recommendation': recommended_track,
            'selected_genre': selected_genre,
            'message': f"Here's a great {selected_genre} track for you!"
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to get recommendation: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')