# Documentation

This directory contains all project documentation organized by category.

## Quick Links

### Core Documentation
- **[Product Requirements (PRD)](./recipe-pantry-tracker-PRD.md)** - Complete product specifications and features
- **[CLAUDE.md](../CLAUDE.md)** - AI assistant guide for working on this codebase

### Setup & Configuration
- **[Authentication Setup](./AUTHENTICATION_SETUP.md)** - User authentication configuration
- **[Database Setup](./DATABASE_SETUP.md)** - Database initialization and configuration
- **[Realtime Setup](./REALTIME_SETUP.md)** - Getting started with real-time features
- **[Supabase Realtime Configuration](./SUPABASE_REALTIME_SETUP.md)** - Detailed Supabase technical configuration
- **[Production Deployment](./PRODUCTION_DEPLOYMENT.md)** - Deployment to production environments

### Implementation

The `/implementation` directory contains implementation guides and planning documents:
- **[Implementation Plan](./implementation/IMPLEMENTATION_PLAN.md)** - Overall development phases and strategy
- **[Design Implementation Instructions](./implementation/DESIGN_IMPLEMENTATION_INSTRUCTIONS.md)** - UI/UX design specifications
- **[Component Implementation Instructions](./implementation/implementation-instructions.md)** - Specific component implementation guides

### Issues & Tracking

#### Implementation Issues
The `/issues` directory contains numbered implementation requirements for major features:
- `01-project-setup.md` through `17-deployment.md`

#### Known Bugs
The `/bugs` directory documents known issues and fixes:
- Session stale after household join
- Recipe import ingredient field mapping
- Ingredient unit conversion missing

#### Enhancement Proposals
The `/enhancements` directory contains proposed features and improvements:
- Smart unit options
- Tracking features
- Recipe notes and step timers
- What can I cook with reduced servings
- Search by ingredients
- And more...

### API & Technical Documentation

The `/api` directory contains API reference documentation:
- Recipe operations
- Ingredient substitution service
- List management endpoints

### Database

The `/database` directory contains SQL scripts and migrations:
- SQL migration files
- Setup scripts for Supabase Realtime

## Directory Structure

```
docs/
├── README.md                          (This file)
├── [Configuration & Setup Files]
│   ├── AUTHENTICATION_SETUP.md
│   ├── DATABASE_SETUP.md
│   ├── REALTIME_SETUP.md
│   ├── SUPABASE_REALTIME_SETUP.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── SUBSTITUTION_SERVICE_API.md
│   └── recipe-pantry-tracker-PRD.md
├── implementation/                    (Implementation planning)
│   ├── IMPLEMENTATION_PLAN.md
│   ├── DESIGN_IMPLEMENTATION_INSTRUCTIONS.md
│   ├── implementation-instructions.md
│   └── 07-recipe-web-import.md
├── issues/                            (Feature implementation issues)
│   ├── 01-project-setup.md
│   ├── 02-database-schema.md
│   ├── ... (03-17)
│   └── coordination/
├── bugs/                              (Known issues)
│   ├── 01-session-stale-after-household-join.md
│   ├── 02-recipe-import-ingredient-field-mapping.md
│   └── 03-ingredient-unit-conversion-missing.md
├── enhancements/                      (Feature proposals)
│   ├── 001-migrate-middleware-to-proxy.md
│   ├── 002-custom-ingredients.md
│   ├── ... (003-22)
├── api/                               (API documentation)
│   ├── cook-recipe.md
│   └── recipe-scaling.md
├── database/                          (Database scripts & migrations)
│   ├── enable-grocery-lists-realtime.sql
│   ├── supabase-safe-migration.sql
│   └── recipe_notes.sql
└── test/                              (Test documentation)
    └── TEST_DOCUMENTATION.md
```

## Navigation Tips

- **Starting with the project?** Begin with [README.md](../README.md) then [CLAUDE.md](../CLAUDE.md)
- **Setting up locally?** Follow the [Setup & Configuration](#setup--configuration) guides
- **Understanding features?** Check the [Implementation Issues](/docs/issues/) for detailed specifications
- **Deploying?** See [Production Deployment](./PRODUCTION_DEPLOYMENT.md)
- **Reporting bugs?** Check [Known Bugs](./bugs/) first
- **Proposing features?** Review [Enhancement Proposals](./enhancements/)

## Contributing

When adding new documentation:
1. Place feature/issue docs in the appropriate category folder
2. Use clear, descriptive file names
3. Update this README to link to new documentation
4. Keep the directory structure consistent
