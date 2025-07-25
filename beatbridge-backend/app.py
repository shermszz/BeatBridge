from flask import Flask, request, session, jsonify, make_response, send_from_directory, url_for, redirect
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os
#Only for local development on http://localhost
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
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
from functools import lru_cache
import time
import json

# Load environment variables from .env file
load_dotenv()

# Global configurations
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')  # In production, use environment variable
JWT_EXPIRATION_DELTA = timedelta(hours=24)  # Token expires in 24 hours

# Google OAuth config
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Add this after loading environment variables
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://beat-bridge-rosy.vercel.app",
    "https://beat-bridge-jianweis-projects-e43daaa5.vercel.app",
    "https://beat-bridge-git-main-jianweis-projects-e43daaa5.vercel.app",
    "https://beatbridge2.netlify.app",  # Add your Netlify domain
    # Add any other Netlify preview/production URLs here
]

# Configure application
app = Flask(__name__)
app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
is_local = os.environ.get("FLASK_ENV") == "development" or os.environ.get("LOCAL_DEV") == "1"
app.config['SESSION_COOKIE_SECURE'] = not is_local
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Use DATABASE_URL if available (Railway), otherwise use individual credentials
if DATABASE_URL:
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')
    DB_NAME = os.environ.get('DB_NAME', 'beatbridge')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"DEBUG: Connecting to database: {app.config.get('SQLALCHEMY_DATABASE_URI')}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure session (keeping for backward compatibility but not using for auth)
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

# JWT Authentication decorator
def jwt_required(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({"error": "Invalid token"}), 401
            
            # Add user_id to request context for use in route handlers
            request.user_id = user_id
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# JWT Authentication decorator with verification requirement
def jwt_verified_required(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            if not user_id:
                return jsonify({"error": "Invalid token"}), 401
            
            # Check if user is verified
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            if not user.is_verified:
                return jsonify({"error": "Email verification required"}), 403
            
            # Add user_id to request context for use in route handlers
            request.user_id = user_id
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# Database model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hash = db.Column(db.String(255), nullable=False)
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

    def set_password(self, password):
        self.hash = generate_password_hash(password, method='pbkdf2:sha256')

class UserCustomization(db.Model):
    __tablename__ = 'user_customizations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    skill_level = db.Column(db.String(50), nullable=False)
    practice_frequency = db.Column(db.String(50), nullable=False)
    favorite_genres = db.Column(db.String(500), nullable=False)  # Store as comma-separated string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    chapter_progress = db.Column(db.Integer, default=1) # New field for chapter progress
    chapter0_page_progress = db.Column(db.Integer, default=1) # New field for chapter 0 page progress

class SharedLoop(db.Model):
    __tablename__ = 'shared_loops'
    id = db.Column(db.Integer, primary_key=True)
    share_id = db.Column(db.String(255), unique=True, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    jam_session_ids = db.Column(db.ARRAY(db.Integer), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.current_timestamp())

# Create tables
def init_db():
    try:
        with app.app_context():
            db.create_all()
            print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise e

# Initialize database tables
init_db()

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
        print(f"OPTIONS request from origin: {origin}")  # Debug log
        if origin in ALLOWED_ORIGINS:
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
    origin = request.headers.get('Origin')
    print(f"After request from origin: {origin}")  # Debug log
    if origin in ALLOWED_ORIGINS:
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
        
        # Only log in and provide token if user is verified
        if new_user.is_verified:
            login_user(new_user)
            session["user_id"] = new_user.id
            token = new_user.generate_jwt_token()
        else:
            token = None
        
        return jsonify({
            "message": f"Registration successful. {verification_message}",
            "user_id": new_user.id,
            "requires_verification": requires_verification,
            "token": token
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

        # Query database for username or email
        user = User.query.filter((User.username == username) | (User.email == username)).first()

        # If user exists and is a Google user, block password login only if hash is the placeholder
        if user and user.google_id and check_password_hash(user.hash, GOOGLE_PLACEHOLDER_PASSWORD):
            return jsonify({"errors": {"general": "This account was created with Google. Please use 'Sign in with Google' to log in or set a password."}}), 403

        # Ensure username exists and password is correct
        if user is None or not check_password_hash(user.hash, password):
            return jsonify({"errors": {"general": "Invalid username and/or password"}}), 401

        # Check if user is verified
        if not user.is_verified:
            return jsonify({"errors": {"general": "Please verify your email before logging in. Check your email for the verification code."}}), 403

        # Remember which user has logged in
        login_user(user)
        session["user_id"] = user.id

        return jsonify({
            "user_id": user.id,
            "token": user.generate_jwt_token()
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"errors": {"general": "An error occurred during login"}}), 500

@app.route("/api/logout", methods=["POST"])
@jwt_required
def logout():
    try:
        # For JWT, we don't need to do anything server-side
        # The client should remove the token
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({"error": "An error occurred during logout"}), 500

@app.route('/api/user', methods=["GET"])
@jwt_required
def get_user():
    user = User.query.get(request.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_pic_url": user.profile_pic_url,  # Return profile picture URL
        "is_verified": user.is_verified  # Return verification status
    }), 200

@app.route("/api/get-customization", methods=["GET"])
@jwt_required
def get_customization():
    try:
        user_id = request.user_id
        
        customization = UserCustomization.query.filter_by(user_id=user_id).first()
        if not customization:
            return jsonify({"error": "No customization found"}), 404
        
        print(f"User ID: {user_id}, Customization: {customization}")
        
        return jsonify({
            "skill_level": customization.skill_level,
            "practice_frequency": customization.practice_frequency,
            "favorite_genres": customization.favorite_genres
        }), 200
        
    except Exception as e:
        print(f"Error fetching customization: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/save-customization", methods=["POST"])
@jwt_verified_required
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
            
        # Get current user's ID from JWT token
        user_id = request.user_id
        
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
@jwt_verified_required
def update_user():
    # Get new password, email, and username from request if provided
    data = request.get_json()
    new_username = data.get("username")
    new_email = data.get("email")
    new_password = data.get("password")
    user_id = request.user_id
    errors = {}

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
@jwt_verified_required
def upload_profile_pic():
    if 'profile_pic' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_id = request.user_id
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

    # Find the user by verification code, not by session
    user = User.query.filter_by(verification_code=verification_code).first()
    if not user:
        return jsonify({"error": "Invalid verification code"}), 400

    user.is_verified = True
    user.verification_code = None
    db.session.commit()
    login_user(user)
    session["user_id"] = user.id

    return jsonify({
        "message": "Email verified successfully",
        "token": user.generate_jwt_token()
    }), 200

@app.route('/api/check-verification-status', methods=['POST'])
def check_verification_status():
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "is_verified": user.is_verified,
        "user_id": user.id
    }), 200



def send_verification_email(user):
    verification_code = user.generate_verification_code() #Generate a verification code for the user
    db.session.commit() #Commit the changes to the database
    
    msg = Message('Verify your BeatBridge account', #Create a message object with the verification code
                  sender=app.config['MAIL_USERNAME'],
                  recipients=[user.email])  #Set the sender and recipients
    
    msg.body = f'''Welcome to BeatBridge!
    
Your verification code is: {verification_code}

Please enter this code to verify your email address.

If you did not create a BeatBridge account, please ignore this email. 
'''
    mail.send(msg) #Send the email

FRONTEND_BASE_URL = os.environ.get('FRONTEND_BASE_URL', 'http://localhost:3000')

@app.route('/api/google-login')
def google_login():
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]
    redirect_uri = url_for('google_callback', _external=True)
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=redirect_uri,
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)

def make_unique_username(desired_name):
    """
    Turn "Sherman Tan" → "ShermanTan", then if that already exists
    try "ShermanTan1", "ShermanTan2", … until it's unique.
    """
    base = desired_name.replace(" ", "")
    candidate = base
    suffix = 1

    while User.query.filter_by(username=candidate).first():
        candidate = f"{base}{suffix}"
        suffix += 1

    return candidate

@app.route('/api/google-login/callback')
def google_callback():
    code = request.args.get("code")
    google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
    token_endpoint = google_provider_cfg["token_endpoint"]
    redirect_uri = url_for('google_callback', _external=True)
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=redirect_uri,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    ).json()
    id_token_jwt = token_response['id_token']
    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_jwt, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError:
        return redirect(f"{FRONTEND_BASE_URL}/login?error=google_auth_failed")
    
    google_id = idinfo['sub']
    email = idinfo['email']
    name = idinfo['name']
    picture = idinfo.get('picture')

    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        # Try to find user by email first
        user = User.query.filter_by(email=email).first()
    if user:
        #If we found their email, link their Google ID to that account
        if not user.google_id:
            user.google_id = google_id
    else:
        # Brand new user, pick a unique username from their name
        unique_username = make_unique_username(name or email.split('@')[0])
        user = User(
            username=unique_username,
            email=email,
            google_id=google_id,
            profile_pic_url=picture,
            is_verified=True,
            hash=generate_password_hash('google-oauth-user')
        )
        db.session.add(user)
    db.session.commit()
    login_user(user)
    token = user.generate_jwt_token()
    return redirect(f"{FRONTEND_BASE_URL}/google-auth-success?token={token}")

# --- Song Recommendation System (Last.fm Integration) ---

# Last.fm API configuration
LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY', 'your-lastfm-api-key')  # Get from environment variable
LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/'

# List of popular genres for the frontend genre selection
POPULAR_GENRES = [
    "rock", "pop", "hip-hop", "electronic", "jazz", "classical", "indie", "metal", "country", "blues",
    "reggae", "folk", "punk", "soul", "funk", "disco", "house", "techno", "trance", "k-pop"
]

GENRE_CACHE = {}
CACHE_DURATION = timedelta(hours=1)
TRACKS_PER_PAGE = 50  # Increased from 20
MAX_PAGES = 3  # Number of pages to cache per genre

def fetch_genre_tracks(genre, page=1):
    """Fetch tracks for a genre from Last.fm with pagination"""
    params = {
        'method': 'tag.gettoptracks',
        'tag': genre,
        'api_key': LASTFM_API_KEY,
        'format': 'json',
        'limit': TRACKS_PER_PAGE,
        'page': page
    }
    response = requests.get(LASTFM_BASE_URL, params=params, timeout=5)
    response.raise_for_status()
    return response.json()

@app.route('/api/genres', methods=['GET'])
def get_genres():
    """
    Returns a static list of popular genres for the frontend genre selection
    """
    genres = [{"id": g, "name": g.title(), "count": ""} for g in POPULAR_GENRES]
    return jsonify({'genres': genres}), 200

@app.route('/api/recommend-song', methods=['POST'])
@jwt_verified_required
def recommend_song():
    """Get song recommendations based on genre preferences and user's skill level"""
    try:
        data = request.get_json()
        genres = data.get('genres', [])
        
        if not genres:
            return jsonify({'error': 'Please select at least one genre'}), 400

        # Get user's skill level
        user_id = request.user_id
        customization = UserCustomization.query.filter_by(user_id=user_id).first()
        skill_level = customization.skill_level if customization else 'First-timer'
        selected_genre = genres[0]
        
        # Get tracks from cache
        cache_key = f"genre_tracks_{selected_genre}"
        try:
            if cache_key not in GENRE_CACHE:
                # If not in cache, fetch first page
                GENRE_CACHE[cache_key] = fetch_genre_tracks(selected_genre)
            
            tracks_data = GENRE_CACHE[cache_key]
            if 'tracks' not in tracks_data or 'track' not in tracks_data['tracks']:
                return jsonify({'error': f'No tracks found for genre: {selected_genre}'}), 404

            # Get all available tracks
            available_tracks = tracks_data['tracks']['track']
            
            # Get recently recommended tracks for this user and genre
            recent_tracks_key = f"recent_tracks_{user_id}_{selected_genre}"
            recent_tracks = GENRE_CACHE.get(recent_tracks_key, set())
            
            # Filter out recently recommended tracks
            fresh_tracks = [t for t in available_tracks if t['url'] not in recent_tracks]
            
            # If we've recommended most tracks, clear the recent tracks
            if len(fresh_tracks) < 5:
                fresh_tracks = available_tracks
                recent_tracks = set()

            # ADD THIS CHECK:
            if not fresh_tracks:
                return jsonify({'error': f'No tracks found for genre: {selected_genre}. Please try another genre or try again later.'}), 404

            # Get a random track from the fresh tracks
            track = random.choice(fresh_tracks)
            
            # Update recent tracks
            recent_tracks.add(track['url'])
            if len(recent_tracks) > len(available_tracks) * 0.7:  # Clear if we've used 70% of tracks
                recent_tracks = {track['url']}
            GENRE_CACHE[recent_tracks_key] = recent_tracks

            # Get additional track info
            try:
                params = {
                    'method': 'track.getInfo',
                    'artist': track['artist']['name'],
                    'track': track['name'],
                    'api_key': LASTFM_API_KEY,
                    'format': 'json'
                }
                track_info = requests.get(LASTFM_BASE_URL, params=params, timeout=2).json()
                if 'track' in track_info:
                    track.update(track_info['track'])
            except Exception as e:
                print(f"Error fetching track details: {str(e)}")

            # Build the recommendation with only verified data
            album_images = track.get('album', {}).get('image', [])
            album_image = next((img['#text'] for img in reversed(album_images) if img['#text']), None)
            if not album_image:
                album_image = track.get('image', [{'#text': None}])[-1].get('#text')

            recommended_track = {
                'name': track.get('name', 'Unknown'),
                'artist': track.get('artist', {}).get('name', 'Unknown'),
                'url': track.get('url', ''),
                'listeners': track.get('listeners', 0),
                'album': track.get('album', {}).get('title', 'Unknown Album'),
                'album_image': album_image,
                'duration': track.get('duration', '180000'),  # Default to 3 minutes if not available
                'tags': track.get('toptags', {}).get('tag', []) or track.get('tags', {}).get('tag', [])
            }

            # Add rhythm complexity and tempo ratings based on skill level and genre
            rhythm_complexity = {
                'First-timer': 1,
                'Beginner': 2,
                'Intermediate': 3,
                'Advanced': 4
            }

            # Adjust tempo rating based on genre
            fast_genres = {'metal', 'punk', 'rock', 'electronic', 'techno', 'house'}
            slow_genres = {'blues', 'jazz', 'classical', 'folk'}
            
            base_tempo = tempo_rating = {
                'First-timer': 1,
                'Beginner': 2,
                'Intermediate': 3,
                'Advanced': 4
            }[skill_level]

            if selected_genre in fast_genres:
                tempo_rating = min(4, base_tempo + 1)
            elif selected_genre in slow_genres:
                tempo_rating = max(1, base_tempo - 1)
            else:
                tempo_rating = base_tempo

            # Add skill level context to the response
            skill_context = {
                'First-timer': 'Perfect for beginners to practice basic rhythms!',
                'Beginner': 'Great for developing your fundamental skills.',
                'Intermediate': 'This song will help you build more advanced techniques.',
                'Advanced': 'A challenging piece to test your drumming mastery!'
            }

            response_data = {
                'recommendation': recommended_track,
                'selected_genre': selected_genre,
                'skill_level': skill_level,
                'skill_context': skill_context.get(skill_level, ''),
                'rhythm_complexity': rhythm_complexity.get(skill_level, 2),
                'tempo_rating': tempo_rating,
                'message': f"Here's a {selected_genre} track matched to your skill level!"
            }

            return jsonify(response_data), 200
            
        except requests.RequestException as e:
            print(f"Debug - Request error: {str(e)}")
            return jsonify({'error': f'Failed to get recommendation: {str(e)}'}), 500
            
    except Exception as e:
        print(f"Debug - Unexpected error: {str(e)}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

# --- User Favorites Management ---

@app.route('/api/favorites', methods=['GET'])
@jwt_verified_required
def get_favorites():
    """Get user's favorite songs"""
    try:
        user_id = request.user_id
        favorites = db.session.execute(text("""
            SELECT 
                id, song_name, artist_name, album_name, song_url, duration,
                album_image, rhythm_complexity, tempo_rating, skill_level, tags,
                created_at
            FROM user_favorites 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC
        """), {"user_id": user_id}).fetchall()
        
        return jsonify({
            "favorites": [{
                "id": f.id,
                "song_name": f.song_name,
                "artist_name": f.artist_name,
                "album_name": f.album_name,
                "song_url": f.song_url,
                "duration": f.duration,
                "album_image": f.album_image,
                "rhythm_complexity": f.rhythm_complexity,
                "tempo_rating": f.tempo_rating,
                "skill_level": f.skill_level,
                "tags": f.tags.split(',') if f.tags else [],
                "created_at": f.created_at.isoformat()
            } for f in favorites]
        }), 200
    except Exception as e:
        print(f"Error fetching favorites: {str(e)}")
        return jsonify({"error": "Failed to fetch favorites"}), 500

@app.route('/api/favorites', methods=['POST'])
@jwt_verified_required
def add_favorite():
    """Add a song to user's favorites"""
    try:
        user_id = request.user_id
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['song_name', 'artist_name', 'song_url']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check if song is already in favorites
        existing = db.session.execute(text("""
            SELECT id FROM user_favorites 
            WHERE user_id = :user_id 
            AND song_name = :song_name 
            AND artist_name = :artist_name
        """), {
            "user_id": user_id,
            "song_name": data['song_name'],
            "artist_name": data['artist_name']
        }).first()
        
        if existing:
            return jsonify({"error": "Song already in favorites"}), 409
            
        # Add to favorites with additional fields
        result = db.session.execute(text("""
            INSERT INTO user_favorites (
                user_id, song_name, artist_name, album_name, song_url, duration,
                album_image, rhythm_complexity, tempo_rating, skill_level, tags
            )
            VALUES (
                :user_id, :song_name, :artist_name, :album_name, :song_url, :duration,
                :album_image, :rhythm_complexity, :tempo_rating, :skill_level, :tags
            )
            RETURNING id
        """), {
            "user_id": user_id,
            "song_name": data['song_name'],
            "artist_name": data['artist_name'],
            "album_name": data.get('album_name'),
            "song_url": data['song_url'],
            "duration": data.get('duration'),
            "album_image": data.get('album_image'),
            "rhythm_complexity": data.get('rhythm_complexity'),
            "tempo_rating": data.get('tempo_rating'),
            "skill_level": data.get('skill_level'),
            "tags": ','.join(str(tag) for tag in data.get('tags', []) if tag)  # Convert tags to strings and filter out None/empty
        })
        
        db.session.commit()
        return jsonify({"message": "Song added to favorites"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding favorite: {str(e)}")
        return jsonify({"error": "Failed to add favorite"}), 500

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
@jwt_verified_required
def remove_favorite(favorite_id):
    """Remove a song from user's favorites"""
    try:
        user_id = request.user_id
        
        # Delete favorite if it belongs to the user
        result = db.session.execute(text("""
            DELETE FROM user_favorites 
            WHERE id = :favorite_id AND user_id = :user_id
            RETURNING id
        """), {
            "favorite_id": favorite_id,
            "user_id": user_id
        }).first()
        
        if not result:
            return jsonify({"error": "Favorite not found"}), 404
            
        db.session.commit()
        return jsonify({"message": "Song removed from favorites"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error removing favorite: {str(e)}")
        return jsonify({"error": "Failed to remove favorite"}), 500

@app.route('/api/jam-sessions', methods=['POST'])
@jwt_verified_required
def create_jam_session():
    data = request.get_json()
    user_id = request.user_id
    title = data.get('title')
    pattern_json = data.get('pattern_json')
    is_public = data.get('is_public', True)
    parent_jam_id = data.get('parent_jam_id')
    instruments_json = data.get('instruments_json')
    time_signature = data.get('time_signature')
    note_resolution = data.get('note_resolution')
    bpm = data.get('bpm')

    if not title or not pattern_json:
        return jsonify({'error': 'Title and pattern are required'}), 400

    # Check for duplicate title for this user
    existing = db.session.execute(text("""
        SELECT id FROM jam_sessions WHERE user_id = :user_id AND title = :title
    """), {'user_id': user_id, 'title': title}).first()
    if existing:
        return jsonify({'error': 'Jam session with this title already exists', 'jam_id': existing.id}), 409

    try:
        print(f"DEBUG: pattern_json: {pattern_json}")
        print(f"DEBUG: instruments_json: {instruments_json}")
        result = db.session.execute(text("""
            INSERT INTO jam_sessions (
                user_id, title, pattern_json, is_public, parent_jam_id,
                instruments_json, time_signature, note_resolution, bpm
            )
            VALUES (
                :user_id, :title, :pattern_json, :is_public, :parent_jam_id,
                :instruments_json, :time_signature, :note_resolution, :bpm
            )
            RETURNING id
        """), {
            'user_id': user_id,
            'title': title,
            'pattern_json': json.dumps(pattern_json),
            'is_public': is_public,
            'parent_jam_id': parent_jam_id,
            'instruments_json': json.dumps(instruments_json) if instruments_json is not None else None,
            'time_signature': time_signature,
            'note_resolution': note_resolution,
            'bpm': bpm
        })
        db.session.commit()
        jam_id = result.fetchone()[0]
        return jsonify({'message': 'Jam session created', 'jam_id': jam_id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating jam session: {str(e)}")
        return jsonify({'error': 'Failed to create jam session'}), 500

# Add PUT endpoint for updating jam session by ID
@app.route('/api/jam-sessions/<int:jam_id>', methods=['PUT'])
@jwt_verified_required
def update_jam_session(jam_id):
    data = request.get_json()
    user_id = request.user_id
    title = data.get('title')
    pattern_json = data.get('pattern_json')
    is_public = data.get('is_public', True)
    parent_jam_id = data.get('parent_jam_id')
    instruments_json = data.get('instruments_json')
    time_signature = data.get('time_signature')
    note_resolution = data.get('note_resolution')
    bpm = data.get('bpm')

    if not title or not pattern_json:
        return jsonify({'error': 'Title and pattern are required'}), 400

    # Check for duplicate title for this user (excluding this jam_id)
    existing = db.session.execute(text("""
        SELECT id FROM jam_sessions WHERE user_id = :user_id AND title = :title AND id != :jam_id
    """), {'user_id': user_id, 'title': title, 'jam_id': jam_id}).first()
    if existing:
        return jsonify({'error': 'Jam session with this title already exists', 'jam_id': existing.id}), 409

    try:
        result = db.session.execute(text("""
            UPDATE jam_sessions SET
                title = :title,
                pattern_json = :pattern_json,
                is_public = :is_public,
                parent_jam_id = :parent_jam_id,
                instruments_json = :instruments_json,
                time_signature = :time_signature,
                note_resolution = :note_resolution,
                bpm = :bpm,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :jam_id AND user_id = :user_id
            RETURNING id
        """), {
            'jam_id': jam_id,
            'user_id': user_id,
            'title': title,
            'pattern_json': json.dumps(pattern_json),
            'is_public': is_public,
            'parent_jam_id': parent_jam_id,
            'instruments_json': json.dumps(instruments_json) if instruments_json is not None else None,
            'time_signature': time_signature,
            'note_resolution': note_resolution,
            'bpm': bpm
        })
        updated = result.fetchone()
        if not updated:
            db.session.rollback()
            return jsonify({'error': 'Jam session not found or you do not have permission to update it'}), 404
        db.session.commit()
        return jsonify({'message': 'Jam session updated', 'jam_id': jam_id}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating jam session: {str(e)}")
        return jsonify({'error': 'Failed to update jam session'}), 500

def safe_json_load(value):
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return []
    elif isinstance(value, list):
        return value
    return []

@app.route('/api/jam-sessions/<int:jam_id>', methods=['GET'])
def get_jam_session(jam_id):
    result = db.session.execute(text("""
        SELECT * FROM jam_sessions WHERE id = :jam_id
    """), {'jam_id': jam_id}).first()
    if not result:
        return jsonify({'error': 'Jam session not found'}), 404
    jam = dict(result._mapping)
    jam['pattern_json'] = safe_json_load(jam.get('pattern_json'))
    jam['instruments_json'] = safe_json_load(jam.get('instruments_json'))
    return jsonify(jam), 200

@app.route('/api/jam-sessions/user/<int:user_id>', methods=['GET'])
def get_user_jam_sessions(user_id):
    try:
        results = db.session.execute(text("""
            SELECT * FROM jam_sessions WHERE user_id = :user_id ORDER BY created_at DESC
        """), {'user_id': user_id}).fetchall()
        jams = []
        for row in results:
            jam = dict(row._mapping)
            jam['pattern_json'] = safe_json_load(jam.get('pattern_json'))
            jam['instruments_json'] = safe_json_load(jam.get('instruments_json'))
            jams.append(jam)
        return jsonify(jams), 200
    except Exception as e:
        print(f"Error fetching jams for user {user_id}: {e}")
        return jsonify({'error': 'Failed to fetch jams'}), 500

@app.route('/api/jam-sessions/explore', methods=['GET'])
def explore_jam_sessions():
    results = db.session.execute(text("""
        SELECT * FROM jam_sessions WHERE is_public = TRUE ORDER BY created_at DESC LIMIT 20
    """)).fetchall()
    jams = []
    for row in results:
        jam = dict(row._mapping)
        try:
            jam['pattern_json'] = jam.get('pattern_json') or []
            jam['instruments_json'] = jam.get('instruments_json') or []
        except (json.JSONDecodeError, TypeError) as e:
            print(f"Error decoding JSON for jam {jam.get('id')}: {e}")
            jam['pattern_json'] = []
            jam['instruments_json'] = []
        jams.append(jam)
    return jsonify(jams), 200

@app.route('/api/jam-sessions/<int:jam_id>', methods=['DELETE'])
@jwt_verified_required
def delete_jam_session(jam_id):
    user_id = request.user_id
    try:
        # Make sure the jam belongs to the user trying to delete it
        result = db.session.execute(text("""
            DELETE FROM jam_sessions
            WHERE id = :jam_id AND user_id = :user_id
            RETURNING id
        """), {'jam_id': jam_id, 'user_id': user_id}).first()

        if not result:
            return jsonify({'error': 'Jam session not found or you do not have permission to delete it'}), 404

        db.session.commit()
        return jsonify({'message': 'Jam session deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting jam session {jam_id}: {e}")
        return jsonify({'error': 'Failed to delete jam session'}), 500

@app.route('/api/chapter-progress', methods=['GET'])
@jwt_verified_required
def get_chapter_progress():
    user_id = request.user_id
    customization = UserCustomization.query.filter_by(user_id=user_id).first()
    progress = customization.chapter_progress if customization and customization.chapter_progress else 1
    chapter0_page = customization.chapter0_page_progress if customization and customization.chapter0_page_progress else 1
    return jsonify({'chapter_progress': progress, 'chapter0_page_progress': chapter0_page}), 200

@app.route('/api/chapter-progress', methods=['POST'])
@jwt_verified_required
def update_chapter_progress():
    user_id = request.user_id
    data = request.get_json()
    new_progress = int(data.get('chapter_progress', 1))
    new_ch0_page = int(data.get('chapter0_page_progress', 1))
    customization = UserCustomization.query.filter_by(user_id=user_id).first()
    if customization:
        if not customization.chapter_progress or new_progress > customization.chapter_progress:
            customization.chapter_progress = new_progress
        if not customization.chapter0_page_progress or new_ch0_page > customization.chapter0_page_progress:
            customization.chapter0_page_progress = new_ch0_page
        db.session.commit()
    return jsonify({
        'success': True,
        'chapter_progress': customization.chapter_progress,
        'chapter0_page_progress': customization.chapter0_page_progress
    }), 200

# --- Shared Loops Endpoints ---

@app.route('/api/shared-loops', methods=['POST'])
@jwt_verified_required
def create_shared_loops():
    """Create a new shared loops link"""
    try:
        data = request.get_json()
        user_id = request.user_id
        jam_session_ids = data.get('jam_session_ids', [])

        if not jam_session_ids:
            return jsonify({'error': 'No loops selected to share'}), 400

        # Verify all jam sessions belong to the user
        for jam_id in jam_session_ids:
            jam = db.session.execute(text("""
                SELECT id FROM jam_sessions WHERE id = :jam_id AND user_id = :user_id
            """), {'jam_id': jam_id, 'user_id': user_id}).first()
            if not jam:
                return jsonify({'error': f'Jam session {jam_id} not found or does not belong to you'}), 404

        # Generate a unique share ID
        share_id = f"{user_id}_{int(time.time())}_{random.randint(1000, 9999)}"

        # Create shared loops record with explicit array casting
        result = db.session.execute(text("""
            INSERT INTO shared_loops (share_id, sender_id, jam_session_ids)
            VALUES (:share_id, :sender_id, :jam_session_ids::integer[])
            RETURNING id
        """), {
            'share_id': share_id,
            'sender_id': user_id,
            'jam_session_ids': jam_session_ids
        })
        db.session.commit()

        return jsonify({'share_id': share_id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating shared loops: {str(e)}")
        return jsonify({'error': 'Failed to create shared loops'}), 500

@app.route('/api/shared-loops/<share_id>', methods=['GET'])
def get_shared_loops(share_id):
    """Get shared loops by share ID"""
    try:
        # Get the shared loops record
        shared = db.session.execute(text("""
            SELECT sl.*, u.username as sender_name
            FROM shared_loops sl
            JOIN users u ON sl.sender_id = u.id
            WHERE sl.share_id = :share_id
        """), {'share_id': share_id}).first()

        if not shared:
            return jsonify({'error': 'Shared loops not found'}), 404

        # Get all the jam sessions
        jams = db.session.execute(text("""
            SELECT * FROM jam_sessions WHERE id = ANY(:jam_ids)
        """), {'jam_ids': shared.jam_session_ids}).fetchall()

        loops = []
        for jam in jams:
            jam_dict = dict(jam._mapping)
            jam_dict['pattern_json'] = safe_json_load(jam_dict.get('pattern_json'))
            jam_dict['instruments_json'] = safe_json_load(jam_dict.get('instruments_json'))
            loops.append(jam_dict)

        return jsonify({
            'sender_name': shared.sender_name,
            'loops': loops
        }), 200

    except Exception as e:
        print(f"Error fetching shared loops: {str(e)}")
        return jsonify({'error': 'Failed to fetch shared loops'}), 500

@app.route('/api/shared-loops/<share_id>/accept', methods=['POST'])
@jwt_verified_required
def accept_shared_loops(share_id):
    """Accept shared loops and add them to user's collection"""
    try:
        user_id = request.user_id

        # Get the shared loops record
        shared = db.session.execute(text("""
            SELECT * FROM shared_loops WHERE share_id = :share_id
        """), {'share_id': share_id}).first()

        if not shared:
            return jsonify({'error': 'Shared loops not found'}), 404

        # Get all the original jam sessions
        jams = db.session.execute(text("""
            SELECT * FROM jam_sessions WHERE id = ANY(:jam_ids)
        """), {'jam_ids': shared.jam_session_ids}).fetchall()

        # Create copies of the jam sessions for the recipient
        for jam in jams:
            # Check for title conflicts
            base_title = jam.title
            counter = 1
            while True:
                title = f"{base_title}{' ' + str(counter) if counter > 1 else ''}"
                existing = db.session.execute(text("""
                    SELECT id FROM jam_sessions WHERE user_id = :user_id AND title = :title
                """), {'user_id': user_id, 'title': title}).first()
                if not existing:
                    break
                counter += 1

            # Create new jam session
            db.session.execute(text("""
                INSERT INTO jam_sessions (
                    user_id, title, pattern_json, is_public, parent_jam_id,
                    instruments_json, time_signature, note_resolution, bpm
                )
                VALUES (
                    :user_id, :title, :pattern_json, :is_public, :parent_jam_id,
                    :instruments_json, :time_signature, :note_resolution, :bpm
                )
            """), {
                'user_id': user_id,
                'title': title,
                'pattern_json': jam.pattern_json,
                'is_public': jam.is_public,
                'parent_jam_id': jam.id,  # Reference the original jam
                'instruments_json': jam.instruments_json,
                'time_signature': jam.time_signature,
                'note_resolution': jam.note_resolution,
                'bpm': jam.bpm
            })

        # Create notification record
        db.session.execute(text("""
            INSERT INTO shared_loop_notifications (recipient_id, share_id, status)
            VALUES (:recipient_id, :share_id, 'accepted')
        """), {
            'recipient_id': user_id,
            'share_id': share_id
        })

        db.session.commit()
        return jsonify({'message': 'Shared loops accepted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error accepting shared loops: {str(e)}")
        return jsonify({'error': 'Failed to accept shared loops'}), 500

@app.route('/api/shared-loops/<share_id>/reject', methods=['POST'])
@jwt_verified_required
def reject_shared_loops(share_id):
    """Reject shared loops"""
    try:
        user_id = request.user_id

        # Create rejection notification
        db.session.execute(text("""
            INSERT INTO shared_loop_notifications (recipient_id, share_id, status)
            VALUES (:recipient_id, :share_id, 'rejected')
        """), {
            'recipient_id': user_id,
            'share_id': share_id
        })

        db.session.commit()
        return jsonify({'message': 'Shared loops rejected'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error rejecting shared loops: {str(e)}")
        return jsonify({'error': 'Failed to reject shared loops'}), 500

# In-memory store for OTPs (for demo; use persistent store in production)
user_otps = {}

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'This email address does not exist. Try signing up instead.'}), 404
    # Generate OTP
    otp = str(random.randint(100000, 999999))
    user_otps[email] = otp
    # Send OTP email
    msg = Message('Your BeatBridge Password Reset OTP', sender=app.config['MAIL_USERNAME'], recipients=[email])
    msg.body = f'Your OTP for password reset is: {otp}\nIf you did not request this, please ignore this email.'
    mail.send(msg)
    return jsonify({'message': 'OTP sent to your email.'}), 200

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400
    if user_otps.get(email) == otp:
        # Mark OTP as verified (could set a flag or just allow password reset)
        user_otps[email] = 'VERIFIED'
        return jsonify({'message': 'OTP verified. You may now reset your password.'}), 200
    else:
        return jsonify({'error': 'Invalid OTP'}), 400

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    new_password = data.get('password')
    if not email or not new_password:
        return jsonify({'error': 'Email and new password are required'}), 400
    if user_otps.get(email) != 'VERIFIED':
        return jsonify({'error': 'OTP not verified for this email.'}), 403
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.set_password(new_password)
    db.session.commit()
    # Clear OTP after successful reset
    user_otps.pop(email, None)
    return jsonify({'message': 'Password reset successful.'}), 200

@app.route('/api/set-password', methods=['POST'])
@jwt_required
def set_password():
    data = request.get_json()
    new_password = data.get('password')
    if not new_password:
        return jsonify({'error': 'Password is required.'}), 400
    user = User.query.get(request.user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    user.hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'message': 'Password set successfully.'}), 200

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')