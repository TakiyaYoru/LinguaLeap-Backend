# Google Auth Setup Guide for LinguaLeap

## Prerequisites

1. Google Cloud Console account
2. A Google Cloud Project
3. OAuth 2.0 credentials configured

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

### 1.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "LinguaLeap"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email addresses)

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `http://localhost:4000` (for backend)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - Your production callback URL
6. Save the Client ID and Client Secret

### 1.4 Create Android OAuth Credentials (for Flutter)
1. Create another OAuth 2.0 Client ID
2. Choose "Android" application type
3. Add your Android package name (from `android/app/build.gradle`)
4. Generate SHA-1 fingerprint and add it
5. Save the Client ID

### 1.5 Create iOS OAuth Credentials (for Flutter)
1. Create another OAuth 2.0 Client ID
2. Choose "iOS" application type
3. Add your iOS bundle ID (from `ios/Runner/Info.plist`)
4. Save the Client ID

## Step 2: Environment Configuration

### 2.1 Backend (.env file)
Create a `.env` file in the `LinguaLeap-Backend` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/lingualeap

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_web_client_id_here
GOOGLE_CLIENT_SECRET=your_web_client_secret_here

# Server Configuration
PORT=4000
NODE_ENV=development
```

### 2.2 Flutter Configuration

#### Android Configuration
1. Open `android/app/build.gradle`
2. Add your Android OAuth Client ID:

```gradle
android {
    defaultConfig {
        // ... other config
        manifestPlaceholders += [
            'GOOGLE_CLIENT_ID': 'your_android_client_id_here'
        ]
    }
}
```

#### iOS Configuration
1. Open `ios/Runner/Info.plist`
2. Add your iOS OAuth Client ID:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>your_ios_client_id_here</string>
        </array>
    </dict>
</array>
```

#### Flutter Configuration
1. Update `lib/network/google_auth_service.dart`
2. Replace `YOUR_WEB_CLIENT_ID` with your actual web client ID

## Step 3: Testing

### 3.1 Backend Testing
1. Start the backend server:
   ```bash
   cd LinguaLeap-Backend
   npm run dev
   ```

2. Test the Google Auth endpoint in GraphQL Playground:
   ```graphql
   mutation GoogleAuth($input: GoogleAuthInput!) {
     googleAuth(input: $input) {
       success
       message
       token
       user {
         id
         email
         displayName
       }
     }
   }
   ```

### 3.2 Flutter Testing
1. Run the Flutter app:
   ```bash
   cd LinguaLeap-Flutter
   flutter run
   ```

2. Test Google Sign-In from the login page

## Troubleshooting

### Common Issues

1. **"Invalid Client ID" error**
   - Check that your Client ID is correct
   - Ensure the package name/bundle ID matches exactly
   - Verify SHA-1 fingerprint for Android

2. **"Redirect URI mismatch" error**
   - Check authorized redirect URIs in Google Console
   - Ensure the callback URL is exactly as configured

3. **"OAuth consent screen not configured" error**
   - Complete the OAuth consent screen setup
   - Add test users if in testing mode

4. **"API not enabled" error**
   - Enable Google+ API and Google Identity API
   - Wait a few minutes for changes to propagate

### Debug Tips

1. Check browser console for detailed error messages
2. Use Google's OAuth 2.0 Playground to test tokens
3. Verify environment variables are loaded correctly
4. Check network requests in browser dev tools

## Security Considerations

1. **Never commit credentials to version control**
   - Use `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Use HTTPS in production**
   - Google OAuth requires HTTPS for production
   - Update redirect URIs accordingly

3. **Validate tokens on backend**
   - Always verify Google tokens server-side
   - Don't trust client-side token validation

4. **Handle token expiration**
   - Implement proper token refresh logic
   - Handle expired tokens gracefully

## Production Deployment

1. Update OAuth consent screen to "In production"
2. Add production domains to authorized origins
3. Update environment variables with production values
4. Configure proper SSL certificates
5. Set up monitoring and logging

## Support

If you encounter issues:
1. Check Google Cloud Console logs
2. Review Google OAuth documentation
3. Test with Google's OAuth 2.0 Playground
4. Check Flutter Google Sign-In documentation 