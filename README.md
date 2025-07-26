# BeatBridge

BeatBridge is a full-stack music learning and recommendation platform. It helps users discover new music, train rhythm skills, track progress, and collaborate on jam sessions—all in one place.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Quick Start](#quick-start)
6. [Deployment](#deployment)
7. [Contributing](#contributing)
8. [License](#license)

---

## Project Overview

BeatBridge consists of:
- **Backend (Flask/Python):** REST API, authentication, user management, music recommendations, jam sessions, progress tracking, and more.
- **Frontend (React):** Modern UI for music discovery, rhythm training, jam session creation, and user profile management.

For detailed backend and frontend documentation, see:
- [`beatbridge-backend/README.md`](./beatbridge-backend/README.md) - Complete backend setup, API documentation, testing, and troubleshooting
- [`beatbridge-frontend/`](./beatbridge-frontend/) - Frontend source code

---

## Directory Structure

```
BridgeBeat/
├── beatbridge-backend/                # Flask backend (API, DB, migrations, tests)
│   ├── app.py                         # Main Flask application
│   ├── app_factory.py                 # Flask app factory & models
│   ├── requirements.txt               # Python dependencies
│   ├── Procfile                       # Deployment config
│   ├── runtime.txt                    # Python version for deployment
│   ├── beatbridge.dp                  # Project-specific file
│   ├── railway.toml                   # Railway deployment config
│   ├── .cache                         # (Cache file)
│   ├── flask_session/                 # Flask session files
│   ├── instance/                      # Flask instance folder
│   ├── migrations/                    # SQL migration scripts
│   │   ├── create_users.sql
│   │   ├── create_jam_sessions.sql
│   │   ├── create_shared_loops.sql
│   │   ├── create_user_customizations.sql
│   │   ├── create_user_favorites.sql
│   │   ├── add_profile_pic_url.sql
│   │   ├── add_verification_fields.sql
│   │   ├── add_favorite_fields.sql
│   │   ├── add_jam_session_fields.sql
│   │   ├── add_chapter_progress.sql
│   │   ├── add_chapter0_page_progress.sql
│   │   ├── add_chapter1_page_progress.sql
│   │   └── setup_tables.sql
│   ├── uploads/                       # User uploads (profile pictures)
│   │   └── profile_pics/
│   └── tests/                         # Backend test scripts
│       ├── test_auth.py
│       ├── test_favorites.py
│       ├── test_jam_sessions.py
│       ├── test_lastfm.py
│       ├── test_lastfm_integration.py
│       ├── test_user_customization.py
│       ├── conftest.py
│       └── __init__.py
├── beatbridge-frontend/               # React frontend (UI, user experience, and static assets)
│   ├── package.json                   # Node.js dependencies
│   ├── netlify.toml                   # Netlify deployment config
│   ├── vercel.json                    # Vercel deployment config
│   ├── public/                        # Static assets (images, sounds, icons)
│   │   ├── Beatbridge.png
│   │   ├── JamSessionImage.jpg
│   │   ├── RhythmTrainerImage.jpg
│   │   ├── SongRecommendationImage.jpg
│   │   ├── virtualDrumKit.jpg
│   │   ├── WithoutDrumKitImage.png
│   │   ├── jianwei-pic.jpg
│   │   ├── sperms-pic.jpg
│   │   ├── landingMainIcon.jpg
│   │   ├── loginIcon.svg
│   │   ├── googleIcon.png
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   ├── _redirects
│   │   ├── RhythmTrainerIcons/
│   │   │   ├── ladder.png
│   │   │   ├── lightning.png
│   │   │   ├── music-note.png
│   │   │   └── target.png
│   │   ├── Chapter0/
│   │   │   ├── crotchet.png
│   │   │   ├── crotchet-rest.png
│   │   │   ├── minim.png
│   │   │   ├── minim-rest.png
│   │   │   ├── quaver.png
│   │   │   ├── quaver-rest.png
│   │   │   ├── semibreve.png
│   │   │   ├── semibreve-rest.png
│   │   │   ├── semiquaver.png
│   │   │   └── semiquaver-rest.png
│   │   └── sounds/
│   │       ├── Crash.mp3
│   │       ├── Floor Tom.mp3
│   │       ├── Hi-Hat.mp3
│   │       ├── High Tom.mp3
│   │       ├── Kick.mp3
│   │       ├── Low Tom.mp3
│   │       ├── Open Hihat.mp3
│   │       ├── Ride.mp3
│   │       └── Snare.mp3
│   ├── src/                           # React source code
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── config.js                  # API config
│   │   ├── components/                # Reusable React components
│   │   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ProgressProtectedRoute.jsx
│   │   ├── Chapter1ProgressProtectedRoute.jsx
│   │   └── ShareLoopsModal.jsx
│   │   ├── pages/                     # Page components
│   │   │   ├── Home.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── About.jsx
│   │   ├── Customisation.jsx
│   │   ├── EmailVerification.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── VerifyOTP.jsx
│   │   ├── GoogleAuthSuccess.jsx
│   │   ├── RhythmTrainer.jsx
│   │   ├── RhythmTrainerChapters.jsx
│   │   ├── JamSession.jsx
│   │   ├── SongRecommendation.jsx
│   │   ├── SharedLoops.jsx
│   │   ├── Chapter0/
│   │   │   ├── Chapter0Dashboard.jsx
│   │   │   ├── Chapter0pg1.jsx
│   │   │   ├── Chapter0pg2.jsx
│   │   │   ├── Chapter0pg3.jsx
│   │   │   ├── Chapter0pg4.jsx
│   │   │   ├── Chapter0pg5.jsx
│   │   │   └── Chapter0pg6.jsx
│   │   ├── Chapter1/
│   │   │   ├── Chapter1Dashboard.jsx
│   │   │   ├── Chapter1pg1.jsx
│   │   │   ├── Chapter1pg2.jsx
│   │   │   ├── Chapter1pg3.jsx
│   │   │   ├── Chapter1pg4.jsx
│   │   │   ├── Chapter1pg5.jsx
│   │   │   └── Chapter1pg6.jsx
│   │   └── Chapter3/
│   │       └── Chapter3pg1.jsx
│   │   ├── styles/                    # CSS styles and images
│   │   │   ├── App.css
│   │   │   ├── AuthFlow.css
│   │   │   ├── Header.css
│   │   │   ├── Home.css
│   │   │   ├── Landing.css
│   │   │   ├── Login.css
│   │   │   ├── Register.css
│   │   │   ├── Profile.css
│   │   │   ├── Customisation.css
│   │   │   ├── RhythmTrainer.css
│   │   │   ├── RhythmTrainerChapters.css
│   │   │   ├── JamSession.css
│   │   │   ├── SongRecommendation.css
│   │   │   ├── SharedLoops.css
│   │   │   ├── ShareLoopsModal.css
│   │   │   ├── images/
│   │   │   │   ├── Beatbridge.png
│   │   │   │   ├── loginIcon.svg
│   │   │   │   ├── googleIcon.png
│   │   │   │   ├── landingMainIcon.jpg
│   │   │   │   ├── jianwei-pic.jpg
│   │   │   │   ├── sperms-pic.jpg
│   │   │   │   ├── virtualDrumKit.jpg
│   │   │   │   ├── WithoutDrumKitImage.png
│   │   │   │   ├── JamSessionImage.jpg
│   │   │   │   ├── RhythmTrainerImage.jpg
│   │   │   │   ├── SongRecommendationImage.jpg
│   │   │   │   ├── RhythmTrainerIcons/
│   │   │   │   └── Chapter0/
│   │   │   ├── Chapter0/
│   │   │   │   ├── Chapter0Dashboard.css
│   │   │   │   ├── Chapter0pg1-3.css
│   │   │   │   ├── Chapter0pg4.css
│   │   │   │   └── Chapter0pg5.css
│   │   │   ├── Chapter1/
│   │   │   │   ├── Chapter1Dashboard.css
│   │   │   │   ├── Chapter1pg1.css
│   │   │   │   ├── Chapter1pg2.css
│   │   │   │   ├── Chapter1pg3.css
│   │   │   │   ├── Chapter1pg4.css
│   │   │   │   └── Chapter1pg5.css
│   │   │   └── Chapter3/
│   │   │       └── Chapter3pg1.css
├── docs/                              # Documentation
│   └── DEPLOYMENT.md                  # Deployment guide
├── scripts/                           # Development setup scripts
│   ├── setup.sh                       # Unix/macOS setup
│   └── setup.bat                      # Windows setup
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation (this file)
```

---

## Features

### Backend
- User authentication (email, Google OAuth)
- Email verification, password reset
- Music genre management
- Song recommendations (Last.fm API)
- JWT-based API security
- User profile customization & profile picture upload
- Jam session creation, editing, sharing, and exploration
- Chapter/page progress tracking
- Favorites management
- Shared loops and collaboration
- Comprehensive API (see backend README for full list)

### Frontend
- Modern React UI
- Responsive design for desktop and mobile
- Rhythm training modules and progress tracking
- Jam session builder and explorer
- Song recommendation interface
- User profile and customization
- Social features (sharing, collaboration)

---

## Prerequisites

### Required Software
- **Python 3.10+**
- **PostgreSQL**
- **Node.js and npm**
- **Last.fm API key** (for song recommendations)
- **Google Cloud Project** (for OAuth)

For detailed installation instructions, see the [backend README](./beatbridge-backend/README.md).

---

## Quick Start

### Backend
See [`beatbridge-backend/README.md`](./beatbridge-backend/README.md) for complete setup instructions.

### Frontend
1. Install Node.js (see [official docs](https://nodejs.org/en))
2. Install dependencies:
   ```sh
   cd beatbridge-frontend
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
   The React app will run at http://localhost:3000

### Running Both Together
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

See the backend README for detailed setup and environment configuration.

---

## Deployment

- **Backend:** Deployable to Railway, Heroku, or any WSGI-compatible host (see backend README and `Procfile`/`railway.toml`)
- **Frontend:** Deployable to Netlify, Vercel, or any static host (see `netlify.toml`, `vercel.json`)
- See `docs/DEPLOYMENT.md` for more details

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.