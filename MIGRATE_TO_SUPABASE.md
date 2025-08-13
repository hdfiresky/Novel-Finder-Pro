# Migration Guide: From LocalStorage to Supabase

This guide provides step-by-step instructions to transition the app's data storage and authentication from the browser's `localStorage` to a persistent, cloud-based Supabase backend.

## Prerequisites

1.  **Supabase Account:** You have a Supabase account and have created a new project.
2.  **Project Credentials:** You have your project's **URL** and **anon key**. You can find these in your Supabase project dashboard under **Project Settings > API**.
3.  **Backend Setup:** You have run all the SQL commands from the `SUPABASE_SETUP.md` file in your Supabase project's SQL Editor.

## Step 1: Add Supabase Credentials

The application needs to connect to your Supabase project. It expects to find the credentials as environment variables.

You must set up a mechanism in your development environment to expose the following variables to the `process.env` object:
- `SUPABASE_URL`: Your Supabase project URL.
- `SUPABASE_ANON_KEY`: Your Supabase project's public anon key.

The application's Supabase client (`supabase/client.ts`) will automatically pick these up.

## Step 2: Modify `index.html`
Ensure the Supabase client library is included in your `index.html` file's import map.

```html
<script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.1.1/",
    "react": "https://esm.sh/react@^19.1.1",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "lucide-react": "https://esm.sh/lucide-react@^0.539.0",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@^2.45.0"
  }
}
</script>
```

## Step 3: Update Authentication (`contexts/AuthContext.tsx`)

Open the file `contexts/AuthContext.tsx` and follow these instructions:

1.  **Uncomment the Supabase client import** at the top of the file:
    ```javascript
    import { supabase } from '../supabase/client';
    ```

2.  **Comment out the entire `LOCAL STORAGE IMPLEMENTATION` block.** This includes the `useEffect` hook and the `login`, `register`, and `logout` functions that interact with `localStorage`.

3.  **Uncomment the entire `SUPABASE IMPLEMENTATION` block.** This block contains the new logic that uses the Supabase client for authentication and session management.

## Step 4: Update User Data Management (`contexts/UserDataContext.tsx`)

Open the file `contexts/UserDataContext.tsx` and follow the same pattern:

1.  **Uncomment the Supabase client import** at the top of the file:
    ```javascript
    import { supabase } from '../supabase/client';
    ```
    
2.  **Comment out the entire `LOCAL STORAGE IMPLEMENTATION` block.** This includes the `useEffect` hook that loads data from `localStorage`, the `persistData` helper function, and all associated data manipulation functions.

3.  **Uncomment the entire `SUPABASE IMPLEMENTATION` block.** This block contains the new logic for loading, adding, updating, and deleting user data (favorites, wishlist, reviews, settings) by making API calls to your Supabase database.

## Step 5: Test the Application

After making these changes, clear your browser's application data (specifically `localStorage`) to ensure you're starting fresh.

1.  Restart your application.
2.  Try registering a new account. You should see a new user appear in your Supabase project's **Authentication > Users** table and a corresponding entry in the **Table Editor > profiles** table.
3.  Log out and log back in.
4.  Add favorites, a wishlist item, and a review. Verify that these actions create new rows in the `favorites`, `wishlist`, and `reviews` tables in your Supabase dashboard.
5.  Change your interface settings and refresh the page. The settings should persist.

You have now successfully migrated the application to use Supabase for a fully persistent, multi-device experience!
