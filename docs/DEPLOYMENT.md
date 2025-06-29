# BeatBridge Deployment Guide: Vercel + Railway

This guide will help you deploy your BeatBridge application using Vercel for the frontend and Railway for the backend.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Railway Account** - Sign up at [railway.app](https://railway.app)
4. **Last.fm API Key** - For song recommendations (optional)

## Step 1: Deploy Backend to Railway

### 1.1 Connect to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your BeatBridge repository

### 1.2 Configure Backend Service
1. Railway will detect your `beatbridge-backend` directory
2. Set the following environment variables in Railway:
   ```
   DB_USER=postgres
   DB_PASSWORD=your_railway_db_password
   DB_HOST=your_railway_db_host
   DB_PORT=5432
   DB_NAME=railway
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_email_password
   MAIL_DEFAULT_SENDER=your_email@gmail.com
   LASTFM_API_KEY=your_lastfm_api_key
   ```

### 1.3 Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set the database environment variables
4. Copy the database URL and update your environment variables

### 1.4 Deploy Backend
1. Railway will automatically deploy when you push to your GitHub repository
2. Note your backend URL (e.g., `https://your-app-name.railway.app`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `beatbridge-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.2 Set Environment Variables
In Vercel, add the following environment variable:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### 2.3 Deploy Frontend
1. Click "Deploy" in Vercel
2. Vercel will build and deploy your React app
3. Note your frontend URL (e.g., `https://your-app-name.vercel.app`)

## Step 3: Update Configuration

### 3.1 Update Backend CORS
After getting your Vercel domain, update the CORS origins in your backend:

```python
# In beatbridge-backend/app.py, update these lines:
CORS(app,
     resources={r"/*": {"origins": ["http://localhost:3000", "https://your-actual-vercel-domain.vercel.app"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Also update the after_request and before_request functions with your actual Vercel domain
```

## Step 4: Database Migrations

### 4.1 Run Migrations
Connect to your Railway PostgreSQL database and run the migration files:

1. Get your database connection details from Railway
2. Connect using psql or a database client
3. Run the migration files in `beatbridge-backend/migrations/`:
   ```sql
   \i migrations/create_user_customizations.sql
   \i migrations/add_profile_pic_url.sql
   \i migrations/add_verification_fields.sql
   ```

## Step 5: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints at your Railway URL
3. **Database**: Verify data is being stored correctly
4. **Features**: Test registration, login, song recommendations, etc.

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Vercel domain is added to CORS origins in the backend
   - Check that environment variables are set correctly

2. **Database Connection Issues**
   - Verify database environment variables in Railway
   - Check that migrations have been run

3. **API Calls Failing**
   - Verify `REACT_APP_API_URL` is set correctly in Vercel
   - Check that the backend is running and accessible

4. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Environment Variables Checklist

**Railway (Backend):**
- [ ] `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`
- [ ] `SECRET_KEY`, `JWT_SECRET_KEY`
- [ ] `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER`
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [ ] `LASTFM_API_KEY`

**Vercel (Frontend):**
- [ ] `REACT_APP_API_URL`

## Cost Considerations

- **Railway**: Free tier includes 500 hours/month, then $5/month
- **Vercel**: Free tier includes unlimited deployments, 100GB bandwidth/month
- **PostgreSQL**: Included in Railway's free tier

## Next Steps

1. Set up custom domains (optional)
2. Configure monitoring and logging
3. Set up CI/CD for automatic deployments
4. Implement backup strategies for your database

Your BeatBridge application should now be live and accessible worldwide! 🎉 