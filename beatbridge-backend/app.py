from flask import Flask, request, session, jsonify, make_response
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import text
import os

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
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = "your-secret-key-here"
Session(app)

# Database model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    hash = db.Column(db.String(200), nullable=False)

# Create tables
with app.app_context():
    db.create_all()

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
    
    # Create new user
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "Registration successful"}), 201

@app.route('/api/login', methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    errors = {}
    
    if not username:
        errors['username'] = "Please enter your username"
    
    if not password:
        errors['password'] = "Please enter your password"
    
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Verify user credentials
    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.hash, password):
        errors['general'] = "Invalid username or password"
        return jsonify({"errors": errors}), 401
    
    # Store user session
    session['user_id'] = user.id
    return jsonify({"message": "Login successful", "user_id": user.id}), 200

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/user', methods=["GET"])
def get_user():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": user.id, "username": user.username, "email": user.email}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')