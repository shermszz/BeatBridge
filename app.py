from flask import Flask, render_template, request, session, redirect
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash  # For Hashing password
import os

# Prompts user for password if not set as environment variable
if 'DATABASE_PASSWORD' not in os.environ:
    os.environ['DATABASE_PASSWORD'] = input("Enter your PostgreSQL password: ")

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
    __tablename__ = 'users'  # Set table name
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

    # POST request: Submitting user's input 
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
        # If user did not enter same password
        if password != confirmation:
            errors['confirmation'] = "Passwords do not match"

        if errors:
            return render_template("register.html", errors=errors)

        # Check if username already exists in the database
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            errors['username'] = "Username already exists"
            return render_template("register.html", errors=errors)

        # Registering username and hashed password in SQL users database
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        # Redirect to login page after successful registration
        return redirect("/login")
    
    # GET request: show the registration form
    else:
        return render_template('register.html')
    
@app.route('/login', methods=["GET", "POST"])
def login():
    errors = {}

    # POST request: Submitting user's input 
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        # If user left username/password blank
        if not username:
            errors['username'] = "Please enter your username"
        if not password:
            errors['password'] = "Please enter your password"

        # If got any errors, return webpage with error
        if errors:
            return render_template("login.html", errors=errors)
        
        # Look up user in the database, if invalid username and password, return error
        user = User.query.filter_by(username=username).first()
        if user is None or not check_password_hash(user.hash, password):
            errors['general'] = "Invalid username or password"
            return render_template("login.html", errors=errors)

        # Successful login: store user id in session
        session['user_id'] = user.id
        return redirect('/')  # Return back to home.html
        
    # GET request: show the login form    
    else:
        return render_template('login.html')
    
@app.route("/logout")
def logout():
    # Forget any user_id
    session.clear()

    # Redirect user to login form (login.html)
    return redirect("/")

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')


if __name__ == "__main__":
    app.run(debug=True)

 