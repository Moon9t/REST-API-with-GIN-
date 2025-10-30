# Mobile App

      npm install
   
      ```

2. Set up environment variables:

    cp .env.example .env

   Configure the API base URL and other settings in `.env`.

3. Start the development server:

   ```bash
   npx expo start
    npx expo start

The app provides a complete authentication flow:

1. **Registration**: New users can create accounts with email, password, and name validation.
2. **Login**: Existing users can log in with email/password or biometric authentication.
3. **Biometric Setup**: Optional setup for Face ID/Touch ID after login.
4. **Protected Content**: Authenticated users access the main app features through a drawer navigation.

## Authentication

This app implements JWT-based authentication with biometric support for enhanced security and user experience.

### Auth Flow

1. User registers or logs in via email/password
2. Backend returns a JWT token with 24-hour expiry
3. Token is stored securely using `expo-secure-store`
4. Optional biometric authentication can be enabled for quick login
5. Token is automatically injected into all API requests via interceptors
6. Token expiry triggers automatic logout and redirect to login

### Login Flow

Users can authenticate through:

- **Email/Password**: Standard login with form validation
- **Biometric Unlock**: Quick authentication using Face ID or Touch ID (if enabled)

After successful login, users are redirected to the main app. If biometric authentication is not yet set up, they may be prompted to enable it.

### Registration Flow

New users register by providing:

- Name (2-100 characters)
- Email address (valid format)
- Password (minimum 8 characters)
- Password confirmation

Form validation ensures data matches backend requirements. Upon successful registration, users are redirected to the login screen.

### Token Management

- **Secure Storage**: JWT tokens are encrypted and stored using platform-specific secure storage (iOS Keychain, Android EncryptedSharedPreferences)
- **Automatic Injection**: All API requests automatically include the `Authorization: Bearer <token>` header via axios interceptors
- **Global Handling**: Token expiry (401 responses) triggers automatic logout across the app

### Biometric Authentication

- **Setup**: Users can enable biometric login after successful email/password authentication
- **Supported Types**: Face ID (iOS), Touch ID (iOS), Fingerprint (Android), Face Unlock (Android)
- **Security**: Credentials are encrypted and only accessible after biometric verification
- **Fallback**: PIN/password fallback is available if biometric fails

### Protected Routes

All main app screens are protected by authentication checks:

- Unauthenticated users are redirected to login
- Authentication state is verified on app launch
- Loading states prevent UI flickering during auth checks

### Token Expiry

- Backend issues tokens with 24-hour expiry
- No refresh token mechanism is implemented
- Expired tokens trigger automatic logout and redirect to login
- Users must re-authenticate after token expiry

## Building

### Development Build

For full functionality including biometric authentication:

````markdown
    # Install EAS CLI
    npm install -g @expo/eas-cli

    # Install EAS CLI
    npm install -g @expo/eas-cli

    # Build for iOS
    eas build --profile development --platform ios

    # Build for Android
    eas build --profile development --platform android

    # Build for production
    eas build --profile production --platform ios
    eas build --profile production --platform android
    # Build for production
    eas build --profile production --platform ios
    eas build --profile production --platform android
```
