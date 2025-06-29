# BeatBridge

## Flask PostgreSQL Starter Guide

This guide helps you set up PostgreSQL for a Flask application, including installation, configuration, and common PostgreSQL operations.

---

## Table of Contents

1. [Directory Structure](#1-directory-structure)
2. [Install PostgreSQL](#2-install-postgresql)
3. [Set Up Environment Variables and PATH](#3-set-up-environment-variables-and-path)
4. [Create Database & User](#4-create-database--user)
5. [Useful PostgreSQL Commands](#5-useful-postgresql-commands)
6. [Install Node.js and npm](#6-install-nodejs-and-npm)
7. [Flask Setup](#7-flask-setup)
8. [Frontend Setup](#8-frontend-setup)
9. [Running Backend and Frontend Together](#9-running-backend-and-frontend-together)
10. [Troubleshooting](#10-troubleshooting)
11. [References](#11-references)

---

## 1. Directory Structure

```
BridgeBeat/
├── beatbridge-backend/                # Flask backend (API, database, migrations)
│   ├── app.py                         # Main Flask application
│   ├── requirements.txt               # Python dependencies
│   ├── Procfile                       # Railway/Heroku deployment config
│   ├── runtime.txt                    # Python version for deployment
│   ├── beatbridge.dp                  # (Project-specific file)
│   ├── .cache                         # (Cache file)
│   ├── flask_session/                 # Flask session files
│   ├── migrations/                    # Manual SQL migration scripts
│   │   ├── add_profile_pic_url.sql
│   │   ├── add_verification_fields.sql
│   │   └── create_user_customizations.sql
│   ├── uploads/                       # User uploads (profile pictures)
│   │   └── profile_pics/
│   │       ├── .gitkeep
│   │       ├── user_1.jpg/png/jpeg ...
│   └── tests/                         # Backend test scripts
│       └── test_lastfm.py             # Last.fm API test script
├── beatbridge-frontend/               # React frontend (UI)
│   ├── package.json                   # Node.js dependencies
│   ├── vercel.json                    # Vercel deployment config
│   └── src/                           # React source code
│       ├── App.jsx
│       ├── index.jsx
│       ├── config.js                  # API config
│       ├── components/                # Reusable React components
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   └── Layout.jsx
│       ├── pages/                     # Page components
│       │   ├── Home.jsx
│       │   ├── Profile.jsx
│       │   ├── ...
│       └── styles/                    # CSS styles and images
│           ├── App.css
│           ├── Profile.css
│           ├── ...
│           └── images/
│               ├── Beatbridge.png
│               ├── loginIcon.svg
│               └── ...
├── docs/                              # Documentation
│   └── DEPLOYMENT.md                  # Deployment guide
├── scripts/                           # Development setup scripts
│   ├── setup.sh                       # Unix/macOS setup
│   └── setup.bat                      # Windows setup
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation
```

- **beatbridge-backend/**: Contains all backend code, API, database models, and migration SQL files.
- **beatbridge-frontend/**: Contains the React frontend source code and assets.
- **migrations/**: SQL files for manual database schema changes.

---

## 2. Install PostgreSQL

### macOS

- Download from [PostgreSQL.org](https://www.postgresql.org/download/macosx/) and follow the installer steps.

### Windows

1. Download installer from [EDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Run installer:
    - Select components: **PostgreSQL Server**, **pgAdmin**, **Command Line Tools**
    - Set password for `postgres` user (make sure username is `postgres`)
    - Keep default port (5432)

---

## 3. Set Up Environment Variables and PATH

### macOS & Linux

1. **Find the `psql` Directory:**
    ```
    ls /Library/PostgreSQL/17/bin/psql
    ```
    If not found, try:
    ```
    find / -name psql 2>/dev/null
    ```
    Use the directory ending with `/bin/psql`.

2. **Edit Your Shell Configuration File:**
    - For zsh:
        ```
        nano ~/.zshrc
        ```
    - For bash:
        ```
        nano ~/.bash_profile
        ```

3. **Add PostgreSQL to Your PATH:**
    - Add at the bottom of the file (adjust path if needed):
        ```
        export PATH="/Library/PostgreSQL/17/bin:$PATH"
        ```
        Use whichever version of PostgreSQL (Replace the 17)

4. **Save and Exit Nano:**
    - Press `Ctrl+O`, `Enter`, then `Ctrl+X`.

5. **Reload Your Shell Configuration:**
    ```
    source ~/.zshrc
    ```
    or for bash
    ```
    source ~/.bash_profile
    ```

6. **Verify `psql` is Available:**
    ```
    psql --version
    ```

### Windows

1. Search "Environment Variables" in the Start menu.
2. Edit **System Variables** > **Path**.
3. Add:
    ```
    C:\Program Files\PostgreSQL\17\bin
    ```
4. Open a new Command Prompt and check:
    ```
    psql --version
    ```

---

### Set Database Password

1. Create a `.env` file in your project root with the following variables:
    ```
    # Database
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=flask_db

    # Flask secret keys
    SECRET_KEY=your-secret-key
    JWT_SECRET_KEY=your-jwt-secret-key

    # Mail (for email verification)
    MAIL_SERVER=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USE_TLS=True
    MAIL_USERNAME=your_email@gmail.com
    MAIL_PASSWORD=your_email_password
    MAIL_DEFAULT_SENDER=your_email@gmail.com

    # Google OAuth (optional)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret

    # Last.fm API (for song recommendations)
    LASTFM_API_KEY=your_lastfm_api_key
    ```
2. **Never commit `.env` to Git!**  
    Add `.env` to your `.gitignore`:
    ```
    .env
    ```

---

## 4. Create Database & User

1. **Login to PostgreSQL:**
    ```
    psql -U postgres
    ```
2. **Create database and user:**
    ```
    CREATE DATABASE flask_db;
    CREATE USER myuser WITH PASSWORD 'your_password';
    GRANT ALL PRIVILEGES ON DATABASE flask_db TO myuser;
    ```

---

## 5. Useful PostgreSQL Commands

| Command                                   | Description                   |
|--------------------------------------------|-------------------------------|
| `psql -U myuser -d flask_db`              | Login to your database        |
| `\l`                                      | List all databases            |
| `\c flask_db`                             | Connect to a database         |
| `\dt`                                     | Show tables                   |
| `ALTER USER myuser WITH PASSWORD 'new_password';` | Change password       |
| `SELECT version();`                       | Check PostgreSQL version      |
| `DROP DATABASE flask_db;`                 | Delete database               |

---
## 6. Install Node.js and npm

1. Download Node.js installer: [Node.js Official Site](https://nodejs.org/en)
2. Run the installer:
    - Accept the default options.   
    - Ensure "npm" is selected for installation.
3. Open up VS code again and navigate to the frontend directory:
    ```
    cd beatbridge-frontend
    ```
4. Install dependencies, run this command in the terminal:
    ```
    npm install
    ```
5. Start the development server:
    ```
    npm start
    ```
    - This will launch the React application at http://localhost:3000.

## 6.1. Get Last.fm API Key (for Song Recommendations)

To use the song recommendation feature, you'll need a Last.fm API key:

1. Go to [Last.fm API](https://www.last.fm/api/account/create)
2. Create a new API account
3. Fill in the required information:
   - Application name: "BeatBridge"
   - Description: "Music recommendation system for BeatBridge app"
   - Homepage URL: "http://localhost:3000"
   - Callback URL: "http://localhost:3000"
4. Submit the form
5. Copy your API key and add it to your `.env` file as `LASTFM_API_KEY=your_api_key_here`

---

## 7. Flask Setup

1. **Install requirements:**
    - Recommended: install all dependencies from the provided requirements file:
      ```
      pip3 install -r beatbridge-backend/requirements.txt
      ```
    - Or, install individually:
      ```
      pip3 install flask flask-sqlalchemy psycopg2-binary python-dotenv flask-session flask-login flask-cors flask-mail werkzeug sqlalchemy
      ```
2. **Run application:**
    - Make sure your `.env` file is set up as above.
    - Start the backend:
      ```
      cd beatbridge-backend
      flask run
      ```
      Or, if you want to use the app.py directly:
      ```
      python3 app.py
      ```
    - The backend will run on http://localhost:5000.
    - User will then be prompted to enter PostgreSQL password if not set in `.env`.

---

## 8. Frontend Setup

1. **Install Node.js and npm** (if not already installed):
   - Download from [Node.js Official Site](https://nodejs.org/en)

2. **Install frontend dependencies:**
   ```sh
   cd beatbridge-frontend
   npm install
   ```

3. **Start the frontend development server:**
   ```sh
   npm start
   ```
   - The React app will run at http://localhost:3000

---

## 9. Running Backend and Frontend Together

- Open **two terminal windows/tabs**:
  1. In the first, start the backend:
     ```sh
     cd beatbridge-backend
     flask run
     # or
     python3 app.py
     ```
  2. In the second, start the frontend:
     ```sh
     cd beatbridge-frontend
     npm start
     ```
- The backend will be available at http://localhost:5000 and the frontend at http://localhost:3000.

## 10. Troubleshooting

- **Role does not exist:**  
    Create user via psql:
    ```
    CREATE USER postgres WITH PASSWORD 'your_password';
    ```

- **Port 5000 already in use on Mac:**
    If you get an error about port 5000 being in use, and you are on macOS Monterey or later, try turning off AirPlay Receiver:
    1. Go to **System Settings** > **General** > **AirDrop & Handoff**.
    2. Turn off **AirPlay Receiver**.
    3. Try running the Flask app again.

- **Running migration SQL files:**
    To apply database migrations (e.g., new tables or columns), run the SQL files in `beatbridge-backend/migrations/`:
    1. Open a terminal and log in to your database:
        ```
        psql -U your_db_user -d flask_db
        ```
    2. Run a migration file (example):
        ```
        \i beatbridge-backend/migrations/create_user_customizations.sql
        ```
    3. Repeat for other migration files as needed.
    
    If you get errors about existing tables/columns, check the SQL for `IF NOT EXISTS` or adjust as needed.

- **Testing Last.fm API Integration:**
    To verify that the song recommendation feature is working correctly:
    1. Make sure you have set your `LASTFM_API_KEY` in the `.env` file
    2. Run the test script:
        ```
        cd beatbridge-backend
        python3 tests/test_lastfm.py
        ```
    3. If the test passes, the song recommendation feature should work in the frontend
    4. If the test fails, check your API key and internet connection

---

## 11. References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Flask-SQLAlchemy Guide](https://flask-sqlalchemy.palletsprojects.com/)