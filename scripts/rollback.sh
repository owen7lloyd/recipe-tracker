#!/bin/bash

# Vercel Deployment Rollback Script
# This script helps rollback to a previous deployment on Vercel
# Usage: ./scripts/rollback.sh [deployment-url]

set -e

echo "🔄 Vercel Deployment Rollback Script"
echo "===================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Error: Vercel CLI is not installed"
  echo "Install it with: npm i -g vercel"
  exit 1
fi

# Get deployment URL from argument or prompt
DEPLOYMENT_URL=$1

if [ -z "$DEPLOYMENT_URL" ]; then
  echo ""
  echo "📋 Fetching recent deployments..."
  vercel ls --prod

  echo ""
  echo "Please provide the deployment URL to rollback to:"
  read -r DEPLOYMENT_URL
fi

if [ -z "$DEPLOYMENT_URL" ]; then
  echo "❌ Error: No deployment URL provided"
  exit 1
fi

echo ""
echo "⚠️  WARNING: You are about to rollback production to:"
echo "   $DEPLOYMENT_URL"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

echo "🔄 Rolling back production deployment..."

# Promote the specified deployment to production
vercel promote "$DEPLOYMENT_URL" --yes

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Rollback successful!"
  echo "🌐 Production is now serving: $DEPLOYMENT_URL"
  echo ""
  echo "⚠️  IMPORTANT: Remember to:"
  echo "   1. Check that the application is working correctly"
  echo "   2. Consider rolling back database migrations if needed"
  echo "   3. Notify your team about the rollback"
  echo "   4. Investigate and fix the issue that caused the rollback"
else
  echo ""
  echo "❌ Rollback failed!"
  echo "Please check your Vercel configuration and try again."
  exit 1
fi
