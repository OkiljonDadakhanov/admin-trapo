# Authentication Setup

## Overview
Complete authentication system has been implemented with registration and login functionality.

## Files Created

### Core Components
1. **`components/auth-form.tsx`** - Main authentication form component for login/register
2. **`components/custom-toast.tsx`** - Custom toast notification hook
3. **`lib/api.ts`** - Authentication API client with the following methods:
   - `login(email, password)` - User login
   - `register(name, email, password)` - User registration
   - `getCurrentUser()` - Get current user info
   - `logout()` - Logout user

### Pages
1. **`app/auth/login/page.tsx`** - Login page
2. **`app/auth/register/page.tsx`** - Registration page
3. **`app/profile/page.tsx`** - User profile page with logout

## Files Modified

1. **`app/globals.css`** - Added `.glass` class for glassmorphism effect
2. **`app/layout.tsx`** - Added Toaster component for notifications
3. **`lib/api-client.ts`** - Updated to include authentication headers

## Features

### Authentication Form
- Login and register modes
- Password visibility toggle
- Email and password validation
- Loading states
- Error handling with toast notifications
- Glassmorphism UI design

### API Integration
- Bearer token authentication
- Token stored in localStorage
- Automatic token injection in API requests
- Error handling with proper messages

### Profile Page
- Display user information
- Logout functionality
- Navigation to admin panel
- Protected route with authentication check

## Usage

### Routes
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/profile` - User profile (protected)
- `/admin/login` - Admin login (existing)

### Integration with Backend
The authentication system expects the following backend endpoints:

1. **POST** `/api/auth/login`
   - Body: `{ email: string, password: string }`
   - Returns: `{ token: string, user: User }`

2. **POST** `/api/auth/register`
   - Body: `{ name: string, email: string, password: string }`
   - Returns: `{ token: string, user: User }`

3. **GET** `/api/auth/me`
   - Headers: `Authorization: Bearer <token>`
   - Returns: `User`

4. **POST** `/api/auth/logout`
   - Headers: `Authorization: Bearer <token>`

### Environment Variables
Make sure to set `NEXT_PUBLIC_API_URL` in your `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## UI Components Used

- Lucide React icons
- Custom toast notifications
- Glass morphism design
- Responsive layout
- Dark mode compatible

## Security Notes

- Tokens are stored in localStorage
- All API requests include Authorization header
- Protected routes check for authentication
- Password confirmation validation in registration
- Error messages are user-friendly

