# MapLeads Database Migrations

This directory contains database migration files for the MapLeads application. These migrations define the database schema and should be applied to your Supabase project.

## Structure

- `supabase/` - Contains SQL migration files for Supabase

## How to Apply Migrations

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of each migration file
4. Paste into the SQL Editor
5. Run the SQL statements

Apply the migrations in numerical order (e.g., 001_initial_schema.sql first).

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can apply migrations using:

```bash
supabase db push
```

For more information on using the Supabase CLI for migrations, see the [Supabase documentation](https://supabase.com/docs/guides/cli/local-development).

## Migration Files

- `001_initial_schema.sql` - Creates the initial database schema including:
  - `searches` table - Stores user search history
  - `businesses` table - Stores business information
  - `search_results` table - Junction table linking searches to businesses
  - `leads` table - Tracks businesses marked as leads by users
  - Indexes for performance optimization
  - Row-Level Security (RLS) policies
  - Helper functions for common operations

## Schema Diagram

```
┌─────────────┐       ┌──────────────┐       ┌────────────┐
│   users     │       │   searches   │       │ businesses │
│ (auth.users)│◄──────┤              │       │            │
└─────────────┘       └──────┬───────┘       └─────┬──────┘
       ▲                     │                     │
       │                     │                     │
       │                     ▼                     │
       │              ┌──────────────┐             │
       │              │search_results│             │
       │              └──────┬───────┘             │
       │                     │                     │
       │                     │                     │
       │                     ▼                     ▼
       └────────────────┐ leads ◄─────────────────┘
                        └───────┘
```

## Notes

- The `auth.users` table is automatically created and managed by Supabase Auth
- Row-Level Security (RLS) policies ensure users can only access their own data
- Indexes are created for frequently queried columns to improve performance
