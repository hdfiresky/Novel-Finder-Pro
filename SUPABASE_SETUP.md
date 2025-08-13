# Supabase Setup Guide

Follow these steps to set up your Supabase backend for the Novel Finder Pro application.

## 1. Create Tables

Go to the "SQL Editor" in your Supabase project dashboard and run the following SQL queries to create the necessary tables.

### Profiles Table
This table stores user profile information, including their username and custom UI settings. It is linked to the `auth.users` table.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  email text,
  show_favorite_button boolean default false,
  show_wishlist_button boolean default true,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);
```

### Auto-create profile on new user sign-up
This trigger will automatically create a new row in the `public.profiles` table whenever a new user signs up.

```sql
--
-- Function to create a profile for a new user
--
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, show_favorite_button, show_wishlist_button)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    false, -- Default for favorite button
    true   -- Default for wishlist button
  );
  return new;
end;
$$;

--
-- Trigger to execute the function after a new user is created
--
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

```

### Favorites Table
This table stores the many-to-many relationship between users and their favorite novels.

```sql
create table favorites (
  user_id uuid references public.profiles on delete cascade not null,
  novel_id text not null,
  created_at timestamp with time zone default now(),
  
  primary key (user_id, novel_id)
);

-- Set up Row Level Security (RLS)
alter table favorites
  enable row level security;

create policy "Users can view their own favorites." on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites." on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites." on favorites
  for delete using (auth.uid() = user_id);
```

### Wishlist Table
This table stores the many-to-many relationship between users and their wishlisted novels.

```sql
create table wishlist (
  user_id uuid references public.profiles on delete cascade not null,
  novel_id text not null,
  created_at timestamp with time zone default now(),
  
  primary key (user_id, novel_id)
);

-- Set up Row Level Security (RLS)
alter table wishlist
  enable row level security;

create policy "Users can view their own wishlist." on wishlist
  for select using (auth.uid() = user_id);

create policy "Users can insert their own wishlist." on wishlist
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own wishlist." on wishlist
  for delete using (auth.uid() = user_id);
```

### Reviews Table
This table stores user reviews for novels.

```sql
create table reviews (
  user_id uuid references public.profiles on delete cascade not null,
  novel_id text not null,
  rating smallint not null,
  text text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  primary key (user_id, novel_id),
  constraint rating_check check (rating >= 1 and rating <= 10)
);

-- Set up Row Level Security (RLS)
alter table reviews
  enable row level security;

create policy "Reviews are public." on reviews
  for select using (true);

create policy "Users can insert their own reviews." on reviews
  for insert with check (auth.uid() = user_id);
  
create policy "Users can update their own reviews." on reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews." on reviews
  for delete using (auth.uid() = user_id);
```

## 2. Disable Realtime (Optional but Recommended)
For this application's needs, realtime updates are not necessary and consume resources. You can disable them for the tables you created.

1.  Go to **Database -> Replication**.
2.  Click on "0 tables" under the `supabase_realtime` publication.
3.  Uncheck all the tables (`profiles`, `favorites`, `wishlist`, `reviews`).

Your backend is now ready!
