# BeatBridge Backend

BeatBridge is a music recommendation platform that helps users discover new music based on their preferences.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Google OAuth Setup](#google-oauth-setup)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
  - [Local Production Testing](#local-production-testing)
  - [Railway Deployment](#railway-deployment)
  - [Heroku Deployment](#heroku-deployment)
  - [Environment Configuration for Production](#environment-configuration-for-production)
  - [Healthcheck Endpoint](#healthcheck-endpoint)
- [API Documentation](#api-documentation)
- [Testing & Quality Assurance](#testing--quality-assurance)
  - [Automated Testing](#automated-testing)
  - [User Testing & Feedback](#user-testing--feedback)
  - [Best Practices](#best-practices)
  - [Future Improvements](#future-improvements)
  - [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)
- [Database Migrations](#database-migrations)
- [License](#license)

## Features
- User authentication and authorization (Email & Google OAuth)
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
- Google OAuth - Social login

## Getting Started

### Prerequisites
- Python 3.11.0
- PostgreSQL
- Last.fm API key
- Google Cloud Project (for OAuth)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/beatbridge.git
cd beatbridge/beatbridge-backend
```

2. Create and activate a virtual environment (Python 3.11.0 recommended):
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```
*If you update requirements.txt, run `pip freeze > requirements.txt` to save new dependencies.*

4. Set up environment variables:
```bash
# Create .env file from the example below
# (No .env.example file is provided, so create .env manually)
```

### Environment Variables
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
# Alternatively, you can use a full database URL (overrides above):
DATABASE_URL=postgresql://postgres:your-postgres-password@localhost:5432/flask_db

# Google OAuth Configuration (Required for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Lastfm Api Key
LASTFM_API_KEY=your-lastfm-api-key

# Frontend URL (for CORS and redirects)
FRONTEND_BASE_URL=http://localhost:3000

# Flask Environment (optional)
FLASK_ENV=development
LOCAL_DEV=1

# Port (for deployment platforms like Heroku/Railway)
PORT=5000
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google Identity API)
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth client ID**
6. Configure the consent screen (if prompted)
7. Set the following **Authorized redirect URIs**:
   - For local dev: `http://localhost:5000/api/google-login/callback`
   - For production: `https://your-domain.com/api/google-login/callback`
8. Copy the **Client ID** and **Client Secret** into your `.env`

### Running the Application
```bash
python app.py
```

The server will start at `http://localhost:5000`.

## Deployment

### Local Production Testing
To test the application with Gunicorn (production WSGI server):
```bash
gunicorn app:app
```

### Railway Deployment
The application is configured for Railway deployment with:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn app:app`
- **Healthcheck:** `GET /` (ensure your app responds to root path)

### Heroku Deployment
The `Procfile` is configured for Heroku:
```
web: gunicorn app:app
```

### Environment Configuration for Production
- **Session Storage:** The app uses filesystem sessions by default. For production, consider using Redis or database sessions.
- **CORS Origins:** Update the `ALLOWED_ORIGINS` list in `app.py` to include your production frontend URL.
- **Database:** Use `DATABASE_URL` environment variable for production databases.
- **Security:** Ensure all secret keys are properly set and not using default values.

### Healthcheck Endpoint
The application responds to `GET /` for health checks. Ensure this endpoint returns a valid response for deployment platforms.

## API Documentation

### Authentication Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/verify-email/<token>` - Verify email address
- `GET /api/user` - Get user profile (protected)

### Music Endpoints
- `GET /api/genres` - Get list of music genres
- `POST /api/recommend-song` - Get song recommendations

## Testing & Quality Assurance

### Automated Testing

Automated tests are essential to test features and fix bugs to ensure the app performs as expected. For BeatBridge, we used three main categories of automated testing:

1. Unit test: tests a single function, method or class
2. Widget test: tests a single component and how it interacts with other components in the UI framework
3. Integration test: tests a complete app or a certain navigation path of an app

#### Unit Test

Unit testing is the part of the automated testing process that contains small units of code that test specific parts of the program for their reliability. For BeatBridge, unit tests were written and conducted to focus on testing the logic behind selected functions within each of the controllers.

Test cases for unit testing include:

- AuthController tests:
  - User registration validation
  - Login authentication
  - Password hashing verification
  - Token generation and validation
  - Email verification process

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

#### Test Structure

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

#### Test Cases

##### Authentication Test Cases
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

##### Last.fm Integration Test Cases
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

#### Running Tests

##### Basic Test Execution
```bash
python -m pytest
```

##### Verbose Output
```bash
python -m pytest -v
```

##### With Coverage Report
```bash
python -m pytest --cov=.
```

#### Test Results

##### Current Status
- Total Tests: 12
- Passing: 12
- Failing: 0
- Coverage: ~85%

##### Known Issues and Warnings
1. SQLAlchemy 2.0 Compatibility Warnings
   - Related to query API changes
   - Will be addressed in future updates

2. Werkzeug AST Deprecation Warnings
   - From routing implementation
   - Will be resolved in future Werkzeug versions

3. DateTime Usage Warnings
   - Updated to use timezone-aware objects
   - Some remaining warnings from third-party libraries

#### Best Practices Implemented

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

### User Testing & Feedback

User testing was conducted with participants whose criteria meets the target audience. User testing is the process of having end users test and evaluate the product or feature.

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

### Maintenance

#### Regular Tasks
1. Update test dependencies
2. Review and update mock data
3. Monitor test performance
4. Update documentation

#### Version Control
- Tests are version controlled with the main codebase
- Test files follow the same naming convention
- Documentation is maintained in markdown format

## Troubleshooting

- **Missing Environment Variables:** Ensure all variables listed above are set in your `.env` file. The app will fail to start or behave unexpectedly if any are missing.
- **Database Connection Issues:** Double-check your `DATABASE_URL` or individual DB settings. For local dev, ensure PostgreSQL is running and accessible.
- **OAuth Errors:** Make sure your Google OAuth credentials and redirect URIs are correct in the Google Cloud Console and `.env`.
- **Port Conflicts:** If running locally, ensure port 5000 is free or set the `PORT` variable to another value.
- **Python Version:** Use Python 3.11.0 for best compatibility.
- **CORS Issues:** If you're getting CORS errors, ensure your frontend URL is in the `ALLOWED_ORIGINS` list in `app.py`.
- **Session Issues:** The app uses filesystem sessions. For production, consider using Redis or database sessions.

## Database Migrations

Database schema migrations are managed in the `migrations/` directory. To apply or create migrations:

- **Manual SQL:**
  - Migration files are provided as SQL scripts in `beatbridge-backend/migrations/`.
  - To apply a migration, run (from the backend directory):
    ```bash
    psql -U <db_user> -d flask_db -f migrations/<migration_file>.sql
    ```
    Replace `<db_user>` with your database user and `<migration_file>.sql` with the migration script name. The default database name is `flask_db` (as set in your environment variables).

- **With Flask-Migrate (if enabled):**
  - If you add Flask-Migrate, you can use:
    ```bash
    flask db migrate -m "Migration message"
    flask db upgrade
    ```
  - (Currently, migrations are managed via SQL scripts.)

- **Best Practice:**
  - Always back up your database before applying new migrations.
  - Review each migration script before running it in production.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 