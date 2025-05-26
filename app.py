from flask import Flask, render_template, request, session, redirect
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash  # For Hashing password
import os

# Configure application
app = Flask(__name__, template_folder='templates') # "__name__" is the name of the current module, where the name could change dynamically
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://postgres:{os.environ['DATABASE_PASSWORD']}@localhost/flask_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# ORM SQLAlchemy, defining database model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    hash = db.Column(db.String(200), nullable=False)

# Creating user database
with app.app_context():
    db.create_all()

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/register', methods=["GET", "POST"])
def register():
    # Forget any user_id
    session.clear()
    # Create dict of errors
    errors = {}

    # Submitting user's input via POST
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")
        # If user left username/password blank
        if not username:
            errors['username'] = "Please provide a username"
        # If user did not enter same password
        if not password:
            errors['password'] = "Password is required to continue"
        # Checking whether there is existing username already
        if password != confirmation:
            errors['confirmation'] = "Passwords do not match"

        return render_template("register.html", errors=errors)

        # Registering username and password in SQL users database

    else:
        return render_template('register.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == "__main__":
    app.run(debug=True)

 