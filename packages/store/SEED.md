# Database Seeding

This directory contains a comprehensive database seeding script that generates realistic test data for the Buzz8n application.

## Overview

The seed script generates:

- **50 users** with realistic names and email addresses
- **200-400 credentials** (2-8 per user) across different platforms
- **150-750 workflows** (3-15 per user) with realistic node/edge configurations
- **~30 webhooks** for active workflows
- **~15,000-25,000 executions** with various statuses and timestamps

## What Gets Generated

### Users

- All users have the password: `Test123!@#`
- Names are randomly generated from predefined lists
- Email addresses use various domains (example.com, test.com, etc.)

### Credentials

Generates credentials for all supported platforms:

- **OpenAI**: API keys with organization IDs
- **Anthropic**: API keys with version information
- **Gemini**: API keys with project IDs
- **Email**: SMTP configuration with host, port, username, password
- **Telegram**: Bot tokens with chat IDs

### Workflows

Three different workflow templates:

1. Customer Support Automation
2. Content Generation Pipeline
3. Data Processing Workflow

Each workflow includes:

- Nodes and edges configuration
- Random active/inactive status
- Some workflows are archived (10% chance)
- Execution status (initial, success, or error)

### Webhooks

- Created for ~30% of active workflows
- Random HTTP methods (POST, GET, PUT)
- Unique paths and secrets
- Linked to their parent workflows

### Executions

- 5-50 executions per non-archived workflow
- Multiple statuses (initial, loading, success, error)
- Timestamps spanning the last 3 months
- Duration calculations and logs
- Realistic summaries

## Running the Seed Script

### From the root directory:

```bash
bun run db:seed
```

### From the store package:

```bash
cd packages/store
bun run db:seed
```

### Direct execution:

```bash
bun run packages/store/prisma/seed.ts
```

## Prerequisites

1. Database must be initialized and migrated:

   ```bash
   bun run db:migrate
   ```

2. Ensure `DATABASE_URL` is set in your environment

## ⚠️ Important Notes

- **This script clears all existing data** before seeding
- Intended for development and testing only
- Do not run in production environments
- Takes approximately 30-60 seconds to complete

## Customizing the Seed Data

You can modify the seed script to adjust:

- Number of users (`userCount` variable)
- Credentials per user (range: 2-8)
- Workflows per user (range: 3-15)
- Executions per workflow (range: 5-50)
- Active/archived percentages
- Date range for executions

## Sample Output

```
🌱 Starting database seeding...
🗑️  Clearing existing data...
👥 Creating users...
✅ Created 50 users
🔑 Creating credentials...
✅ Created 287 credentials
🔄 Creating workflows...
✅ Created 387 workflows
🔗 Creating webhooks...
✅ Created 29 webhooks
⚡ Creating executions...
✅ Created 18,456 executions

✅ Seeding completed successfully!

📊 Summary:
   Users: 50
   Credentials: 287
   Workflows: 387
   Webhooks: 29
   Executions: 18,456
```

## Testing After Seeding

After running the seed script, you can test the application with realistic data:

1. Log in with any of the generated users
2. Check the credentials list for variety
3. View workflows with different statuses
4. Check execution history
5. Test pagination and filtering

## Reset and Reseed

To start fresh:

```bash
bun run db:reset  # Drops database and reapplies migrations
bun run db:seed   # Seeds the database with test data
```
