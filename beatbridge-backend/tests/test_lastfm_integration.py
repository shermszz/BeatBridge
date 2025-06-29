import pytest
from unittest.mock import patch, MagicMock
import json
from app import app

@pytest.mark.usefixtures('test_db')
class TestLastFmIntegration:
    def test_genre_endpoint_success(self, test_client):
        """Test successful genre list retrieval"""
        response = test_client.get('/api/genres')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert 'genres' in data
        assert len(data['genres']) > 0
        assert all(isinstance(g, dict) for g in data['genres'])
        
    @patch('requests.get')
    def test_song_recommendation_success(self, mock_get, test_client):
        """Test successful song recommendation"""
        # Mock Last.fm API responses
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'tracks': {
                'track': [
                    {
                        'name': 'Test Song',
                        'artist': {'name': 'Test Artist'},
                        'url': 'http://test.url',
                        'listeners': '1000'
                    }
                ]
            }
        }
        mock_get.return_value = mock_response
        
        response = test_client.post('/api/recommend-song',
                                  json={'genres': ['rock']},
                                  content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert 'recommendation' in data
        assert 'name' in data['recommendation']
        assert 'artist' in data['recommendation']
        
    def test_song_recommendation_no_genre(self, test_client):
        """Test recommendation with no genre selected"""
        response = test_client.post('/api/recommend-song',
                                  json={'genres': []},
                                  content_type='application/json')
        
        assert response.status_code == 400
        
    @patch('requests.get')
    def test_song_recommendation_api_error(self, mock_get, test_client):
        """Test handling of Last.fm API errors"""
        mock_get.side_effect = Exception('API Error')
        
        response = test_client.post('/api/recommend-song',
                                  json={'genres': ['rock']},
                                  content_type='application/json')
        
        assert response.status_code == 500
        
    def test_invalid_genre_format(self, test_client):
        """Test handling of invalid genre format"""
        response = test_client.post('/api/recommend-song',
                                  json={'genres': 'invalid'},
                                  content_type='application/json')
        
        assert response.status_code == 400 