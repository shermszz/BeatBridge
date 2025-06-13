from flask import Flask, request, session, jsonify
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Configure application
app = Flask(__name__)

# Enable CORS for React frontend
CORS(app,
     origins=["http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE"]
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
app.config["SECRET_KEY"] = "your-secret-key-here"  # Add a secret key
Session(app)

# Database model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    hash = db.Column(db.String(200), nullable=False)

# Create tables
with app.app_context():
    db.create_all()

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# API Routes
@app.route('/api/register', methods=["POST"])
def register():
    session.clear()
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    confirmation = data.get("confirmation")
    
    errors = {}
    
    if not username:
        errors['username'] = "Please provide a username"
    
    if not password:
        errors['password'] = "Password is required to continue"
    
    if password != confirmation:
        errors['confirmation'] = "Passwords do not match"
    
    if errors:
        return jsonify({"errors": errors}), 400
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        errors['username'] = "Username already exists"
        return jsonify({"errors": errors}), 400
    
    # Create new user
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, hash=hashed_password)
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
    
    return jsonify({"id": user.id, "username": user.username}), 200

# Serve React app (for production)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # This would serve your built React app in production
    # For development, React runs on port 3000
    return jsonify({"message": "React app should handle this route"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)