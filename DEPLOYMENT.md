# Deployment Guide

This guide covers deploying the Recipe & Pantry Tracker application to production on Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Vercel Configuration](#vercel-configuration)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Error Tracking](#monitoring--error-tracking)
7. [Deployment Process](#deployment-process)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Vercel account created
- [ ] Production PostgreSQL database provisioned (Vercel Postgres or Supabase)
- [ ] Supabase project created (for real-time features)
- [ ] Sentry account created (for error tracking)
- [ ] GitHub repository connected to Vercel
- [ ] All tests passing locally
- [ ] Code reviewed and merged to main branch

---

## Environment Setup

### Required Environment Variables

Set these environment variables in your Vercel project settings:

#### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
```

#### Authentication (NextAuth.js)
```bash
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
```

#### File Storage (Vercel Blob)
```bash
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

#### Supabase (Real-time Sync)
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

#### Sentry (Error Tracking)
```bash
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

### GitHub Secrets for CI/CD

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
VERCEL_TOKEN           # From Vercel account settings
VERCEL_ORG_ID         # From Vercel project settings
VERCEL_PROJECT_ID     # From Vercel project settings
```

---

## Database Setup

### 1. Create Production Database

**Option A: Vercel Postgres**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create recipe-tracker-prod
```

**Option B: Supabase**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Copy connection string from Settings → Database

### 2. Run Migrations

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Run migrations
./scripts/migrate-production.sh
```

### 3. Seed Initial Data

```bash
# Optional: Seed ingredient categories and common ingredients
SEED_DATA=true ./scripts/migrate-production.sh
```

### 4. Configure Backups

**For Vercel Postgres:**
- Automatic daily backups enabled by default
- 30-day retention period

**For Supabase:**
1. Go to Database → Backups
2. Enable Point-in-Time Recovery (PITR)
3. Configure backup schedule

---

## Vercel Configuration

### 1. Create Vercel Project

```bash
# Install Vercel CLI
npm i -g vercel

# Link project to Vercel
vercel link
```

### 2. Configure Project Settings

The project includes a `vercel.json` configuration file with:
- Security headers (X-Frame-Options, CSP, etc.)
- Build and install commands
- Framework settings

### 3. Set Environment Variables

```bash
# Using Vercel CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all other required variables
```

Or use the Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment

### 4. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to use custom domain

---

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes two workflows:

#### 1. Test Workflow (`.github/workflows/test.yml`)
- Runs on all pushes and PRs
- Executes unit tests, integration tests, and E2E tests
- Validates code quality (linting, type checking)
- Checks test coverage thresholds

#### 2. Deployment Workflow (`.github/workflows/deploy.yml`)
- Runs tests before deployment
- **Preview Deployments**: Auto-deploys PRs to preview URLs
- **Production Deployments**: Auto-deploys main branch to production

### Deployment Flow

```mermaid
graph LR
    A[Push to Branch] --> B{Branch?}
    B -->|Feature Branch| C[Run Tests]
    C --> D[Create PR]
    D --> E[Deploy Preview]
    B -->|Main Branch| F[Run Tests]
    F --> G{Tests Pass?}
    G -->|Yes| H[Deploy Production]
    G -->|No| I[Block Deployment]
```

---

## Monitoring & Error Tracking

### Sentry Setup

1. **Create Sentry Project**
   - Go to [Sentry Dashboard](https://sentry.io)
   - Create new Next.js project
   - Copy DSN

2. **Install Sentry SDK**
   ```bash
   pnpm add @sentry/nextjs
   ```

3. **Configuration Files**
   The project includes:
   - `sentry.client.config.ts` - Client-side error tracking
   - `sentry.server.config.ts` - Server-side error tracking
   - `sentry.edge.config.ts` - Edge runtime error tracking

4. **Set Environment Variables**
   ```bash
   SENTRY_DSN="your-sentry-dsn"
   NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
   ```

### Vercel Analytics

1. Enable in Vercel Dashboard → Analytics
2. Monitor performance metrics, Web Vitals, etc.

### Uptime Monitoring

**Recommended Services:**
- [UptimeRobot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

**Configure Monitors:**
- Homepage: `https://your-domain.com`
- Health Check: `https://your-domain.com/api/health`
- Check interval: 5 minutes
- Alert methods: Email, Slack, SMS

---

## Deployment Process

### Automatic Deployment (Recommended)

1. **Create Pull Request**
   ```bash
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "Add new feature"
   git push origin feature/your-feature
   ```

2. **Review Preview Deployment**
   - GitHub Actions will automatically deploy to preview URL
   - Test the changes on preview deployment
   - Review code with team

3. **Merge to Main**
   ```bash
   # After PR approval
   gh pr merge --merge
   ```

4. **Automatic Production Deployment**
   - Merging to main triggers production deployment
   - Monitor deployment in Vercel Dashboard
   - Check Sentry for any errors

### Manual Deployment

If needed, you can deploy manually:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Post-Deployment Checklist

After deploying to production, verify:

### Application Health
- [ ] Application loads at production URL
- [ ] Health check endpoint responds: `/api/health`
- [ ] No errors in Vercel logs
- [ ] No errors in Sentry dashboard

### Core Features
- [ ] User registration works
- [ ] User login works
- [ ] Create/edit/delete recipes
- [ ] Import recipe from URL
- [ ] Pantry management functions
- [ ] Grocery list generation works
- [ ] Real-time sync between household members

### Performance
- [ ] Lighthouse score > 90
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms

### Monitoring
- [ ] Sentry capturing errors
- [ ] Vercel Analytics collecting data
- [ ] Uptime monitoring active
- [ ] Database backups running

### Security
- [ ] HTTPS enforced
- [ ] Security headers present (check with securityheaders.com)
- [ ] Authentication working correctly
- [ ] Authorization rules enforced

---

## Rollback Procedures

### Rollback Deployment

If you need to rollback to a previous deployment:

```bash
# Using the rollback script
./scripts/rollback.sh

# Or using Vercel CLI
vercel ls --prod                    # List deployments
vercel promote <deployment-url>     # Promote previous deployment
```

### Rollback Database

If database migrations caused issues:

1. **Create Backup** (if not already done)
   ```bash
   # For Postgres
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Restore Previous State**
   ```bash
   # For Supabase: Use Point-in-Time Recovery in dashboard
   # For Vercel Postgres: Restore from automatic backup
   ```

3. **Test Application**
   - Verify application works with rolled-back database
   - Check that no data was lost

### Emergency Rollback Checklist

- [ ] Identify the issue and last working deployment
- [ ] Notify team of rollback
- [ ] Execute rollback using script or Vercel dashboard
- [ ] Verify application is working
- [ ] Check database consistency
- [ ] Monitor error rates in Sentry
- [ ] Document issue and root cause
- [ ] Create fix for the issue
- [ ] Plan re-deployment

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error:** Type errors during build
```bash
# Run type check locally
pnpm run type-check

# Fix type errors before pushing
```

**Error:** Missing environment variables
```bash
# Verify all required env vars are set in Vercel
vercel env ls
```

#### 2. Database Connection Issues

**Error:** "Connection refused" or "Database unavailable"

1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Vercel
3. Verify connection string includes SSL parameters if required:
   ```
   ?sslmode=require
   ```

#### 3. Real-time Sync Not Working

1. Verify Supabase credentials are correct
2. Check Supabase project is not paused
3. Verify Realtime is enabled for tables:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE grocery_list_items;
   ```

#### 4. Authentication Errors

**Error:** "NEXTAUTH_SECRET is not set"

1. Generate new secret: `openssl rand -base64 32`
2. Set in Vercel environment variables
3. Redeploy

#### 5. High Error Rates

1. Check Sentry dashboard for error patterns
2. Review Vercel logs
3. Check recent deployments for breaking changes
4. Consider rollback if critical

#### 6. Performance Issues

1. Check Vercel Analytics for bottlenecks
2. Review database query performance
3. Check for N+1 queries
4. Add database indexes if needed
5. Enable caching where appropriate

### Getting Help

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Sentry Support:** [sentry.io/support](https://sentry.io/support)
- **Project Issues:** Create issue in GitHub repository

---

## Maintenance

### Regular Tasks

**Weekly:**
- [ ] Review Sentry errors and fix critical issues
- [ ] Check uptime monitoring reports
- [ ] Review Vercel Analytics for performance trends

**Monthly:**
- [ ] Update dependencies (`pnpm update`)
- [ ] Review and optimize database queries
- [ ] Check database backup integrity
- [ ] Review and rotate secrets if needed

**Quarterly:**
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Database cleanup (remove old data)
- [ ] Cost optimization review

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Sentry Next.js Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

## Support

For deployment issues or questions:

1. Check this documentation
2. Review Vercel and Sentry logs
3. Search existing GitHub issues
4. Create new issue with detailed information

---

**Last Updated:** 2025-11-21
**Version:** 1.0
