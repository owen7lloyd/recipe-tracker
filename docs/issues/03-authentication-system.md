# Authentication System

**Phase:** 1 - Foundation
**Priority:** P0
**Estimate:** 5 days

## Description

Implement complete authentication system with user registration, login, logout, session management, and protected routes using NextAuth.js.

## Tasks

### NextAuth.js Setup
- [ ] Install and configure NextAuth.js v5
- [ ] Set up credentials provider
- [ ] Configure session strategy (JWT)
- [ ] Set up environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL)
- [ ] Create auth configuration file

### API Endpoints
- [ ] `POST /api/auth/register` - User registration
- [ ] `POST /api/auth/login` - User login (handled by NextAuth)
- [ ] `POST /api/auth/logout` - User logout
- [ ] `GET /api/auth/session` - Get current session

### Registration Logic
- [ ] Email validation
- [ ] Password strength requirements (min 8 chars, numbers, special chars)
- [ ] Hash passwords with bcrypt
- [ ] Create user in database
- [ ] Create default household for user
- [ ] Return session token

### Session Management
- [ ] Configure JWT tokens
- [ ] Set session expiration (7 days)
- [ ] Implement session refresh
- [ ] Add CSRF protection

### Protected Routes
- [ ] Create middleware for route protection
- [ ] Protect all /dashboard/* routes
- [ ] Redirect unauthenticated users to /login
- [ ] Redirect authenticated users from /login to /dashboard

### UI Components
- [ ] `LoginForm` component
- [ ] `RegisterForm` component
- [ ] Form validation with React Hook Form + Zod
- [ ] Error message display
- [ ] Loading states
- [ ] Password visibility toggle

### Security
- [ ] Implement rate limiting on auth endpoints (10 requests/minute)
- [ ] Add brute force protection
- [ ] Sanitize user inputs
- [ ] Add security headers
- [ ] Implement HTTPS-only cookies

## Acceptance Criteria

- [ ] Users can register with email/password
- [ ] Password requirements enforced
- [ ] Users can log in with credentials
- [ ] Session persists across page refreshes
- [ ] Users can log out
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Auth state available throughout app
- [ ] Error messages clear and helpful
- [ ] Mobile responsive auth forms
- [ ] Rate limiting prevents brute force attacks

## Technical Details

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { db } from "@/lib/db"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !await compare(credentials.password, user.password_hash)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          household_id: user.household_id
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.household_id = user.household_id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
        session.user.household_id = token.household_id
      }
      return session
    }
  }
}
```

### Validation Schema

```typescript
import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

## Dependencies

- [ ] #01 Project Setup completed
- [ ] #02 Database Schema implemented
- Users table exists in database

## Testing

- [ ] Unit tests for password hashing
- [ ] Integration tests for registration endpoint
- [ ] Integration tests for login endpoint
- [ ] E2E tests for complete auth flow
- [ ] Test rate limiting
- [ ] Test invalid credentials
- [ ] Test session expiration

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- Implementation Plan: Section 1.2 Authentication System
