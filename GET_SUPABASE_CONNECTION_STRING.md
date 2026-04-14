# Get Your Supabase Connection String

Since you've restored the database, follow these steps to get the connection string:

## Steps:

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon in sidebar)
3. Click on **Database**
4. Scroll down to **Connection String** section
5. You'll see two tabs:
   - **URI** (use this one)
   - **Connection pooling**

6. Copy the connection string from the **URI** tab
   - It looks like: `postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres`

7. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
   - The password is shown in the dashboard
   - Or use the password you set when creating the project

## Once you have it:

Paste the connection string here (I'll update all the files for you):

```
DATABASE_URL="postgresql://postgres.lfjqtefsfhkzlzixleee:[YOUR-PASSWORD]@db.lfjqtefsfhkzlzixleee.supabase.co:5432/postgres"
```

Just reply with the full connection string and I'll update everything!
