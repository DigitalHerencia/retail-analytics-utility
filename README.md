# Retail Analytics Utility

A comprehensive retail analytics tool for business management, inventory tracking, and financial analysis.

## Features

- Pricing scenario analysis
- Inventory management
- Customer relationship management
- Accounts receivable tracking
- Cash register functionality
- Sales and profit tracking
- Data privacy controls

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (Neon)
- Vercel Deployment

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)

### Environment Setup

1. Copy the example environment file:
   \`\`\`
   cp .env.example .env
   \`\`\`

2. Update the `.env` file with your database credentials:
   \`\`\`
   DATABASE_URL=postgres://user:password@host:port/database
   \`\`\`

### Installation

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Set up the database:
   \`\`\`
   npm run setup-db
   \`\`\`

3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub.

2. Connect your GitHub repository to Vercel.

3. Add the following environment variables in Vercel:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NODE_ENV`: Set to `production`

4. Deploy! The database migrations will run automatically during the build process.

## Database Management

- Run migrations: `npm run migrate`
- Seed the database: `npm run seed`
- Complete setup: `npm run setup-db`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
