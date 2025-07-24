import pytest
import json
from app_factory import User, db

@pytest.mark.usefixtures('test_db')
class TestUserCustomization:
    """
    Test suite for user customization features:
    - Setting and getting user skill level
    - Managing practice frequency preferences
    - Handling favorite genres
    - Error cases and validation
    """
    
    def test_save_customization_success(self, test_client):
        """Test successful saving of user customization settings"""
        # First register and verify a user
        test_client.post('/api/register',
                        json={
                            'username': 'testuser',
                            'email': 'test@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        # Login to get token
        login_response = test_client.post('/api/login',
                                        json={
                                            'username': 'testuser',
                                            'password': 'TestPass123!'
                                        })
        token = json.loads(login_response.data)['access_token']
        
        # Save customization
        response = test_client.post('/api/save-customization',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'skill_level': 'Beginner',
                                      'practice_frequency': 'Daily',
                                      'favorite_genres': ['rock', 'jazz']
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Customization saved successfully'

    def test_get_customization_success(self, test_client):
        """Test retrieving user customization settings"""
        # First register and save customization (reuse previous setup)
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
        
        # Save customization first
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': ['rock', 'jazz']
                        })
        
        # Get customization
        response = test_client.get('/api/get-customization',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['skill_level'] == 'Beginner'
        assert data['practice_frequency'] == 'Daily'
        assert 'rock' in data['favorite_genres']
        assert 'jazz' in data['favorite_genres']

    def test_save_customization_validation(self, test_client):
        """Test validation of customization data"""
        # Setup user and get token
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
        
        # Test missing skill level
        response = test_client.post('/api/save-customization',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'practice_frequency': 'Daily',
                                      'favorite_genres': ['rock']
                                  })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'skill' in data['errors']
        
        # Test missing practice frequency
        response = test_client.post('/api/save-customization',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'skill_level': 'Beginner',
                                      'favorite_genres': ['rock']
                                  })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'practice' in data['errors']
        
        # Test empty genres
        response = test_client.post('/api/save-customization',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'skill_level': 'Beginner',
                                      'practice_frequency': 'Daily',
                                      'favorite_genres': []
                                  })
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'genres' in data['errors']

    def test_get_customization_not_found(self, test_client):
        """Test getting customization when none exists"""
        # Setup user but don't save any customization
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
        
        # Try to get non-existent customization
        response = test_client.get('/api/get-customization',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'No customization found'

    def test_update_existing_customization(self, test_client):
        """Test updating existing customization settings"""
        # Setup user and initial customization
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
        
        # Save initial customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': ['rock']
                        })
        
        # Update customization
        response = test_client.post('/api/save-customization',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'skill_level': 'Intermediate',
                                      'practice_frequency': 'Weekly',
                                      'favorite_genres': ['jazz', 'classical']
                                  })
        
        assert response.status_code == 200
        
        # Verify updated values
        get_response = test_client.get('/api/get-customization',
                                     headers={'Authorization': f'Bearer {token}'})
        data = json.loads(get_response.data)
        assert data['skill_level'] == 'Intermediate'
        assert data['practice_frequency'] == 'Weekly'
        assert 'jazz' in data['favorite_genres']
        assert 'classical' in data['favorite_genres'] 