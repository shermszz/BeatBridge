# Deploying BeatBridge Frontend to Netlify

This guide will help you deploy the BeatBridge React frontend to Netlify.

## Prerequisites

1. A Netlify account (free at [netlify.com](https://netlify.com))
2. Your BeatBridge project code
3. Your backend API deployed and accessible (Heroku, Railway, etc.)

## Step 1: Prepare Your Environment Variables

Before deploying, you need to set up environment variables for your API endpoints.

### Option A: Using Netlify Dashboard (Recommended)

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.herokuapp.com`)

### Option B: Using .env file (for local testing)

Create a `.env` file in the `beatbridge-frontend` directory:

```env
REACT_APP_API_URL=https://your-backend.herokuapp.com
```

**Important**: Never commit `.env` files to version control. Add `.env` to your `.gitignore`.

## Step 2: Deploy to Netlify

### Method 1: Deploy via Netlify Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your BeatBridge repository

3. **Configure build settings**:
   - **Base directory**: `beatbridge-frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18` (or your preferred version)

4. **Set environment variables** (if not done in Step 1):
   - Click "Advanced build settings"
   - Add environment variable: `REACT_APP_API_URL` = your backend URL

5. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Navigate to your frontend directory**:
   ```bash
   cd beatbridge-frontend
   ```

4. **Build your project**:
   ```bash
   npm run build
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod --dir=build
   ```

## Step 3: Configure Custom Domain (Optional)

1. In your Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Step 4: Update CORS Settings

Make sure your backend allows requests from your Netlify domain. Update your Flask backend's `ALLOWED_ORIGINS` in `app.py`:

```python
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-site-name.netlify.app",
    "https://your-custom-domain.com",
    # ... other origins
]
```

## Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Test all major functionality:
   - User registration/login
   - Profile updates
   - Song recommendations
   - Customization settings

## Troubleshooting

### Common Issues

1. **Build fails**:
   - Check the build logs in Netlify dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API calls fail**:
   - Verify `REACT_APP_API_URL` environment variable is set correctly
   - Check CORS settings in your backend
   - Ensure your backend is accessible from the internet

3. **Routing issues**:
   - The `_redirects` file should handle React Router
   - If issues persist, check the `netlify.toml` configuration

4. **Environment variables not working**:
   - Ensure variable names start with `REACT_APP_`
   - Redeploy after adding environment variables
   - Check for typos in variable names

### Useful Commands

```bash
# Check build locally
cd beatbridge-frontend
npm run build

# Test build output
npx serve -s build

# Deploy to Netlify (CLI)
netlify deploy --prod --dir=build

# View deployment logs
netlify logs
```

## Continuous Deployment

Once set up, Netlify will automatically deploy your site whenever you push changes to your main branch. You can:

- Set up branch deployments for testing
- Configure preview deployments for pull requests
- Set up form handling for contact forms
- Enable analytics and monitoring

## Performance Optimization

1. **Enable asset optimization** in Netlify dashboard
2. **Set up CDN** for better global performance
3. **Configure caching headers** for static assets
4. **Enable compression** for faster loading

## Security Considerations

1. **Environment variables** are encrypted and secure
2. **HTTPS** is automatically enabled
3. **Security headers** are configured in `netlify.toml`
4. **CORS** should be properly configured on your backend

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Netlify Community](https://community.netlify.com/)

---

**Note**: This deployment guide focuses on the frontend. Your Flask backend should be deployed separately on a platform like Heroku, Railway, or DigitalOcean. 