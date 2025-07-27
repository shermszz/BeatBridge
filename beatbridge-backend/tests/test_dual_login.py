import pytest
import json
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestDualLogin:
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