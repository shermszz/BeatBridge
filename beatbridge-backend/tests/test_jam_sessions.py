import pytest
import json
from app import User, db

@pytest.mark.usefixtures('test_db')
class TestJamSessions:
    """
    Test suite for jam session features:
    - Creating new jam sessions
    - Updating existing sessions
    - Deleting sessions
    - Handling pattern data
    - Managing session visibility
    """

    def test_create_jam_session_success(self, test_client):
        """Test successful creation of a jam session"""
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

        # Create a jam session
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'My First Jam',
                                      'pattern_json': [[1, 0, 1, 0]],
                                      'is_public': True,
                                      'instruments_json': ['drums', 'bass'],
                                      'time_signature': '4/4',
                                      'note_resolution': '16th',
                                      'bpm': 120
                                  })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'message' in data
        assert 'jam_id' in data
        assert data['message'] == 'Jam session created'

    def test_create_jam_session_validation(self, test_client):
        """Test validation when creating a jam session"""
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

        # Test missing title
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'pattern_json': [[1, 0, 1, 0]],
                                      'is_public': True
                                  })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Title and pattern are required' in data['error']

        # Test missing pattern
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'Test Jam',
                                      'is_public': True
                                  })
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Title and pattern are required' in data['error']

    def test_update_jam_session(self, test_client):
        """Test updating an existing jam session"""
        # Setup user and create initial jam session
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

        # Create initial jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Original Jam',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True,
                                             'bpm': 120
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Update the jam session
        response = test_client.put(f'/api/jam-sessions/{jam_id}',
                                 headers={'Authorization': f'Bearer {token}'},
                                 json={
                                     'title': 'Updated Jam',
                                     'pattern_json': [[1, 1, 1, 1]],
                                     'is_public': False,
                                     'bpm': 140
                                 })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Jam session updated'

        # Verify the update
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        updated_jam = json.loads(get_response.data)
        assert updated_jam['title'] == 'Updated Jam'
        assert updated_jam['is_public'] is False
        assert updated_jam['bpm'] == 140

    def test_delete_jam_session(self, test_client):
        """Test deleting a jam session"""
        # Setup user and create a jam session to delete
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

        # Create a jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Jam to Delete',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Delete the jam session
        response = test_client.delete(f'/api/jam-sessions/{jam_id}',
                                    headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['message'] == 'Jam session deleted successfully'

        # Verify deletion
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        assert get_response.status_code == 404

    def test_explore_jam_sessions(self, test_client):
        """Test exploring public jam sessions"""
        # Setup user and create both public and private sessions
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

        # Create public and private jam sessions
        test_client.post('/api/jam-sessions',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'title': 'Public Jam',
                            'pattern_json': [[1, 0, 1, 0]],
                            'is_public': True
                        })

        test_client.post('/api/jam-sessions',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'title': 'Private Jam',
                            'pattern_json': [[1, 0, 1, 0]],
                            'is_public': False
                        })

        # Test explore endpoint
        response = test_client.get('/api/jam-sessions/explore')
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Should only see public jams
        public_jams = [jam for jam in data if jam['is_public']]
        assert len(public_jams) > 0
        assert all(jam['is_public'] for jam in data) 