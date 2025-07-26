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

# Quality Control

## Automated Testing

Automated tests are essential to test features and fix bugs to ensure the app performs as expected. For BeatBridge, we used three main categories of automated testing:

1. Unit test: tests a single function, method or class
2. Widget test: tests a single component and how it interacts with other components in the UI framework
3. Integration test: tests a complete app or a certain navigation path of an app

### Unit Test

Unit testing is the part of the automated testing process that contains small units of code that test specific parts of the program for their reliability. For BeatBridge, unit tests were written and conducted to focus on testing the logic behind selected functions within each of the controllers.

Test cases for unit testing include:

- **Authentication Feature (test_auth.py)**
  - **User Registration Validation**: Ensures users cannot register with duplicate usernames or emails, and validates password confirmation matching
  - **Login Authentication**: Verifies correct and incorrect login attempts, including support for both username and email login
  - **Password Hashing Verification**: Confirms that passwords are securely hashed using Werkzeug's security functions and properly validated
  - **Token Generation and Validation**: Tests JWT creation, decoding, and validation for user sessions and protected route access
  - **Email Verification Process**: Tests the sending and validation of email verification tokens for new user accounts
  - **Password Reset Flow**: Comprehensive testing of the complete password reset process including OTP generation, verification, and password reset
  - **Google OAuth Integration**: Tests Google authentication flow including user creation, account linking, and dual login support
  - **Protected Route Access**: Validates that protected endpoints require proper authentication tokens
  - **Password Setting for Google Users**: Tests the ability for Google users to set traditional passwords for dual login capability

### Authentication Test Cases (test_auth.py)

The authentication system includes **23 comprehensive test cases** covering all aspects of user authentication and security:

#### **Traditional Authentication Tests (7 tests)**
1. **`test_registration_success`**: Validates successful user registration with proper credentials and email verification token generation
2. **`test_registration_password_mismatch`**: Ensures registration fails when password and confirmation do not match
3. **`test_login_success`**: Tests successful login with valid username and password, returning JWT access token
4. **`test_login_with_email`**: Verifies users can login using email address instead of username
5. **`test_login_invalid_credentials`**: Confirms login failure with invalid username/password combinations
6. **`test_protected_route_access`**: Tests access control to protected routes with and without authentication tokens
7. **`test_email_verification`**: Validates the email verification process using JWT tokens

#### **Password Reset Flow Tests (7 tests)**
8. **`test_forgot_password_success`**: Tests successful password reset request for existing email addresses
9. **`test_forgot_password_email_not_found`**: Validates proper error handling for non-existent email addresses
10. **`test_forgot_password_missing_email`**: Ensures proper validation when email is not provided
11. **`test_verify_otp_success`**: Tests successful OTP verification using in-memory storage
12. **`test_verify_otp_invalid`**: Validates OTP verification failure with incorrect codes
13. **`test_reset_password_success`**: Tests successful password reset after OTP verification
14. **`test_reset_password_user_not_found`**: Ensures proper error handling for non-existent users during password reset

#### **Google OAuth Integration Tests (5 tests)**
15. **`test_google_login_redirect`**: Validates Google OAuth redirect to Google's authentication page
16. **`test_google_login_callback_new_user`**: Tests Google OAuth callback creating new users when they don't exist
17. **`test_google_login_callback_existing_user`**: Verifies Google OAuth callback linking existing users with Google IDs
18. **`test_google_login_callback_no_code`**: Tests proper error handling when no authorization code is provided
19. **`test_google_user_login_with_placeholder_password`**: Ensures Google users cannot login with placeholder passwords using traditional login

#### **Dual Login Support Tests (4 tests)**
20. **`test_google_user_login_with_set_password`**: Tests that Google users can login with traditional credentials after setting a real password
21. **`test_set_password_success`**: Validates successful password setting for authenticated users
22. **`test_set_password_unauthorized`**: Ensures password setting fails when users are not authenticated
23. **`test_set_password_missing_password`**: Validates proper error handling when new password is not provided

### Authentication Security Features

- **Secure Password Hashing**: Uses Werkzeug's `generate_password_hash` and `check_password_hash` for secure password storage
- **JWT Token Management**: Implements secure JWT tokens with expiration for stateless session management
- **OTP-Based Password Reset**: Secure one-time password system for password recovery
- **Google OAuth Integration**: Seamless Google authentication with account linking and dual login support
- **Protected Route Security**: All sensitive endpoints require valid JWT authentication
- **Input Validation**: Comprehensive validation for all user inputs to prevent security vulnerabilities

- LastFMController tests:
  - API integration verification
  - Genre data retrieval
  - Song recommendation logic
  - Error handling for API responses
  - Data transformation accuracy

- UserPreferencesController tests:
  - Genre preference storage
  - User customization settings
  - Profile data management
  - Settings validation

## User Testing

Apart from automated testing, user testing was conducted with participants whose criteria meets the target audience. User testing is the process of having end users test and evaluate the product or feature.

We utilized Donald A. Norman's seven fundamental design principles to help us test and understand how users interact with the app. In short, the principles we used are:

1. Discoverability: Allows the user to understand where to perform actions.
   - Clear navigation menu structure
   - Intuitive button placements
   - Visible music controls
   - Easy-to-find recommendation features

2. Conceptual Models: Are simple explanations of how something works.
   - Visual representation of music preferences
   - Clear genre selection process
   - Straightforward recommendation flow
   - Simple profile customization interface

3. Affordance: Refers to the perceived properties of an object.
   - Clickable buttons with hover effects
   - Scrollable song lists
   - Interactive genre tags
   - Draggable volume controls

4. Mappings: Are the relationships between the controls and their effects.
   - Volume slider corresponds to sound level
   - Genre selection directly affects recommendations
   - Profile changes reflect immediately
   - Rating system impacts future suggestions

5. Signifiers: Tell the user exactly where to perform an action.
   - Highlighted call-to-action buttons
   - Clear input field labels
   - Prominent "Get Recommendations" button
   - Visual feedback for interactive elements

6. Constraints: Restrict the interactions that can take place.
   - Limited genre selections per session
   - Maximum profile picture size
   - Required fields in registration
   - Time restrictions between recommendations

7. Feedback: Communicates the response of a user's action.
   - Loading indicators during API calls
   - Success/error messages
   - Visual confirmation of selections
   - Real-time update notifications

### Testing Process

Testers were first tasked with a specific task and a cognitive walkthrough was done with the Home Page as their initial starting point. Their actions and thinking processes were taken down to allow us to gain valuable insights as to how to improve the app and overall user experience.

#### Test Scenarios

1. New User Registration Flow
   - Create a new account
   - Verify email address
   - Complete profile setup
   - Set initial music preferences

2. Music Discovery Journey
   - Select preferred genres
   - Get song recommendations
   - Rate recommended songs
   - Save favorites to profile

3. Profile Customization
   - Upload profile picture
   - Update personal information
   - Modify genre preferences
   - Adjust recommendation settings

4. Social Integration
   - Connect with Last.fm account
   - Share recommendations
   - View music history
   - Explore similar users' preferences

### User Feedback Collection

Feedback was collected through multiple channels:

1. In-person observation
   - User behavior monitoring
   - Task completion time
   - Navigation patterns
   - Error occurrence

2. Post-test surveys
   - Ease of use rating
   - Feature satisfaction
   - Interface clarity
   - Overall experience

3. User interviews
   - Pain points discussion
   - Feature suggestions
   - Improvement priorities
   - General impressions

### Key Findings

1. Navigation
   - 90% of users found the main navigation intuitive
   - Some users suggested adding breadcrumbs
   - Mobile menu needed more visibility

2. Recommendation System
   - Users appreciated the genre-based filtering
   - Some wanted more granular subgenre options
   - Loading times were acceptable
   - More variety in recommendations requested

3. User Interface
   - Clean and modern design well-received
   - Color scheme helped with readability
   - Some icons needed better tooltips
   - Mobile responsiveness highly rated

4. Performance
   - App responded well to user interactions
   - Minimal loading delays
   - Smooth transitions between pages
   - No major crashes reported

### Improvements Implemented

Based on user testing feedback, we implemented several improvements:

1. User Interface
   - Added tooltips to all interactive elements
   - Improved mobile navigation
   - Enhanced contrast for better accessibility
   - Simplified the recommendation flow

2. Functionality
   - Added subgenre selections
   - Implemented "quick filters" for recommendations
   - Enhanced profile customization options
   - Improved email verification process

3. Performance
   - Optimized API calls
   - Implemented better caching
   - Reduced initial load time
   - Added offline support for saved songs

### Future Considerations

Areas identified for future improvement:

1. Enhanced Personalization
   - AI-driven recommendations
   - Custom playlist creation
   - Mood-based filtering
   - Personal listening statistics

2. Social Features
   - Friend recommendations
   - Shared playlists
   - Music taste compatibility
   - Community features

3. Technical Enhancements
   - Real-time collaborative features
   - Advanced search capabilities
   - Multiple streaming service integration
   - Enhanced mobile app features 