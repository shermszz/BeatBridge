import pytest
import json
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestPasswordReset:
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