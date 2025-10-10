# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for Invoicely.

## 📋 Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "Invoicely" (or your preferred name)
5. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Invoicely"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip scopes (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Invoicely Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (frontend)
     - `http://localhost:3000` (backend)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
   - Click "Create"

5. **Save your credentials:**
   - Copy the `Client ID`
   - Copy the `Client Secret`

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy from env.example.txt
cp env.example.txt .env
```

Update the following variables in `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Update Database Schema

Run the migration to add Google OAuth fields to the users table:

```bash
npm run db:push
```

## 🎯 Testing Google OAuth

### Backend Testing

1. Start the backend server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000/api/auth/google
```

3. You should be redirected to Google's login page
4. After successful authentication, you'll be redirected back with a JWT token

### Frontend Integration

In your frontend, create a "Sign in with Google" button:

```tsx
const handleGoogleLogin = () => {
  // Redirect to backend Google OAuth endpoint
  window.location.href = 'http://localhost:3000/api/auth/google';
};

// In your component
<button onClick={handleGoogleLogin}>
  Sign in with Google
</button>
```

Create a callback page to handle the redirect:

```tsx
// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('authToken', token);
      // Redirect to dashboard
      navigate('/dashboard');
    } else if (error) {
      // Handle error
      console.error('Auth error:', error);
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div>Processing authentication...</div>;
}
```

## 🔒 Production Setup

For production deployment:

1. Update authorized redirect URIs in Google Cloud Console:
   - `https://yourdomain.com/api/auth/google/callback`

2. Update environment variables:
```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

3. Verify OAuth consent screen is properly configured
4. Submit app for verification if needed

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the callback URL in Google Cloud Console exactly matches `GOOGLE_CALLBACK_URL`
- Check for trailing slashes
- Verify protocol (http vs https)

### "Access blocked: This app's request is invalid"
- Make sure Google+ API is enabled
- Verify OAuth consent screen is configured
- Add yourself as a test user if app is not verified

### No token received
- Check backend logs for errors
- Verify `FRONTEND_URL` is correct
- Ensure CORS is properly configured

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)

## 🎉 Features

The Google OAuth integration includes:

✅ Automatic user creation on first login  
✅ Profile picture import from Google  
✅ Email verification (Google handles this)  
✅ Secure JWT token generation  
✅ Linking existing accounts by email  
✅ Support for both traditional and Google auth  

---

Need help? Check the main [README.md](./README.md) or create an issue.

