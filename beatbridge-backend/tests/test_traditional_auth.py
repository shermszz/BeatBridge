import pytest
import json
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestTraditionalAuthentication:
    def test_registration_success(self, test_client):
        """Test successful user registration with valid credentials"""
        response = test_client.post('/api/register',
                                  json={
                                      'username': 'testuser',
                                      'email': 'test@example.com',
                                      'password': 'TestPass123!',
                                      'confirmation': 'TestPass123!'
                                  })
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'User registered successfully'

    def test_registration_password_mismatch(self, test_client):
        """Test registration failure when password and confirmation do not match"""
        response = test_client.post('/api/register',
                                  json={
                                      'username': 'testuser',
                                      'email': 'test@example.com',
                                      'password': 'TestPass123!',
                                      'confirmation': 'DifferentPass123!'
                                  })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Passwords do not match'

    def test_login_success(self, test_client):
        """Test successful login with valid username and password"""
        # First register a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Then try to login
        response = test_client.post('/api/login',
                                  json={
                                      'username': 'testuser',
                                      'password': 'TestPass123!'
                                  })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data

    def test_login_with_email(self, test_client):
        """Test successful login using email address instead of username"""
        # First register a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Then try to login with email
        response = test_client.post('/api/login',
                                  json={
                                      'username': 'test@example.com',
                                      'password': 'TestPass123!'
                                  })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'access_token' in data

    def test_login_invalid_credentials(self, test_client):
        """Test login failure with invalid username and password"""
        response = test_client.post('/api/login',
                                  json={
                                      'username': 'nonexistent',
                                      'password': 'WrongPass123!'
                                  })
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Invalid username or password'

    def test_protected_route_access(self, test_client):
        """Test access to protected routes with and without authentication token"""
        # First create and login user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        login_response = test_client.post('/api/login',
                                        json={
                                            'username': 'testuser',
                                            'password': 'TestPass123!'
                                        })
        
        # Try accessing protected route without token
        response = test_client.get('/api/user')
        assert response.status_code == 401

        # Try accessing with token
        token = json.loads(login_response.data)['access_token']
        response = test_client.get('/api/user',
                                 headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200

    def test_email_verification(self, test_client, test_app):
        """Test email verification process with valid verification token"""
        # Register a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Get the user and their verification token
        with test_app.app_context():
            user = User.query.filter_by(username='testuser').first()
            token = user.generate_verification_token()

        # Try to verify with the token
        response = test_client.get(f'/api/verify-email/{token}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'Email verified successfully' 