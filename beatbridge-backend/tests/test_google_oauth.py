import pytest
import json
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestGoogleOAuth:
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