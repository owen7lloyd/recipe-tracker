#!/bin/bash

# Production Migration Script
# This script runs database migrations for production environment
# Usage: ./scripts/migrate-production.sh

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting production migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Validate we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Are you in the project root?"
  exit 1
fi

echo "📊 Current database: ${DATABASE_URL%%\?*}"  # Print URL without query params

# Create a backup timestamp
BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
echo "📅 Backup timestamp: $BACKUP_TIMESTAMP"

# Run migrations
echo "🔄 Running database migrations..."
pnpm run db:migrate

# Check if migrations were successful
if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"

  # Optionally seed production data
  if [ "$SEED_DATA" = "true" ]; then
    echo "🌱 Seeding production data..."
    pnpm run db:seed

    if [ $? -eq 0 ]; then
      echo "✅ Seeding completed successfully!"
    else
      echo "⚠️  Warning: Seeding failed but migrations succeeded"
      exit 1
    fi
  fi
else
  echo "❌ Migration failed!"
  exit 1
fi

echo "🎉 Production migration complete!"
