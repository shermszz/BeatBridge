from flask import Flask, request, session, jsonify, make_response
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from datetime import datetime
from tempfile import mkdtemp

# Configure application
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app,
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Database configuration
if 'DATABASE_PASSWORD' not in os.environ:
    os.environ['DATABASE_PASSWORD'] = input("Enter your PostgreSQL password: ")

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://postgres:{os.environ['DATABASE_PASSWORD']}@localhost/flask_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure session
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = "your-secret-key"
Session(app)

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
    customization = db.relationship('UserCustomization', backref='user', uselist=False)

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
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
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
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route('/api/register', methods=["POST"])
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
        # Create new user
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, email=email, hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        # Log the user in after registration
        login_user(new_user)
        session["user_id"] = new_user.id
        
        return jsonify({"message": "Registration successful", "user_id": new_user.id}), 201
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

    return jsonify({"id": user.id, "username": user.username, "email": user.email}), 200

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

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')