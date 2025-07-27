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

    def test_create_jam_session_without_authentication(self, test_client):
        """Test creating a jam session without authentication token"""
        response = test_client.post('/api/jam-sessions',
                                  json={
                                      'title': 'Unauthorized Jam',
                                      'pattern_json': [[1, 0, 1, 0]],
                                      'is_public': True
                                  })
        
        assert response.status_code == 401

    def test_create_jam_session_with_invalid_token(self, test_client):
        """Test creating a jam session with invalid JWT token"""
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': 'Bearer invalid_token'},
                                  json={
                                      'title': 'Invalid Token Jam',
                                      'pattern_json': [[1, 0, 1, 0]],
                                      'is_public': True
                                  })
        
        assert response.status_code == 401

    def test_create_jam_session_duplicate_title(self, test_client):
        """Test creating jam sessions with duplicate titles for the same user"""
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

        # Create first jam session
        response1 = test_client.post('/api/jam-sessions',
                                   headers={'Authorization': f'Bearer {token}'},
                                   json={
                                       'title': 'Duplicate Title',
                                       'pattern_json': [[1, 0, 1, 0]],
                                       'is_public': True
                                   })
        
        assert response1.status_code == 201

        # Try to create second jam session with same title
        response2 = test_client.post('/api/jam-sessions',
                                   headers={'Authorization': f'Bearer {token}'},
                                   json={
                                       'title': 'Duplicate Title',
                                       'pattern_json': [[0, 1, 0, 1]],
                                       'is_public': False
                                   })
        
        assert response2.status_code == 409
        data = json.loads(response2.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_create_jam_session_with_complex_pattern(self, test_client):
        """Test creating jam session with complex multi-instrument pattern"""
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

        # Create jam session with complex pattern
        complex_pattern = [
            [1, 0, 1, 0, 1, 0, 1, 0],  # Kick drum
            [0, 0, 1, 0, 0, 0, 1, 0],  # Snare
            [1, 1, 1, 1, 1, 1, 1, 1],  # Hi-hat
            [0, 1, 0, 1, 0, 1, 0, 1]   # Bass
        ]
        
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'Complex Pattern Jam',
                                      'pattern_json': complex_pattern,
                                      'is_public': True,
                                      'instruments_json': ['kick', 'snare', 'hihat', 'bass'],
                                      'time_signature': '4/4',
                                      'note_resolution': '8th',
                                      'bpm': 130
                                  })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'jam_id' in data

    def test_get_jam_session_by_id(self, test_client):
        """Test retrieving a specific jam session by ID"""
        # Setup user and create jam session
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

        # Create jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Test Jam',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True,
                                             'instruments_json': ['drums'],
                                             'time_signature': '4/4',
                                             'bpm': 120
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Get the jam session
        response = test_client.get(f'/api/jam-sessions/{jam_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['title'] == 'Test Jam'
        assert data['is_public'] is True
        assert data['bpm'] == 120
        assert 'pattern_json' in data
        assert 'instruments_json' in data

    def test_get_nonexistent_jam_session(self, test_client):
        """Test retrieving a jam session that doesn't exist"""
        response = test_client.get('/api/jam-sessions/99999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
        assert 'not found' in data['error']

    def test_get_user_jam_sessions(self, test_client):
        """Test retrieving all jam sessions for a specific user"""
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
        user_id = json.loads(login_response.data)['user_id']

        # Create multiple jam sessions
        test_client.post('/api/jam-sessions',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'title': 'Jam 1',
                            'pattern_json': [[1, 0, 1, 0]],
                            'is_public': True
                        })

        test_client.post('/api/jam-sessions',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'title': 'Jam 2',
                            'pattern_json': [[0, 1, 0, 1]],
                            'is_public': False
                        })

        # Get user's jam sessions
        response = test_client.get(f'/api/jam-sessions/user/{user_id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 2
        assert any(jam['title'] == 'Jam 1' for jam in data)
        assert any(jam['title'] == 'Jam 2' for jam in data)

    def test_update_jam_session_unauthorized(self, test_client):
        """Test updating a jam session without authentication"""
        response = test_client.put('/api/jam-sessions/1',
                                 json={
                                     'title': 'Unauthorized Update',
                                     'pattern_json': [[1, 0, 1, 0]]
                                 })
        
        assert response.status_code == 401

    def test_update_jam_session_wrong_user(self, test_client):
        """Test updating a jam session created by another user"""
        # Create first user and jam session
        test_client.post('/api/register',
                        json={
                            'username': 'user1',
                            'email': 'user1@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login1_response = test_client.post('/api/login',
                                         json={
                                             'username': 'user1',
                                             'password': 'TestPass123!'
                                         })
        token1 = json.loads(login1_response.data)['access_token']

        # Create jam session with user1
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token1}'},
                                         json={
                                             'title': 'User1 Jam',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Create second user
        test_client.post('/api/register',
                        json={
                            'username': 'user2',
                            'email': 'user2@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login2_response = test_client.post('/api/login',
                                         json={
                                             'username': 'user2',
                                             'password': 'TestPass123!'
                                         })
        token2 = json.loads(login2_response.data)['access_token']

        # Try to update jam session with user2
        response = test_client.put(f'/api/jam-sessions/{jam_id}',
                                 headers={'Authorization': f'Bearer {token2}'},
                                 json={
                                     'title': 'Hacked Jam',
                                     'pattern_json': [[1, 1, 1, 1]]
                                 })
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_update_jam_session_duplicate_title(self, test_client):
        """Test updating jam session with title that conflicts with another user's jam"""
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

        # Create two jam sessions
        create1_response = test_client.post('/api/jam-sessions',
                                          headers={'Authorization': f'Bearer {token}'},
                                          json={
                                              'title': 'Jam A',
                                              'pattern_json': [[1, 0, 1, 0]],
                                              'is_public': True
                                          })
        
        create2_response = test_client.post('/api/jam-sessions',
                                          headers={'Authorization': f'Bearer {token}'},
                                          json={
                                              'title': 'Jam B',
                                              'pattern_json': [[0, 1, 0, 1]],
                                              'is_public': True
                                          })
        
        jam_id_1 = json.loads(create1_response.data)['jam_id']
        jam_id_2 = json.loads(create2_response.data)['jam_id']

        # Try to update Jam B with Jam A's title
        response = test_client.put(f'/api/jam-sessions/{jam_id_2}',
                                 headers={'Authorization': f'Bearer {token}'},
                                 json={
                                     'title': 'Jam A',
                                     'pattern_json': [[0, 1, 0, 1]]
                                 })
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert 'error' in data
        assert 'already exists' in data['error']

    def test_delete_jam_session_unauthorized(self, test_client):
        """Test deleting a jam session without authentication"""
        response = test_client.delete('/api/jam-sessions/1')
        assert response.status_code == 401

    def test_delete_jam_session_wrong_user(self, test_client):
        """Test deleting a jam session created by another user"""
        # Create first user and jam session
        test_client.post('/api/register',
                        json={
                            'username': 'user1',
                            'email': 'user1@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login1_response = test_client.post('/api/login',
                                         json={
                                             'username': 'user1',
                                             'password': 'TestPass123!'
                                         })
        token1 = json.loads(login1_response.data)['access_token']

        # Create jam session with user1
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token1}'},
                                         json={
                                             'title': 'User1 Jam',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Create second user
        test_client.post('/api/register',
                        json={
                            'username': 'user2',
                            'email': 'user2@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login2_response = test_client.post('/api/login',
                                         json={
                                             'username': 'user2',
                                             'password': 'TestPass123!'
                                         })
        token2 = json.loads(login2_response.data)['access_token']

        # Try to delete jam session with user2
        response = test_client.delete(f'/api/jam-sessions/{jam_id}',
                                    headers={'Authorization': f'Bearer {token2}'})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_delete_nonexistent_jam_session(self, test_client):
        """Test deleting a jam session that doesn't exist"""
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

        # Try to delete non-existent jam session
        response = test_client.delete('/api/jam-sessions/99999',
                                    headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_create_jam_session_with_parent_jam(self, test_client):
        """Test creating a jam session with a parent jam ID (forking)"""
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

        # Create parent jam session
        parent_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Parent Jam',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        parent_jam_id = json.loads(parent_response.data)['jam_id']

        # Create child jam session
        child_response = test_client.post('/api/jam-sessions',
                                        headers={'Authorization': f'Bearer {token}'},
                                        json={
                                            'title': 'Child Jam',
                                            'pattern_json': [[1, 1, 1, 1]],
                                            'is_public': True,
                                            'parent_jam_id': parent_jam_id
                                        })
        
        assert child_response.status_code == 201
        data = json.loads(child_response.data)
        assert 'jam_id' in data

    def test_create_jam_session_with_all_optional_fields(self, test_client):
        """Test creating jam session with all optional fields populated"""
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

        # Create jam session with all fields
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'Complete Jam',
                                      'pattern_json': [[1, 0, 1, 0], [0, 1, 0, 1]],
                                      'is_public': False,
                                      'parent_jam_id': None,
                                      'instruments_json': ['kick', 'snare'],
                                      'time_signature': '3/4',
                                      'note_resolution': '8th',
                                      'bpm': 150
                                  })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'jam_id' in data

        # Verify the jam session was created with correct data
        jam_id = data['jam_id']
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        jam_data = json.loads(get_response.data)
        assert jam_data['title'] == 'Complete Jam'
        assert jam_data['is_public'] is False
        assert jam_data['time_signature'] == '3/4'
        assert jam_data['note_resolution'] == '8th'
        assert jam_data['bpm'] == 150

    def test_create_jam_session_with_empty_pattern(self, test_client):
        """Test creating jam session with empty pattern array"""
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

        # Create jam session with empty pattern
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'Empty Pattern Jam',
                                      'pattern_json': [],
                                      'is_public': True
                                  })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'jam_id' in data

    def test_create_jam_session_with_null_optional_fields(self, test_client):
        """Test creating jam session with null optional fields"""
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

        # Create jam session with null optional fields
        response = test_client.post('/api/jam-sessions',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'title': 'Null Fields Jam',
                                      'pattern_json': [[1, 0, 1, 0]],
                                      'is_public': True,
                                      'instruments_json': None,
                                      'time_signature': None,
                                      'note_resolution': None,
                                      'bpm': None
                                  })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'jam_id' in data

    def test_explore_jam_sessions_empty(self, test_client):
        """Test exploring jam sessions when no public sessions exist"""
        response = test_client.get('/api/jam-sessions/explore')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_explore_jam_sessions_limit(self, test_client):
        """Test that explore endpoint limits results to 20 sessions"""
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

        # Create 25 public jam sessions
        for i in range(25):
            test_client.post('/api/jam-sessions',
                           headers={'Authorization': f'Bearer {token}'},
                           json={
                               'title': f'Jam {i}',
                               'pattern_json': [[1, 0, 1, 0]],
                               'is_public': True
                           })

        # Check explore endpoint
        response = test_client.get('/api/jam-sessions/explore')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) <= 20  # Should be limited to 20

    def test_jam_session_json_parsing(self, test_client):
        """Test that pattern_json and instruments_json are properly parsed from JSON strings"""
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

        # Create jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'JSON Test Jam',
                                             'pattern_json': [[1, 0, 1, 0], [0, 1, 0, 1]],
                                             'instruments_json': ['kick', 'snare'],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Retrieve and verify JSON parsing
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        jam_data = json.loads(get_response.data)
        
        # Verify pattern_json is parsed as array
        assert isinstance(jam_data['pattern_json'], list)
        assert len(jam_data['pattern_json']) == 2
        assert jam_data['pattern_json'][0] == [1, 0, 1, 0]
        assert jam_data['pattern_json'][1] == [0, 1, 0, 1]
        
        # Verify instruments_json is parsed as array
        assert isinstance(jam_data['instruments_json'], list)
        assert jam_data['instruments_json'] == ['kick', 'snare']

    def test_jam_session_created_at_timestamp(self, test_client):
        """Test that jam sessions have proper created_at timestamps"""
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

        # Create jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Timestamp Test',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Retrieve jam session
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        jam_data = json.loads(get_response.data)
        
        # Verify timestamp fields exist
        assert 'created_at' in jam_data
        assert 'updated_at' in jam_data
        
        # Verify timestamps are not None
        assert jam_data['created_at'] is not None
        assert jam_data['updated_at'] is not None

    def test_update_jam_session_timestamp_update(self, test_client):
        """Test that updated_at timestamp is updated when jam session is modified"""
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

        # Create jam session
        create_response = test_client.post('/api/jam-sessions',
                                         headers={'Authorization': f'Bearer {token}'},
                                         json={
                                             'title': 'Timestamp Update Test',
                                             'pattern_json': [[1, 0, 1, 0]],
                                             'is_public': True
                                         })
        
        jam_id = json.loads(create_response.data)['jam_id']

        # Get initial timestamps
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        initial_data = json.loads(get_response.data)
        initial_updated_at = initial_data['updated_at']

        # Update jam session
        test_client.put(f'/api/jam-sessions/{jam_id}',
                       headers={'Authorization': f'Bearer {token}'},
                       json={
                           'title': 'Updated Timestamp Test',
                           'pattern_json': [[1, 1, 1, 1]]
                       })

        # Get updated timestamps
        get_response = test_client.get(f'/api/jam-sessions/{jam_id}')
        updated_data = json.loads(get_response.data)
        
        # Verify updated_at has changed
        assert updated_data['updated_at'] != initial_updated_at
        assert updated_data['created_at'] == initial_data['created_at']  # created_at should not change 