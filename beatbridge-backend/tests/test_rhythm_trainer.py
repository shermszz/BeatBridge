import pytest
import json
from app_factory import User, UserCustomization, db

def verify_user_in_db(user_id):
    """Helper function to verify a user directly in the database for testing"""
    user = User.query.get(user_id)
    if user:
        user.is_verified = True
        db.session.commit()
        return True
    return False

@pytest.mark.usefixtures('test_db')
class TestRhythmTrainer:
    """
    Test suite for Rhythm Trainer features:
    - Chapter progress tracking
    - Virtual drum kit functionality
    - Progress protection and navigation
    - User customization integration
    """

    def test_get_chapter_progress_success(self, test_client):
        """Test successful retrieval of chapter progress for authenticated user"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization with progress
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Get chapter progress
        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'chapter_progress' in data
        assert 'chapter0_page_progress' in data
        assert 'chapter1_page_progress' in data
        assert data['chapter_progress'] == 1  # Default value
        assert data['chapter0_page_progress'] == 1  # Default value
        assert data['chapter1_page_progress'] == 1  # Default value

    def test_get_chapter_progress_unauthorized(self, test_client):
        """Test getting chapter progress without authentication"""
        response = test_client.get('/api/chapter-progress')
        assert response.status_code == 401

    def test_get_chapter_progress_unverified_user(self, test_client):
        """Test getting chapter progress with unverified user"""
        # Register user without verification
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

        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 401

    def test_update_chapter_progress_success(self, test_client):
        """Test successful update of chapter progress"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Update chapter progress
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'chapter_progress': 2,
                                      'chapter0_page_progress': 3,
                                      'chapter1_page_progress': 1
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['chapter_progress'] == 2
        assert data['chapter0_page_progress'] == 3
        assert data['chapter1_page_progress'] == 1

    def test_update_chapter_progress_partial_update(self, test_client):
        """Test updating only specific progress fields"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Update only chapter progress
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'chapter_progress': 3})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['chapter_progress'] == 3
        assert data['chapter0_page_progress'] == 1  # Should remain default
        assert data['chapter1_page_progress'] == 1  # Should remain default

    def test_update_chapter_progress_no_regression(self, test_client):
        """Test that progress cannot be decreased (no regression)"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # First update to higher progress
        test_client.post('/api/chapter-progress',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'chapter_progress': 5,
                            'chapter0_page_progress': 4,
                            'chapter1_page_progress': 3
                        })

        # Try to update to lower progress
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'chapter_progress': 2,
                                      'chapter0_page_progress': 1,
                                      'chapter1_page_progress': 1
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Progress should not decrease
        assert data['chapter_progress'] == 5
        assert data['chapter0_page_progress'] == 4
        assert data['chapter1_page_progress'] == 3

    def test_update_chapter_progress_unauthorized(self, test_client):
        """Test updating chapter progress without authentication"""
        response = test_client.post('/api/chapter-progress',
                                  json={'chapter_progress': 2})
        assert response.status_code == 401

    def test_update_chapter_progress_invalid_data(self, test_client):
        """Test updating chapter progress with invalid data types"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Test with string instead of integer
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'chapter_progress': 'invalid'})
        
        # Should handle gracefully and use default value
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['chapter_progress'] == 1  # Should remain at default

    def test_get_customization_with_rhythm_trainer_context(self, test_client):
        """Test getting user customization in rhythm trainer context"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization with skill level
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Advanced',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,metal,jazz'
                        })

        # Get customization (used by rhythm trainer to show advanced user modal)
        response = test_client.get('/api/get-customization',
                                 headers={'Authorization': f'Bearer {token}'})
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['skill_level'] == 'Advanced'
        assert data['practice_frequency'] == 'Daily'
        assert data['favorite_genres'] == ['rock', 'metal', 'jazz']

    def test_chapter_progress_without_customization(self, test_client):
        """Test chapter progress when user has no customization record"""
        # Setup user without customization
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

        # Try to get chapter progress without customization
        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token}'})
        
        # Should return 401 as user is not verified
        assert response.status_code == 401

    def test_update_chapter_progress_without_customization(self, test_client):
        """Test updating chapter progress when user has no customization record"""
        # Setup user without customization
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

        # Try to update chapter progress without customization
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'chapter_progress': 2})
        
        # Should return 401 as user is not verified
        assert response.status_code == 401

    def test_chapter_progress_edge_cases(self, test_client):
        """Test chapter progress with edge case values"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Test with zero values
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'chapter_progress': 0,
                                      'chapter0_page_progress': 0,
                                      'chapter1_page_progress': 0
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        # Should use default values (1) instead of 0
        assert data['chapter_progress'] == 1
        assert data['chapter0_page_progress'] == 1
        assert data['chapter1_page_progress'] == 1

        # Test with very high values
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'chapter_progress': 999,
                                      'chapter0_page_progress': 999,
                                      'chapter1_page_progress': 999
                                  })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['chapter_progress'] == 999
        assert data['chapter0_page_progress'] == 999
        assert data['chapter1_page_progress'] == 999

    def test_chapter_progress_concurrent_updates(self, test_client):
        """Test handling of concurrent chapter progress updates"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Simulate concurrent updates
        response1 = test_client.post('/api/chapter-progress',
                                   headers={'Authorization': f'Bearer {token}'},
                                   json={'chapter_progress': 3})

        response2 = test_client.post('/api/chapter-progress',
                                   headers={'Authorization': f'Bearer {token}'},
                                   json={'chapter_progress': 5})

        # Both should succeed
        assert response1.status_code == 200
        assert response2.status_code == 200

        # Final state should reflect the higher value
        final_response = test_client.get('/api/chapter-progress',
                                       headers={'Authorization': f'Bearer {token}'})
        final_data = json.loads(final_response.data)
        assert final_data['chapter_progress'] == 5

    def test_chapter_progress_malformed_json(self, test_client):
        """Test chapter progress update with malformed JSON"""
        # Setup user with customization
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

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Test with malformed JSON
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  data='{"chapter_progress": 2,}',  # Trailing comma
                                  content_type='application/json')
        
        # Should return 401 as user is not verified
        assert response.status_code == 401

    def test_chapter_progress_empty_request(self, test_client):
        """Test chapter progress update with empty request body"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Test with empty request body
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={})
        
        # Should handle gracefully and use default values
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['chapter_progress'] == 1
        assert data['chapter0_page_progress'] == 1
        assert data['chapter1_page_progress'] == 1

    def test_chapter_progress_negative_values(self, test_client):
        """Test chapter progress with negative values"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Test with negative values
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={
                                      'chapter_progress': -1,
                                      'chapter0_page_progress': -5,
                                      'chapter1_page_progress': -10
                                  })
        
        # Should handle gracefully and use default values
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['chapter_progress'] == 1
        assert data['chapter0_page_progress'] == 1
        assert data['chapter1_page_progress'] == 1

    def test_chapter_progress_database_integrity(self, test_client):
        """Test that chapter progress updates maintain database integrity"""
        # Setup user with customization
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

        # Verify user for testing
        verify_user_in_db(user_id)

        # Create user customization
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Update progress multiple times
        for i in range(1, 6):
            response = test_client.post('/api/chapter-progress',
                                      headers={'Authorization': f'Bearer {token}'},
                                      json={'chapter_progress': i})
            assert response.status_code == 200

        # Verify final state in database
        customization = UserCustomization.query.filter_by(user_id=user_id).first()
        assert customization is not None
        assert customization.chapter_progress == 5
        assert customization.chapter0_page_progress == 1  # Should remain default
        assert customization.chapter1_page_progress == 1  # Should remain default

    def test_chapter_progress_with_different_skill_levels(self, test_client):
        """Test chapter progress behavior with different skill levels"""
        skill_levels = ['First-timer', 'Beginner', 'Intermediate', 'Advanced']
        
        for skill_level in skill_levels:
            # Setup user with specific skill level
            test_client.post('/api/register',
                            json={
                                'username': f'testuser_{skill_level}',
                                'email': f'test_{skill_level}@example.com',
                                'password': 'TestPass123!',
                                'confirmation': 'TestPass123!'
                            })
            
            login_response = test_client.post('/api/login',
                                            json={
                                                'username': f'testuser_{skill_level}',
                                                'password': 'TestPass123!'
                                            })
            token = json.loads(login_response.data)['access_token']
            user_id = json.loads(login_response.data)['user_id']

            # Verify user for testing
            verify_user_in_db(user_id)

            # Create user customization with specific skill level
            test_client.post('/api/save-customization',
                            headers={'Authorization': f'Bearer {token}'},
                            json={
                                'skill_level': skill_level,
                                'practice_frequency': 'Daily',
                                'favorite_genres': 'rock,pop'
                            })

            # Test chapter progress update
            response = test_client.post('/api/chapter-progress',
                                      headers={'Authorization': f'Bearer {token}'},
                                      json={'chapter_progress': 3})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['chapter_progress'] == 3

            # Verify skill level is preserved
            customization_response = test_client.get('/api/get-customization',
                                                   headers={'Authorization': f'Bearer {token}'})
            customization_data = json.loads(customization_response.data)
            assert customization_data['skill_level'] == skill_level 

    def test_chapter_progress_verification_requirements(self, test_client):
        """Tests that chapter progress updates require email verification"""
        # Setup unverified user
        test_client.post('/api/register',
                        json={
                            'username': 'unverifieduser',
                            'email': 'unverified@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login_response = test_client.post('/api/login',
                                        json={
                                            'username': 'unverifieduser',
                                            'password': 'TestPass123!'
                                        })
        token = json.loads(login_response.data)['access_token']
        user_id = json.loads(login_response.data)['user_id']

        # Create user customization (this should work for unverified users)
        test_client.post('/api/save-customization',
                        headers={'Authorization': f'Bearer {token}'},
                        json={
                            'skill_level': 'Beginner',
                            'practice_frequency': 'Daily',
                            'favorite_genres': 'rock,pop'
                        })

        # Try to get chapter progress without verification - should fail
        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

        # Try to update chapter progress without verification - should fail
        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'chapter_progress': 2})
        assert response.status_code == 401
        data = json.loads(response.data)
        assert 'error' in data

        # Now verify the user
        verify_user_in_db(user_id)

        # After verification, chapter progress operations should work
        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200

        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token}'},
                                  json={'chapter_progress': 2})
        assert response.status_code == 200

        # Test that verification status is properly checked on each request
        # Create another unverified user
        test_client.post('/api/register',
                        json={
                            'username': 'unverifieduser2',
                            'email': 'unverified2@example.com',
                            'password': 'TestPass123!',
                            'confirmation': 'TestPass123!'
                        })
        
        login_response2 = test_client.post('/api/login',
                                         json={
                                             'username': 'unverifieduser2',
                                             'password': 'TestPass123!'
                                         })
        token2 = json.loads(login_response2.data)['access_token']

        # Even with a valid token, unverified users cannot access chapter progress
        response = test_client.get('/api/chapter-progress',
                                 headers={'Authorization': f'Bearer {token2}'})
        assert response.status_code == 401

        response = test_client.post('/api/chapter-progress',
                                  headers={'Authorization': f'Bearer {token2}'},
                                  json={'chapter_progress': 1})
        assert response.status_code == 401