import pytest
import json
import os
import requests
from app_factory import User

@pytest.mark.usefixtures('test_db')
class TestLastFMAPI:
    """
    Test suite for Last.fm API integration features:
    - Direct API connection testing
    - Genre data retrieval
    - API response validation
    - Environment configuration
    """

    def test_lastfm_api_connection(self):
        """Test direct Last.fm API connection and basic functionality"""
        LASTFM_API_KEY = os.environ.get('LASTFM_API_KEY')
        if not LASTFM_API_KEY or LASTFM_API_KEY == 'your-lastfm-api-key':
            pytest.skip('LASTFM_API_KEY is not set. Please set it in your .env file.')

        params = {
            'method': 'tag.gettoptracks',
            'tag': 'rock',
            'api_key': LASTFM_API_KEY,
            'format': 'json',
            'limit': 5
        }

        try:
            response = requests.get('http://ws.audioscrobbler.com/2.0/', params=params)
            response.raise_for_status()
            data = response.json()
            tracks = data.get('tracks', {}).get('track', [])
            
            assert len(tracks) > 0, f'No tracks found for genre: rock'
            assert 'name' in tracks[0], 'Track should have name field'
            assert 'artist' in tracks[0], 'Track should have artist field'
            
        except Exception as e:
            pytest.fail(f'Error fetching tracks from Last.fm API: {e}')

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