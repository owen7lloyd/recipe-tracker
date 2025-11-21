# Recipe & Pantry Tracker

A multi-platform application designed to streamline meal planning and grocery shopping for households. Combines recipe management, pantry inventory tracking, and intelligent grocery list generation to reduce food waste and simplify cooking decisions.

## Features

- **Recipe Management**: Create, import, and organize recipes from websites
- **Pantry Tracking**: Keep track of ingredients you have at home
- **Smart Matching**: Find recipes you can cook with current ingredients
- **Grocery Lists**: Auto-generate shopping lists from selected recipes
- **Household Sharing**: Share recipes and lists with family members
- **Recipe Scaling**: Adjust serving sizes with automatic quantity recalculation

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router with TypeScript)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Platform**: Vercel (Serverless Functions)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js v5
- **File Storage**: Vercel Blob Storage

### Development Tools
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Git Hooks**: Husky + lint-staged
- **Testing**: Vitest (unit), Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL database (local or hosted)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)

4. **Set up the database**
   ```bash
   # Generate migrations
   pnpm db:generate

   # Run migrations
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Database
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with initial data

### Testing
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

### Deployment
- `./scripts/migrate-production.sh` - Run production migrations
- `./scripts/rollback.sh` - Rollback deployment

## Project Structure

```
/src
  /app                 # Next.js app router pages
    /(auth)            # Auth pages (login, register)
    /(dashboard)       # Protected dashboard routes
    /api               # API routes
  /components          # React components
    /ui                # shadcn/ui components
    /features          # Feature-specific components
  /lib                 # Utilities & helpers
    /db                # Database client & queries
    /auth              # Auth configuration
    /validations       # Zod schemas
  /hooks               # Custom React hooks
  /types               # TypeScript type definitions
  /store               # Zustand stores
/public                # Static assets
/drizzle               # Database schema & migrations
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts
- **households**: Household groups
- **recipes**: Recipe storage
- **recipe_ingredients**: Recipe ingredient relationships
- **ingredients**: Master ingredient list
- **pantry_items**: Current pantry inventory
- **grocery_lists**: Shopping lists
- **grocery_list_items**: Shopping list items
- **ingredient_substitutions**: Ingredient substitution rules

See `src/lib/db/schema.ts` for the complete schema definition.

## Development Workflow

### Git Workflow

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

   The pre-commit hook will automatically:
   - Format code with Prettier
   - Lint code with ESLint
   - Fix auto-fixable issues

3. Push your changes and create a PR
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with Tailwind plugin
- **Linting**: ESLint with Next.js config
- **Commit Messages**: Follow conventional commits format

### Adding UI Components

This project uses shadcn/ui. To add a new component:

```bash
pnpm dlx shadcn@latest add button
```

## Environment Variables

Required environment variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/recipe_tracker"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Generate with: openssl rand -base64 32

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=""

# Supabase (for real-time sync)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

# Sentry (Error Tracking - Production only)
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""

# Application
NODE_ENV="development"
```

## Deployment

This application is designed to be deployed on Vercel. For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy

1. **Connect to Vercel**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### CI/CD

The project includes automated deployment via GitHub Actions:
- **Preview Deployments**: Automatic on pull requests
- **Production Deployments**: Automatic on merge to main

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for details.

## Contributing

1. Check out the [Implementation Plan](IMPLEMENTATION_PLAN.md) for planned features
2. Look for open issues or create a new one
3. Fork the repository
4. Create your feature branch
5. Make your changes
6. Write/update tests
7. Ensure all tests pass
8. Submit a pull request

## Documentation

- [Product Requirements Document](recipe-pantry-tracker-PRD.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Database Setup](DATABASE_SETUP.md)
- [Authentication Setup](AUTHENTICATION_SETUP.md)
- [Test Documentation](TEST_DOCUMENTATION.md)
- [GitHub Issues](.github-issues/)

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the GitHub repository.
