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

---

## Troubleshooting & FAQ
- If you encounter database errors, ensure your environment variables are set and migrations are applied.
- For email issues, check your SMTP credentials and app password.
- For OAuth issues, verify your Google Cloud credentials and redirect URIs.
- For production, always use secure, unique secret keys and environment variables.

--- 