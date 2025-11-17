# Production Deployment

**Phase:** 4 - Polish & Deploy
**Priority:** P0
**Estimate:** 4 days

## Description

Deploy the application to production on Vercel with proper configuration, monitoring, error tracking, and CI/CD pipeline.

## Tasks

### Production Database
- [ ] Set up production PostgreSQL database
- [ ] Run migrations on production database
- [ ] Seed production data (ingredients, categories)
- [ ] Configure database backups
- [ ] Set up connection pooling

### Vercel Setup
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL certificates

### Environment Configuration
- [ ] Set `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL`
- [ ] Set `DATABASE_URL`
- [ ] Set `BLOB_STORAGE_URL`
- [ ] Set real-time service credentials
- [ ] Set email service credentials (if applicable)

### CI/CD Pipeline
- [ ] Configure GitHub Actions workflow
- [ ] Run tests on PR
- [ ] Auto-deploy preview on PR
- [ ] Auto-deploy production on merge to main
- [ ] Environment-specific deployments

### Monitoring & Observability
- [ ] Set up error tracking (Sentry)
- [ ] Configure Vercel Analytics
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up performance monitoring

### Error Tracking
- [ ] Install Sentry SDK
- [ ] Configure error capture
- [ ] Set up source maps
- [ ] Configure user context
- [ ] Set up alert notifications

### Security
- [ ] Enable security headers
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable HTTPS only
- [ ] Configure CSP headers

### Performance
- [ ] Enable Next.js optimizations
- [ ] Configure CDN caching
- [ ] Set up image optimization
- [ ] Enable compression
- [ ] Configure cache headers

### Backups
- [ ] Automated daily database backups
- [ ] Backup retention policy (30 days)
- [ ] Point-in-time recovery enabled
- [ ] Test backup restoration
- [ ] Document backup procedures

### Documentation
- [ ] Update README with production URL
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedures
- [ ] Create incident response plan

## Acceptance Criteria

- [ ] Application deployed to production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active
- [ ] All environment variables set
- [ ] Error tracking working
- [ ] Analytics collecting data
- [ ] Uptime monitoring active
- [ ] Backups running automatically
- [ ] CI/CD pipeline functional
- [ ] Zero downtime deployment

## Technical Details

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SENTRY_DSN": "@sentry-dsn"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### CI/CD Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
        env:
          VERCEL_ENV: preview

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
        env:
          VERCEL_ENV: production
```

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null
    }
    return event
  },
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/.*\.vercel\.app/,
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### Database Migration Script

```bash
#!/bin/bash
# scripts/migrate-production.sh

set -e

echo "Running production migrations..."

# Load environment
source .env.production

# Run migrations
pnpm db:migrate

# Seed production data if needed
if [ "$SEED_DATA" = "true" ]; then
  echo "Seeding production data..."
  pnpm db:seed:production
fi

echo "Migrations complete!"
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }, { status: 500 })
  }
}
```

### Monitoring Dashboard Setup

```typescript
// Uptime monitoring with UptimeRobot or similar
const monitors = [
  {
    name: 'Recipe Tracker - Homepage',
    url: 'https://app.example.com',
    interval: 300, // 5 minutes
    type: 'http'
  },
  {
    name: 'Recipe Tracker - API Health',
    url: 'https://app.example.com/api/health',
    interval: 300,
    type: 'http',
    expectedStatus: 200
  }
]
```

### Rollback Procedure

```bash
#!/bin/bash
# scripts/rollback.sh

# List recent deployments
vercel list

# Rollback to specific deployment
DEPLOYMENT_ID=$1

if [ -z "$DEPLOYMENT_ID" ]; then
  echo "Usage: ./rollback.sh <deployment-id>"
  exit 1
fi

echo "Rolling back to deployment: $DEPLOYMENT_ID"
vercel alias set $DEPLOYMENT_ID app.example.com --scope your-team

echo "Rollback complete!"
```

## Dependencies

- [ ] #15 UI/UX Polish completed
- [ ] #16 Testing Suite passing
- Vercel account created
- Production database provisioned

## Testing

- [ ] Test deployment to preview environment
- [ ] Verify all environment variables set
- [ ] Test database connection in production
- [ ] Verify error tracking captures errors
- [ ] Test rollback procedure
- [ ] Verify backups are running
- [ ] Check health endpoint
- [ ] Verify SSL certificates

## Post-Deployment Checklist

- [ ] Verify application loads at production URL
- [ ] Test user registration and login
- [ ] Create test recipe
- [ ] Test recipe import
- [ ] Test pantry management
- [ ] Test grocery list generation
- [ ] Test real-time sync with 2+ users
- [ ] Verify error tracking working (trigger test error)
- [ ] Check analytics dashboard
- [ ] Verify uptime monitoring active
- [ ] Test on mobile devices
- [ ] Performance audit with Lighthouse (> 90 score)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- Implementation Plan: Section 4.4 Deployment
