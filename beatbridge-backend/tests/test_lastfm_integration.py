import pytest
import json
from unittest.mock import patch, MagicMock
from app_factory import User, db

@pytest.mark.usefixtures('test_db')
class TestLastFMIntegration:
    """
    Test suite for Last.fm API integration features:
    - Genre listing
    - Song recommendations
    - API error handling
    - Response processing
    """

    def test_get_genres_success(self, test_client):
        """Test successful retrieval of genre list"""
        response = test_client.get('/api/genres')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'genres' in data
        genres = data['genres']
        assert len(genres) > 0
        
        # Check genre format
        for genre in genres:
            assert 'id' in genre
            assert 'name' in genre
            assert isinstance(genre['id'], str)
            assert isinstance(genre['name'], str)
        
        # Check for common genres
        genre_ids = [g['id'] for g in genres]
        assert 'rock' in genre_ids
        assert 'jazz' in genre_ids
        assert 'pop' in genre_ids

    @patch('requests.get')
    def test_recommend_song_success(self, mock_get, test_client):
        """Test successful song recommendation"""
        # Mock Last.fm API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'track': [
                    {
                        'name': 'Test Song',
                        'artist': {'name': 'Test Artist'},
                        'url': 'http://test.url'
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        # Register and login a user
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

        # Save user customization (required for recommendations)
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': ['rock']
                        })

        # Get recommendation
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': ['rock']})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation' in data
        assert 'name' in data['recommendation']
        assert 'artist' in data['recommendation']
        assert 'url' in data['recommendation']

    def test_recommend_song_no_genres(self, test_client):
        """Test recommendation request with no genres"""
        # Setup user
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

        # Test with empty genres list
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': []})
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Please select at least one genre'

    @patch('requests.get')
    def test_recommend_song_api_error(self, mock_get, test_client):
        """Test handling of Last.fm API errors"""
        # Mock API error
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response

        # Setup user
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

        # Save customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': ['rock']
                        })

        # Test recommendation with API error
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': ['rock']})
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Failed to fetch recommendations'

    def test_recommend_song_invalid_genre_format(self, test_client):
        """Test recommendation with invalid genre format"""
        # Setup user
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

        # Test with invalid genre format (string instead of list)
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': 'rock'})
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'Invalid genre format' 