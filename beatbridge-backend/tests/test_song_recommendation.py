import pytest
import json
from unittest.mock import patch, MagicMock
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestSongRecommendation:
    """
    Test suite for song recommendation system features:
    - Song recommendation generation
    - User customization integration
    - Authentication and security
    - Data validation and error handling
    - Response processing and transformation
    """

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
        assert data['error'] == 'No genres selected'

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

    @patch('requests.get')
    def test_recommend_song_api_no_tracks(self, mock_get, test_client):
        """Test handling when Last.fm API returns no tracks for a genre"""
        # Mock API response with no tracks
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'track': []
            }
        }
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

        # Test recommendation with no tracks
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': ['rock']})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'No tracks found for genre' in data['error']

    @patch('requests.get')
    def test_recommend_song_data_transformation(self, mock_get, test_client):
        """Test accuracy of data transformation from Last.fm API format"""
        # Mock complex Last.fm API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'track': [
                    {
                        'name': 'Complex Song Name',
                        'artist': {'name': 'Complex Artist Name'},
                        'url': 'https://www.last.fm/music/Complex+Artist+Name/_/Complex+Song+Name',
                        'duration': '180',
                        'listeners': '12345',
                        'playcount': '67890'
                    }
                ]
            }
        }
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

        # Get recommendation and verify data transformation
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': ['rock']})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation' in data
        
        recommendation = data['recommendation']
        assert 'name' in recommendation
        assert 'artist' in recommendation
        assert 'url' in recommendation
        
        # Verify data is properly transformed
        assert recommendation['name'] == 'Complex Song Name'
        assert recommendation['artist'] == 'Complex Artist Name'
        assert 'last.fm' in recommendation['url']

    @patch('requests.get')
    def test_recommend_song_with_user_customization(self, mock_get, test_client):
        """Test integration between user customization and song recommendations"""
        # Mock API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'track': [
                    {
                        'name': 'Customized Song',
                        'artist': {'name': 'Customized Artist'},
                        'url': 'http://test.url'
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        # Register and login user
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

        # Save comprehensive user customization
        customization_response = test_client.post('/api/save-customization',
                                                headers={'Authorization': f'Bearer {token}'},
                                                json={
                                                    'skill_level': 'Advanced',
                                                    'practice_frequency': 'Weekly',
                                                    'favorite_genres': ['jazz', 'classical']
                                                })
        assert customization_response.status_code == 200

        # Get recommendation using user's preferred genres
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'genres': ['jazz', 'classical']})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'recommendation' in data
        
        # Verify the recommendation system respects user preferences
        recommendation = data['recommendation']
        assert 'name' in recommendation
        assert 'artist' in recommendation
        assert 'url' in recommendation

    def test_recommend_song_authentication_required(self, test_client):
        """Test that song recommendations require proper user authentication"""
        # Test recommendation without authentication
        response = test_client.post('/api/recommend-song',
                                  json={'genres': ['rock']})
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No token provided'

        # Test with invalid token
        response = test_client.post('/api/recommend-song',
                                  headers={'Authorization': 'Bearer invalid_token'},
                                  json={'genres': ['rock']})
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid token' in data['error'] 