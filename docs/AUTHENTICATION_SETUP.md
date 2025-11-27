# Authentication System Setup Guide

This guide explains the authentication system implementation for the Recipe & Pantry Tracker application.

## Prerequisites

- **PostgreSQL** installed and running locally (not Docker)
- **Node.js** and **pnpm** installed
- **Database setup** completed (see DATABASE_SETUP.md)

## Overview

The application uses **NextAuth.js v5** (Auth.js) with the following features:

- **Credentials Provider**: Email/password authentication
- **JWT Sessions**: Stateless authentication with 7-day sessions
- **Protected Routes**: Middleware-based route protection
- **Secure Password Hashing**: bcrypt with 12 salt rounds
- **Automatic Household Creation**: Every new user gets their own household

## Environment Variables

Before running the application, you must configure the following environment variables:

### Required Variables

Create or update your `.env.local` file with:

```env
# Database connection (already configured from previous step)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/recipe_tracker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Generating NEXTAUTH_SECRET

Generate a secure secret key using one of these methods:

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit: https://generate-secret.vercel.app/32

Copy the generated secret and add it to your `.env.local` file.

## Authentication Flow

### User Registration

1. **User submits registration form** with:
   - Name (min 2 characters)
   - Email (valid email format)
   - Password (min 8 chars, must include number and special character)
   - Confirm Password

2. **Server validates** the input using Zod schemas

3. **Server checks** if email already exists

4. **Password is hashed** using bcrypt (12 rounds)

5. **Household is created** with name `{User's Name}'s Household`

6. **User is created** and linked to the household

7. **Auto-login** occurs using NextAuth credentials provider

8. **Redirect** to `/dashboard`

### User Login

1. **User submits login form** with email and password

2. **NextAuth validates** credentials:
   - Looks up user by email
   - Compares password hash using bcrypt
   - Returns user object if valid

3. **JWT token is created** with user information including:
   - User ID
   - Email
   - Name
   - Household ID

4. **Session cookie is set** (httpOnly, secure in production)

5. **Redirect** to `/dashboard`

### Session Management

- **Session Duration**: 7 days
- **Session Type**: JWT (stateless)
- **Session Refresh**: Automatic on page navigation
- **Session Data**: Includes user ID, email, name, and household ID

### Logout

Users can logout from the dashboard navigation, which:
1. Clears the session cookie
2. Redirects to `/login`

## Route Protection

### Middleware-Based Protection

The application uses Next.js middleware (`src/middleware.ts`) to protect routes:

**Public Routes:**
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

**Protected Routes:**
- `/dashboard/*` - All dashboard routes
- Any other routes not explicitly public

**Auto-redirects:**
- Authenticated users visiting `/login` or `/register` → redirected to `/dashboard`
- Unauthenticated users visiting protected routes → redirected to `/login?callbackUrl={original-path}`

### Server-Side Protection

Dashboard layouts and pages use `auth()` to verify sessions:

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Render protected content
}
```

## API Endpoints

### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "householdId": "uuid"
  },
  "message": "User registered successfully"
}
```

**Error Responses:**
- `400` - Validation error or user already exists
- `500` - Server error

### POST /api/auth/[...nextauth]

NextAuth.js handles these routes automatically:
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get available auth providers

## Security Features

### Password Requirements

- Minimum 8 characters
- Must contain at least one number
- Must contain at least one special character
- Validated on both client and server

### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Never stored in plain text**
- **Not returned in API responses**

### Session Security

- **JWT tokens** signed with NEXTAUTH_SECRET
- **httpOnly cookies** (not accessible via JavaScript)
- **Secure flag** in production (HTTPS only)
- **SameSite=lax** cookie attribute

### CSRF Protection

- Built into NextAuth.js
- Uses cryptographically random CSRF tokens

### Rate Limiting

A basic in-memory rate limiter is available at `src/lib/rate-limit.ts`:

```typescript
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const ip = getClientIp(request);
const result = rateLimit(ip, 10, 60000); // 10 requests per minute

if (!result.success) {
  return new Response('Too many requests', { status: 429 });
}
```

**Note**: For production, replace with Redis-based rate limiting.

## UI Components

### LoginForm (`src/components/auth/login-form.tsx`)

Features:
- Email and password inputs
- Password visibility toggle
- Form validation with react-hook-form + Zod
- Loading states
- Error message display
- Link to registration page

### RegisterForm (`src/components/auth/register-form.tsx`)

Features:
- Name, email, password, and confirm password inputs
- Password visibility toggles for both password fields
- Form validation with react-hook-form + Zod
- Password requirements helper text
- Loading states
- Error message display
- Link to login page
- Auto-login after successful registration

### DashboardNav (`src/components/dashboard/dashboard-nav.tsx`)

Features:
- Navigation links to dashboard sections
- User name and email display
- Sign out button
- Responsive design

## Database Schema

The authentication system uses the following tables:

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  household_id UUID REFERENCES households(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### households

```sql
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE,
  invite_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Testing the Authentication System

### 1. Start the Development Server

```bash
# Make sure your PostgreSQL database is running
# For Homebrew (macOS):
brew services list | grep postgresql

# For systemd (Ubuntu/Debian):
sudo systemctl status postgresql

# Verify database exists:
psql -l | grep recipe_tracker

# Start Next.js dev server
pnpm dev
```

### 2. Test User Registration

1. Navigate to http://localhost:3000
2. Click "Get Started" or go to http://localhost:3000/register
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: Password123!
   - Confirm Password: Password123!
4. Click "Create account"
5. Verify you're redirected to `/dashboard`
6. Verify your name appears in the dashboard

### 3. Test Logout

1. From the dashboard, click "Sign out" in the navigation
2. Verify you're redirected to `/login`

### 4. Test Login

1. Go to http://localhost:3000/login
2. Enter the credentials from registration:
   - Email: test@example.com
   - Password: Password123!
3. Click "Sign in"
4. Verify you're redirected to `/dashboard`

### 5. Test Protected Routes

1. While logged out, try to visit http://localhost:3000/dashboard
2. Verify you're redirected to `/login?callbackUrl=/dashboard`
3. After logging in, verify you're redirected back to `/dashboard`

### 6. Test Form Validation

**Registration:**
- Try weak password (e.g., "password") - should show validation error
- Try mismatched passwords - should show "Passwords don't match"
- Try duplicate email - should show "User already exists"

**Login:**
- Try incorrect password - should show "Invalid email or password"
- Try non-existent email - should show "Invalid email or password"

## Troubleshooting

### "Invalid email or password" on valid credentials

- Check database connection (`DATABASE_URL` in `.env.local`)
- Verify user exists in database:
  ```bash
  pnpm db:studio
  # Check users table
  ```

### "NEXTAUTH_SECRET not configured"

- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Restart the dev server after adding environment variables

### Session not persisting across page refreshes

- Check that `NEXTAUTH_URL` matches your application URL
- Clear browser cookies and try again
- Check browser console for errors

### Redirect loop between /login and /dashboard

- Clear browser cookies
- Check middleware configuration in `src/middleware.ts`
- Verify `auth()` is working correctly

### Password validation not working

- Validation happens on both client and server
- Check browser console for client-side errors
- Check server logs for server-side validation errors

## Next Steps

After setting up authentication, you can:

1. **Test the complete flow** by creating a user and logging in
2. **Proceed to the next implementation step** (Household Management)
3. **Customize the UI** to match your design preferences
4. **Add email verification** (future enhancement)
5. **Add OAuth providers** like Google or GitHub (future enhancement)

## Production Deployment

### Environment Variables on Vercel

When deploying to Vercel, add these environment variables:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `DATABASE_URL` - Your production database connection string
   - `NEXTAUTH_URL` - Your production URL (e.g., https://yourapp.vercel.app)
   - `NEXTAUTH_SECRET` - Generate a NEW secret for production

### Security Checklist

Before deploying to production:

- [ ] Generate a strong, unique `NEXTAUTH_SECRET` for production
- [ ] Use HTTPS for all connections (`NEXTAUTH_URL` must use `https://`)
- [ ] Set up database SSL connection
- [ ] Implement Redis-based rate limiting
- [ ] Enable CORS protection
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and test all authentication flows
- [ ] Implement email verification (recommended)
- [ ] Set up monitoring and alerts

## Additional Resources

- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Zod Validation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
