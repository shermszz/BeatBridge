# BridgeBeat

## Flask PostgreSQL Starter Guide

This guide helps you set up PostgreSQL for a Flask application, including installation, configuration, and common PostgreSQL operations.

---

## Table of Contents

1. [Install PostgreSQL](#1-install-postgresql)
2. [Set Up Environment Variables and PATH](#2-set-up-environment-variables-and-path)
3. [Create Database & User](#3-create-database--user)
4. [Useful PostgreSQL Commands](#4-useful-postgresql-commands)
5. [Flask Setup](#5-flask-setup)
6. [Troubleshooting](#6-troubleshooting)
7. [References](#references)

---

## 1. Install PostgreSQL

### macOS

- Download from [PostgreSQL.org](https://www.postgresql.org/download/macosx/) and follow the installer steps.

### Windows

1. Download installer from [EDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Run installer:
    - Select components: **PostgreSQL Server**, **pgAdmin**, **Command Line Tools**
    - Set password for `postgres` user (make sure username is `postgres`)
    - Keep default port (5432)

---

## 2. Set Up Environment Variables and PATH

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

1. Create a `.env` file in your project root:
    ```
    DATABASE_PASSWORD=your_secure_password
    ```
2. **Never commit `.env` to Git!**  
    Add `.env` to your `.gitignore`:
    ```
    .env
    ```

---

## 3. Create Database & User

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

## 4. Useful PostgreSQL Commands

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

## 5. Flask Setup

1. **Install requirements:**
    ```
    pip3 install flask flask-sqlalchemy psycopg2-binary python-dotenv
    ```
2. **Run application:**
    ```
    flask run
    ```
    User will then be prompt to enter PostgresSQL password
---

## 6. Troubleshooting

- **Role does not exist:**  
    Create user via psql:
    ```
    CREATE USER postgres WITH PASSWORD 'your_password';
    ```

- **Password Authentication Failed:**  
    Update `pg_hba.conf` (location varies):
    ```
    # Change from 'peer' to 'md5'
    local   all             all                                     md5
    ```

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Flask-SQLAlchemy Guide](https://flask-sqlalchemy.palletsprojects.com/)

---



