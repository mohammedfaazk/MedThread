# How to Find Database Connection String (Not API Keys)

You gave me the API keys, but I need the **PostgreSQL Database Connection String**.

## Follow These Steps:

1. Go to: https://supabase.com/dashboard/project/lfjqtefsfhkzlzixleee

2. Click **Settings** (gear icon) in the left sidebar

3. Click **Database** (NOT "API")

4. Scroll down to find **"Connection String"** section

5. You'll see tabs like:
   - URI
   - JDBC
   - .NET
   - etc.

6. Click on **"URI"** tab

7. You'll see something like:
   ```
   postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres
   ```

8. Click the **"Copy"** button or manually copy it

9. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
   - The password should be shown on the same page
   - Or it's the password you set when creating the project
   - It might be: `MedthreadDev` (based on your old config)

## What I Need:

The full connection string that looks like:
```
postgresql://postgres.lfjqtefsfhkzlzixleee:YOUR_ACTUAL_PASSWORD@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres
```

## Quick Link:

Direct link to database settings:
https://supabase.com/dashboard/project/lfjqtefsfhkzlzixleee/settings/database

---

**Note**: The API keys you provided are for the Supabase client library, not for direct database connection.
