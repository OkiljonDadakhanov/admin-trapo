# Admin Panel Authentication Guide

## Overview
The admin panel now uses a dedicated admin API with proper authentication endpoints. This provides a clean, secure, and admin-specific authentication experience with role-based access control.

## Key Features

### 🔐 Admin Token Authentication
- Uses admin-specific JWT tokens stored in localStorage as `adminToken`
- Automatic token injection in API requests with `Authorization: Bearer {adminToken}`
- Token validation and refresh handling
- Secure logout with token cleanup

### 👤 Admin User Management
- Dedicated admin authentication system
- Role-based access control (admin/super_admin roles)
- Admin profile display in header
- One-time admin registration for initial setup

### 🛡️ Security Features
- Protected routes with authentication checks
- Automatic redirects for unauthorized access
- Error handling for expired/invalid tokens
- Middleware-based route protection

## API Integration

The admin panel uses dedicated admin API endpoints:

### Admin Authentication Endpoints
- `POST /api/admin/register` - Create admin (one-time setup)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get current admin info

### Admin Data Endpoints
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `GET /api/admin/dashboard` - Dashboard stats

### Required Response Format
```typescript
// Admin Login/Register Response
{
  adminToken: string,
  admin: {
    _id: string,
    name: string,
    email: string,
    role: 'admin' | 'super_admin',
    createdAt: string,
    updatedAt: string
  }
}

// Admin Profile Response
{
  _id: string,
  name: string,
  email: string,
  role: 'admin' | 'super_admin',
  createdAt: string,
  updatedAt: string
}

// Dashboard Stats Response
{
  totalOrders: number,
  totalRevenue: number,
  totalUsers: number,
  recentOrders: Order[],
  monthlyRevenue: Array<{
    month: string,
    revenue: number
  }>
}
```

## Environment Setup

Create a `.env.local` file with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Admin Roles

- **admin**: Full access to admin panel
- **super_admin**: Full access to admin panel (future: additional privileges)

## Getting Started

### 1. First-Time Setup
1. Navigate to `/admin/register` to create the first admin account
2. Fill in admin details and create account
3. You'll be automatically logged in and redirected to `/admin`

### 2. Subsequent Logins
1. Navigate to `/login` to sign in with existing admin credentials
2. Use the admin email and password you created during registration

## Components

### AuthProvider
- Wraps the entire application
- Manages authentication state
- Provides auth methods to components

### useAuth Hook
- Access authentication state and methods
- Available throughout the application

### useAdminAuth Hook
- Specialized hook for admin-specific functionality
- Includes role checking

### ProtectedRoute Component
- Wraps admin routes
- Handles authentication checks
- Redirects unauthorized users

## Usage Examples

### Login
```typescript
const { login, isLoading } = useAuth()

const handleLogin = async (email: string, password: string) => {
  const success = await login(email, password)
  if (success) {
    // Redirect to admin panel
  }
}
```

### Check Authentication
```typescript
const { isAuthenticated, user, isLoading } = useAuth()

if (isLoading) return <Loading />
if (!isAuthenticated) return <LoginForm />
```

### Admin Access
```typescript
const { isAdmin, user } = useAdminAuth()

if (!isAdmin) {
  return <AccessDenied />
}
```

## Migration from Old System

The old hardcoded authentication system has been completely replaced:

- ❌ Removed: `lib/admin-auth.ts`
- ❌ Removed: Hardcoded credentials
- ✅ Added: API-based authentication
- ✅ Added: Role-based access control
- ✅ Added: Proper error handling
- ✅ Added: User session management

## Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- All API requests include Authorization headers
- Automatic token cleanup on logout
- Protected routes check both authentication and admin role
- Error messages are user-friendly but don't expose sensitive information

## Troubleshooting

### Common Issues

1. **"Authentication failed" errors**
   - Check if API_URL is correct
   - Verify backend is running
   - Check if user has admin role

2. **Infinite redirect loops**
   - Clear localStorage
   - Check middleware configuration
   - Verify route protection logic

3. **API calls failing**
   - Check network tab for 401 errors
   - Verify token is being sent
   - Check backend authentication middleware

### Debug Mode

Add this to your component to debug auth state:
```typescript
const { user, token, isAuthenticated, isLoading } = useAuth()
console.log({ user, token, isAuthenticated, isLoading })
```
