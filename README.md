# BridgeBeat
Orbital Project

# Flask PostgreSQL Starter Guide

This guide helps you set up PostgreSQL for a Flask application, including installation, configuration, and common PostgreSQL operations.

---

## Table of Contents
1. [Install PostgreSQL](#1-install-postgresql)
   - [macOS](#macos)
   - [Windows](#windows)
2. [Set Up Environment Variables](#2-set-up-environment-variables)
3. [Create Database & User](#3-create-database--user)
4. [Useful PostgreSQL Commands](#4-useful-postgresql-commands)
5. [Flask Setup](#5-flask-setup)
6. [Troubleshooting](#troubleshooting)

---

## 1. Install PostgreSQL
**Official Installer**  
Download from [PostgreSQL.org](https://www.postgresql.org/download/macosx/) and follow installer steps.

### Windows
1. Download installer from [EDB](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Run installer:
   - Select components: **PostgreSQL Server**, **pgAdmin**, **Command Line Tools**
   - Set password for `postgres` user
   - Keep default port (5432)

---

## 2. Set Up Environment Variables

### Add PostgreSQL to PATH
**macOS:**
echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
**Windows:**  
1. Search "Environment Variables"
2. Edit **System Variables** > **Path**
3. Add: `C:\Program Files\PostgreSQL\16\bin`

### Set Database Password
Create `.env` file in project root:
**Never commit .env to Git!** Add to `.gitignore`:

## 3. Create Database & User

1. Login to PostgreSQL: 
psql -U postgres
2. Create database and user: 
CREATE DATABASE flask_db;
CREATE USER myuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flask_db TO myuser;

## 4. Useful PostgreSQL Commands

| Command | Description |
|---------|-------------|
| `psql -U myuser -d flask_db` | Login to your database |
| `\l` | List all databases |
| `\c flask_db` | Connect to a database |
| `\dt` | Show tables |
| `ALTER USER myuser WITH PASSWORD 'new_password';` | Change password |
| `SELECT version();` | Check PostgreSQL version |
| `DROP DATABASE flask_db;` | Delete database |

---

## 5. Flask Setup

1. Install requirements:
pip install flask flask-sqlalchemy psycopg2-binary python-dotenv
2. Initialize database in `app.py`:
with app.app_context():
db.create_all() # Creates tables from SQLAlchemy models
3. Run application:
flask run

---

## Troubleshooting

**"Role does not exist" Error**  
