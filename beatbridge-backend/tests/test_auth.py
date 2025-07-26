import unittest
from unittest.mock import patch, MagicMock
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, db, User
import json
import pytest
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestAuthentication:
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

    def test_forgot_password_success(self, test_client):
        """Test successful password reset request for existing email"""
        # First register a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Request password reset
        response = test_client.post('/api/forgot-password',
                                  json={'email': 'test@example.com'})
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'OTP sent to your email'

    def test_forgot_password_email_not_found(self, test_client):
        """Test password reset request failure for non-existent email"""
        response = test_client.post('/api/forgot-password',
                                  json={'email': 'nonexistent@example.com'})
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Email not found. Please sign up instead.'

    def test_forgot_password_missing_email(self, test_client):
        """Test password reset request failure when email is not provided"""
        response = test_client.post('/api/forgot-password',
                                  json={})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Email is required'

    def test_verify_otp_success(self, test_client):
        """Test successful OTP verification for password reset"""
        # First register a user and request password reset
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        # Request password reset to generate OTP
        forgot_response = test_client.post('/api/forgot-password',
                                         json={'email': 'test@example.com'})
        assert forgot_response.status_code == 200

        # Get the OTP from the in-memory storage (we need to access it directly)
        from app_factory import user_otps
        otp = user_otps.get('test@example.com')
        assert otp is not None

        # Verify OTP
        response = test_client.post('/api/verify-otp',
                                  json={
                                      'email': 'test@example.com',
                                      'otp': otp
                                  })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'OTP verified successfully'

    def test_verify_otp_invalid(self, test_client):
        """Test OTP verification failure with invalid OTP"""
        response = test_client.post('/api/verify-otp',
                                  json={
                                      'email': 'test@example.com',
                                      'otp': 'invalid'
                                  })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Invalid OTP'

    def test_reset_password_success(self, test_client):
        """Test successful password reset after OTP verification"""
        # First register a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Reset password
        response = test_client.post('/api/reset-password',
                                  json={
                                      'email': 'test@example.com',
                                      'password': 'NewPass123!'
                                  })
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'Password reset successfully'

    def test_reset_password_user_not_found(self, test_client):
        """Test password reset failure for non-existent user"""
        response = test_client.post('/api/reset-password',
                                  json={
                                      'email': 'nonexistent@example.com',
                                      'password': 'NewPass123!'
                                  })
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'User not found'

    def test_google_login_redirect(self, test_client):
        """Test Google login redirects to Google OAuth URL"""
        response = test_client.get('/api/google-login')
        assert response.status_code == 302  # Redirect status
        assert 'accounts.google.com' in response.location

    def test_google_login_callback_new_user(self, test_client):
        """Test Google OAuth callback creates new user when user doesn't exist"""
        # Mock the Google OAuth callback with authorization code
        response = test_client.get('/api/google-login/callback?code=test_code')
        assert response.status_code == 302  # Redirect status
        assert 'google-auth-success' in response.location
        assert 'token=' in response.location

    def test_google_login_callback_existing_user(self, test_client):
        """Test Google OAuth callback links existing user with Google ID"""
        # First create a user with the same email
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@gmail.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })

        # Mock the Google OAuth callback
        response = test_client.get('/api/google-login/callback?code=test_code')
        assert response.status_code == 302  # Redirect status
        assert 'google-auth-success' in response.location
        assert 'token=' in response.location

    def test_google_login_callback_no_code(self, test_client):
        """Test Google OAuth callback failure when no authorization code is provided"""
        response = test_client.get('/api/google-login/callback')
        assert response.status_code == 302  # Redirect status
        assert 'error=google_auth_failed' in response.location

    def test_google_user_login_with_placeholder_password(self, test_client):
        """Test that Google users cannot login with placeholder password using traditional login"""
        # First create a Google user (simulate Google OAuth)
        test_client.get('/api/google-login/callback?code=test_code')

        # Try to login with traditional credentials (should fail)
        response = test_client.post('/api/login',
                                  json={
                                      'username': 'testuser',
                                      'password': 'google-oauth-user'
                                  })
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Google' in data['error']

    def test_google_user_login_with_set_password(self, test_client):
        """Test that Google users can login with traditional credentials after setting a password"""
        # First create a Google user and get the token
        response = test_client.get('/api/google-login/callback?code=test_code')
        assert response.status_code == 302
        assert 'token=' in response.location
        
        # Extract token from redirect URL
        token = response.location.split('token=')[1]

        # Set a new password
        set_password_response = test_client.post('/api/set-password',
                                               json={'new_password': 'MyNewPassword123!'},
                                               headers={'Authorization': f'Bearer {token}'})
        assert set_password_response.status_code == 200

        # Now try to login with traditional credentials (should succeed)
        login_response = test_client.post('/api/login',
                                        json={
                                            'username': 'testuser',
                                            'password': 'MyNewPassword123!'
                                        })
        assert login_response.status_code == 200
        data = json.loads(login_response.data)
        assert 'access_token' in data

    def test_set_password_success(self, test_client):
        """Test successful password setting for authenticated user"""
        # First register and login a user
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
        token = json.loads(login_response.data)['access_token']

        # Set a new password
        response = test_client.post('/api/set-password',
                                  json={'new_password': 'NewPassword123!'},
                                  headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'message' in data
        assert data['message'] == 'Password set successfully'

    def test_set_password_unauthorized(self, test_client):
        """Test password setting failure when user is not authenticated"""
        response = test_client.post('/api/set-password',
                                  json={'new_password': 'NewPassword123!'})
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No token provided'

    def test_set_password_missing_password(self, test_client):
        """Test password setting failure when new password is not provided"""
        # First register and login a user
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
        token = json.loads(login_response.data)['access_token']

        # Try to set password without providing new password
        response = test_client.post('/api/set-password',
                                  json={},
                                  headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'New password is required'

if __name__ == '__main__':
    unittest.main() 