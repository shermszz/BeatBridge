import os
import sys
import pytest
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_cors import CORS

# Add the parent directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the app factory and models
from app_factory import create_app, db, User

@pytest.fixture
def test_app():
    """Create a test app fixture"""
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SECRET_KEY': 'test_secret_key',
        'MAIL_SERVER': 'smtp.test.com',
        'MAIL_PORT': 587,
        'MAIL_USE_TLS': True,
        'MAIL_USERNAME': 'test@test.com',
        'MAIL_PASSWORD': 'test_password',
        'LASTFM_API_KEY': 'test_api_key'
    })
    
    return app

@pytest.fixture
def test_client(test_app):
    """Create a test client"""
    return test_app.test_client()

@pytest.fixture
def test_db(test_app):
    """Initialize test database"""
    with test_app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all() 