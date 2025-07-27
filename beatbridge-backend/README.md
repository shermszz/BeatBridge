# BeatBridge Backend

BeatBridge is a music recommendation and rhythm training platform that helps users discover new music, track progress, and collaborate on jam sessions.

## Features
- User authentication and authorization (Email & Google OAuth)
- Email verification and password reset
- Music genre management
- Song recommendations using Last.fm API
- JWT-based API security
- User profile customization and profile picture upload
- Jam session creation, editing, sharing, and exploration
- Chapter/page progress tracking
- Favorites management
- Shared loops and collaboration

## Tech Stack
- Python/Flask - Backend framework
- PostgreSQL - Production database
- SQLite - Testing database
- Last.fm API - Music data and recommendations
- JWT/Flask-Login - Authentication
- Flask-Mail - Email services
- Google OAuth - Social login
- Gunicorn - Production WSGI server

## Getting Started

### Prerequisites
- Python 3.10+
- PostgreSQL
- Last.fm API key
- Google Cloud Project (for OAuth)

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
# Edit .env with your configuration (see below)
```

### Database Migrations
If you make changes to the database schema, apply migrations using the provided SQL files in the `migrations/` directory. For production, use a tool like `psql` to apply migrations to your PostgreSQL database.

### Running the Application

#### Development
```bash
python app.py
```
The server will start at `http://localhost:5000`.

#### Production (Recommended)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Environment Variables
Create a `.env` file in `beatbridge-backend/` with the following variables:

```
# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# Security Configuration
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key

# Database Configuration
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flask_db

# Google OAuth Configuration (Required for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Lastfm Api Key
LASTFM_API_KEY=your-lastfm-api-key
```

---

## API Endpoints

| Method | Endpoint                                      | Description                                 | Auth Required |
|--------|-----------------------------------------------|---------------------------------------------|--------------|
| POST   | /api/register                                 | Register a new user                         | No           |
| POST   | /api/login                                    | User login                                  | No           |
| POST   | /api/logout                                   | User logout                                 | Yes          |
| GET    | /api/user                                     | Get user profile                            | Yes          |
| POST   | /api/update-user                              | Update user profile                         | Yes          |
| POST   | /api/verify-email                             | Request email verification                  | No           |
| GET    | /api/verify-email/<token>                     | Verify email address                        | No           |
| POST   | /api/forgot-password                          | Request password reset email                | No           |
| POST   | /api/verify-otp                               | Verify OTP for password reset               | No           |
| POST   | /api/reset-password                           | Reset password using OTP                    | No           |
| POST   | /api/set-password                             | Set new password (after reset)              | No           |
| POST   | /api/google-login                             | Start Google OAuth login                    | No           |
| GET    | /api/google-login/callback                    | Google OAuth callback                       | No           |
| GET    | /api/genres                                   | Get list of music genres                    | No           |
| POST   | /api/recommend-song                           | Get song recommendations                    | No           |
| GET    | /api/favorites                                | Get user favorites                          | Yes          |
| POST   | /api/favorites                                | Add to favorites                            | Yes          |
| DELETE | /api/favorites/<favorite_id>                  | Remove from favorites                       | Yes          |
| GET    | /api/get-customization                        | Get user customization                      | Yes          |
| POST   | /api/save-customization                       | Save user customization                     | Yes          |
| POST   | /api/upload-profile-pic                       | Upload profile picture                      | Yes          |
| GET    | /uploads/profile_pics/<filename>              | Get profile picture                         | No           |
| POST   | /api/jam-sessions                             | Create a new jam session                    | Yes          |
| PUT    | /api/jam-sessions/<jam_id>                    | Update a jam session                        | Yes          |
| GET    | /api/jam-sessions/<jam_id>                    | Get a jam session by ID                     | Yes          |
| DELETE | /api/jam-sessions/<jam_id>                    | Delete a jam session                        | Yes          |
| GET    | /api/jam-sessions/user/<user_id>              | Get all jam sessions for a user             | Yes          |
| GET    | /api/jam-sessions/explore                     | Explore public jam sessions                 | No           |
| POST   | /api/shared-loops                             | Share a jam session loop                    | Yes          |
| GET    | /api/shared-loops/<share_id>                  | Get shared loop info                        | Yes          |
| POST   | /api/shared-loops/<share_id>/accept           | Accept a shared loop                        | Yes          |
| POST   | /api/shared-loops/<share_id>/reject           | Reject a shared loop                        | Yes          |
| GET    | /api/chapter-progress                         | Get chapter/page progress                   | Yes          |
| POST   | /api/chapter-progress                         | Update chapter/page progress                | Yes          |
| POST   | /api/check-verification-status                | Check if user is verified                   | Yes          |

---

## Testing

### Running Tests
```bash
python -m pytest
```

### With Coverage Report
```bash
python -m pytest --cov=.
```

Tests use an in-memory SQLite database and mock external services for isolation.

---

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