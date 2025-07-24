import pytest
import json
from app_factory import User, db

@pytest.mark.usefixtures('test_db')
class TestFavorites:
    """
    Test suite for user favorites features:
    - Adding songs to favorites
    - Removing songs from favorites
    - Listing favorite songs
    - Handling metadata and tags
    """

    def test_add_favorite_success(self, test_client):
        """Test successfully adding a song to favorites"""
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

        # Add a song to favorites
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'song_name': 'Test Song',
                                      'artist_name': 'Test Artist',
                                      'album_name': 'Test Album',
                                      'song_url': 'http://test.url/song',
                                      'duration': 180,
                                      'album_image': 'http://test.url/image',
                                      'rhythm_complexity': 3,
                                      'tempo_rating': 4,
                                      'skill_level': 'Intermediate',
                                      'tags': ['rock', 'upbeat']
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'id' in data

    def test_add_favorite_validation(self, test_client):
        """Test validation when adding a song to favorites"""
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

        # Test missing required fields
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'song_name': 'Test Song'
                                      # Missing other required fields
                                  })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required fields' in data['error']

    def test_get_favorites(self, test_client):
        """Test retrieving user's favorite songs"""
        # Setup user and add some favorites
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

        # Add two favorite songs
        for i in range(2):
            test_client.post('/api/favorites',
                           headers={'Authorization': f'Bearer {token}'},
                           json={
                               'song_name': f'Test Song {i+1}',
                               'artist_name': 'Test Artist',
                               'song_url': 'http://test.url/song',
                               'album_name': 'Test Album',
                               'duration': 180
                           })

        # Get favorites list
        response = test_client.get('/api/favorites',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'favorites' in data
        assert len(data['favorites']) == 2
        assert all('song_name' in f for f in data['favorites'])
        assert all('artist_name' in f for f in data['favorites'])

    def test_remove_favorite(self, test_client):
        """Test removing a song from favorites"""
        # Setup user and add a favorite to remove
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

        # Add a favorite song
        add_response = test_client.post('/api/favorites',
                                      headers={'Authorization': f'Bearer {token}'},
                                      json={
                                          'song_name': 'Test Song',
                                          'artist_name': 'Test Artist',
                                          'song_url': 'http://test.url/song',
                                          'album_name': 'Test Album',
                                          'duration': 180
                                      })
        
        favorite_id = json.loads(add_response.data)['id']

        # Remove the favorite
        response = test_client.delete(f'/api/favorites/{favorite_id}',
                                    headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Song removed from favorites'

        # Verify removal
        get_response = test_client.get('/api/favorites',
                                     headers={'Authorization': f'Bearer {token}'})
        favorites = json.loads(get_response.data)['favorites']
        assert len(favorites) == 0

    def test_duplicate_favorite(self, test_client):
        """Test adding the same song to favorites twice"""
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

        # Add a song
        song_data = {
            'song_name': 'Test Song',
            'artist_name': 'Test Artist',
            'song_url': 'http://test.url/song',
            'album_name': 'Test Album',
            'duration': 180
        }

        # First addition should succeed
        test_client.post('/api/favorites',
                        headers={'Authorization': f'Bearer {token}'},
                        json=song_data)

        # Second addition should fail
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json=song_data)
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Song already in favorites' in data['error'] 