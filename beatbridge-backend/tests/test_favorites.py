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
    - Authentication and security
    - Data validation and error handling
    - Edge cases and data integrity
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

    def test_add_favorite_authentication_required(self, test_client):
        """Test that adding favorites requires proper authentication"""
        # Test without authentication
        response = test_client.post('/api/favorites',
                                  json={
                                      'song_name': 'Test Song',
                                      'artist_name': 'Test Artist',
                                      'song_url': 'http://test.url/song'
                                  })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No token provided'

        # Test with invalid token
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': 'Bearer invalid_token'},
                                  json={
                                      'song_name': 'Test Song',
                                      'artist_name': 'Test Artist',
                                      'song_url': 'http://test.url/song'
                                  })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid token' in data['error']

    def test_get_favorites_authentication_required(self, test_client):
        """Test that getting favorites requires proper authentication"""
        # Test without authentication
        response = test_client.get('/api/favorites')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No token provided'

        # Test with invalid token
        response = test_client.get('/api/favorites',
                                 headers={'Authorization': 'Bearer invalid_token'})
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid token' in data['error']

    def test_remove_favorite_authentication_required(self, test_client):
        """Test that removing favorites requires proper authentication"""
        # Test without authentication
        response = test_client.delete('/api/favorites/1')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert data['error'] == 'No token provided'

        # Test with invalid token
        response = test_client.delete('/api/favorites/1',
                                    headers={'Authorization': 'Bearer invalid_token'})
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Invalid token' in data['error']

    def test_remove_favorite_not_found(self, test_client):
        """Test removing a favorite that doesn't exist"""
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

        # Try to remove non-existent favorite
        response = test_client.delete('/api/favorites/999',
                                    headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Favorite not found' in data['error']

    def test_remove_favorite_unauthorized(self, test_client):
        """Test removing a favorite that belongs to another user"""
        # Setup first user and add a favorite
        test_client.post('/api/register',
                        json={
                            'username': 'user1',
                            'email': 'user1@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login_response = test_client.post('/api/login',
                                        json={
                                            'username': 'user1',
                                            'password': 'TestPass123!'
                                        })
        token1 = json.loads(login_response.data)['access_token']

        # Add a favorite for user1
        add_response = test_client.post('/api/favorites',
                                      headers={'Authorization': f'Bearer {token1}'},
                                      json={
                                          'song_name': 'Test Song',
                                          'artist_name': 'Test Artist',
                                          'song_url': 'http://test.url/song'
                                      })
        favorite_id = json.loads(add_response.data)['id']

        # Setup second user
        test_client.post('/api/register',
                        json={
                            'username': 'user2',
                            'email': 'user2@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login_response2 = test_client.post('/api/login',
                                         json={
                                             'username': 'user2',
                                             'password': 'TestPass123!'
                                         })
        token2 = json.loads(login_response2.data)['access_token']

        # Try to remove user1's favorite with user2's token
        response = test_client.delete(f'/api/favorites/{favorite_id}',
                                    headers={'Authorization': f'Bearer {token2}'})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Favorite not found' in data['error']

    def test_add_favorite_with_optional_fields(self, test_client):
        """Test adding a favorite with all optional fields and verify data integrity"""
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

        # Add favorite with all fields
        song_data = {
            'song_name': 'Complex Song',
            'artist_name': 'Complex Artist',
            'album_name': 'Complex Album',
            'song_url': 'http://test.url/complex-song',
            'duration': 240,
            'album_image': 'http://test.url/complex-image.jpg',
            'rhythm_complexity': 5,
            'tempo_rating': 3,
            'skill_level': 'Advanced',
            'tags': ['jazz', 'complex', 'instrumental', 'experimental']
        }

        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json=song_data)
        
        assert response.status_code == 200
        favorite_id = json.loads(response.data)['id']

        # Verify all data was saved correctly
        get_response = test_client.get('/api/favorites',
                                     headers={'Authorization': f'Bearer {token}'})
        favorites = json.loads(get_response.data)['favorites']
        
        assert len(favorites) == 1
        favorite = favorites[0]
        assert favorite['id'] == favorite_id
        assert favorite['song_name'] == song_data['song_name']
        assert favorite['artist_name'] == song_data['artist_name']
        assert favorite['album_name'] == song_data['album_name']
        assert favorite['song_url'] == song_data['song_url']
        assert favorite['duration'] == song_data['duration']
        assert favorite['album_image'] == song_data['album_image']
        assert favorite['rhythm_complexity'] == song_data['rhythm_complexity']
        assert favorite['tempo_rating'] == song_data['tempo_rating']
        assert favorite['skill_level'] == song_data['skill_level']
        assert favorite['tags'] == song_data['tags']

    def test_get_favorites_empty_list(self, test_client):
        """Test getting favorites when user has no favorites"""
        # Setup user without adding any favorites
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

        # Get favorites (should be empty)
        response = test_client.get('/api/favorites',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'favorites' in data
        assert len(data['favorites']) == 0
        assert isinstance(data['favorites'], list)

    def test_add_favorite_tags_handling(self, test_client):
        """Test handling of tags in different formats"""
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

        # Test with empty tags array
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'song_name': 'Song with Empty Tags',
                                      'artist_name': 'Test Artist',
                                      'song_url': 'http://test.url/song',
                                      'tags': []
                                  })
        
        assert response.status_code == 200

        # Test with single tag
        response = test_client.post('/api/favorites',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'song_name': 'Song with Single Tag',
                                      'artist_name': 'Test Artist',
                                      'song_url': 'http://test.url/song2',
                                      'tags': ['rock']
                                  })
        
        assert response.status_code == 200

        # Verify tags are handled correctly
        get_response = test_client.get('/api/favorites',
                                     headers={'Authorization': f'Bearer {token}'})
        favorites = json.loads(get_response.data)['favorites']
        
        assert len(favorites) == 2
        # Check that tags are properly stored and retrieved
        for favorite in favorites:
            assert 'tags' in favorite
            assert isinstance(favorite['tags'], list) 