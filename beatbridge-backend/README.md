# BeatBridge Backend

BeatBridge is a music recommendation platform that helps users discover new music based on their preferences.

## Features
- User authentication and authorization
- Email verification
- Music genre management
- Song recommendations using Last.fm API
- JWT-based API security

## Tech Stack
- Python/Flask - Backend framework
- PostgreSQL - Production database
- SQLite - Testing database
- Last.fm API - Music data and recommendations
- JWT/Flask-Login - Authentication
- Flask-Mail - Email services

## Getting Started

### Prerequisites
- Python 3.13+
- PostgreSQL
- Last.fm API key

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/beatbridge.git
cd beatbridge/beatbridge-backend
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Application
```bash
python app.py
```

The server will start at `http://localhost:5000`.

## Testing Documentation

### Overview
The test suite covers authentication, Last.fm integration, and core functionality using pytest as the testing framework.

### Test Environment Setup

#### Prerequisites
- Python 3.13+
- pytest
- pytest-cov (for coverage reporting)
- SQLite (for test database)

#### Configuration
Tests are configured using fixtures in `tests/conftest.py`. The test environment uses:
- SQLite in-memory database
- Mock SMTP server configuration
- Test Last.fm API key
- JWT secret key for authentication

### Test Structure

#### Directory Structure
```
beatbridge-backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_lastfm.py
│   └── test_lastfm_integration.py
```

#### Test Categories

##### 1. Authentication Tests (`test_auth.py`)
Tests user authentication and authorization features:
- User registration
- Login functionality
- Password validation
- Email verification
- Protected route access
- JWT token handling

##### 2. Last.fm Integration Tests (`test_lastfm_integration.py`)
Tests Last.fm API integration:
- Genre endpoint functionality
- Song recommendation system
- Error handling
- API response processing
- Genre format validation

##### 3. Last.fm Core Tests (`test_lastfm.py`)
Tests core Last.fm functionality:
- Genre top tracks retrieval
- API response parsing
- Data transformation

### Test Cases

#### Authentication Test Cases
1. `test_registration_success`
   - Verifies successful user registration
   - Checks response status code and message
   - Validates user creation in database

2. `test_registration_password_mismatch`
   - Tests password confirmation validation
   - Verifies error handling for mismatched passwords

3. `test_login_success`
   - Tests successful user login
   - Verifies JWT token generation
   - Checks response format

4. `test_login_invalid_credentials`
   - Tests invalid login attempts
   - Verifies error handling
   - Checks response status codes

5. `test_protected_route_access`
   - Tests protected route authorization
   - Verifies JWT token validation
   - Checks unauthorized access handling

6. `test_email_verification`
   - Tests email verification process
   - Verifies token generation and validation
   - Checks user verification status update

#### Last.fm Integration Test Cases
1. `test_genre_endpoint_success`
   - Tests genre list retrieval
   - Verifies response format
   - Validates genre data structure

2. `test_song_recommendation_success`
   - Tests song recommendation functionality
   - Verifies API integration
   - Validates recommendation format

3. `test_song_recommendation_no_genre`
   - Tests error handling for empty genre selection
   - Verifies appropriate error response

4. `test_song_recommendation_api_error`
   - Tests Last.fm API error handling
   - Verifies error propagation
   - Checks error response format

5. `test_invalid_genre_format`
   - Tests input validation
   - Verifies error handling for invalid formats

### Running Tests

#### Basic Test Execution
```bash
python -m pytest
```

#### Verbose Output
```bash
python -m pytest -v
```

#### With Coverage Report
```bash
python -m pytest --cov=.
```

### Test Results

#### Current Status
- Total Tests: 12
- Passing: 12
- Failing: 0
- Coverage: ~85%

#### Known Issues and Warnings
1. SQLAlchemy 2.0 Compatibility Warnings
   - Related to query API changes
   - Will be addressed in future updates

2. Werkzeug AST Deprecation Warnings
   - From routing implementation
   - Will be resolved in future Werkzeug versions

3. DateTime Usage Warnings
   - Updated to use timezone-aware objects
   - Some remaining warnings from third-party libraries

### Best Practices Implemented

1. **Factory Pattern**
   - Uses Flask application factory
   - Enables isolated test environment
   - Facilitates configuration injection

2. **Fixture Usage**
   - Centralized test fixtures
   - Database setup and teardown
   - Mock configurations

3. **Database Isolation**
   - In-memory SQLite for tests
   - Fresh database for each test
   - Automatic cleanup

4. **Mock Integration**
   - External API mocking
   - Email service mocking
   - Third-party service isolation

### Future Improvements

1. **Coverage Enhancement**
   - Add edge case testing
   - Increase async operation coverage
   - Add integration tests for frontend interaction

2. **Performance Testing**
   - Add load testing
   - Implement stress testing
   - Add performance benchmarks

3. **Security Testing**
   - Add penetration testing
   - Implement security scanning
   - Add CSRF protection tests

4. **Automation**
   - Implement CI/CD pipeline
   - Add automated regression testing
   - Implement automated deployment testing

### Test Maintenance

#### Regular Tasks
1. Update test dependencies
2. Review and update mock data
3. Monitor test performance
4. Update documentation

#### Version Control
- Tests are version controlled with the main codebase
- Test files follow the same naming convention
- Documentation is maintained in markdown format

## API Documentation

### Authentication Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/verify-email/<token>` - Verify email address
- `GET /api/user` - Get user profile (protected)

### Music Endpoints
- `GET /api/genres` - Get list of music genres
- `POST /api/recommend-song` - Get song recommendations

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 