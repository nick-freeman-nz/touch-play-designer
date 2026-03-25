# Touch Play Designer

A web app for creating, animating, and sharing touch rugby plays with your team.

## Features

- **Drag & position** players on a realistic touch field
- **Draw routes** by clicking waypoints for each player
- **Animate plays** to see all routes run simultaneously
- **Save & load** plays (localStorage, or Supabase for shared access)
- **Export video** of animated plays as WebM to share with the team

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## How to Use

1. **Move mode** (default) — drag players to starting positions
2. **Draw Route mode** — click a player, then click the field to add waypoints
3. **Play** — hit Play to animate all routes
4. **Save** — name your play and save it in the sidebar
5. **Export Video** — records the animation as a downloadable `.webm` file

## Supabase Setup (Optional)

For shared access across team members:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL editor:

```sql
create table plays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  players jsonb not null,
  field_type text default 'touch',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table plays enable row level security;
create policy "Authenticated users can do everything" on plays
  for all using (auth.role() = 'authenticated');
```

3. Copy `.env.example` to `.env` and fill in your Supabase URL and anon key

## Deploy to Netlify

1. Push to GitHub
2. Connect the repo in Netlify
3. It auto-detects the `netlify.toml` config — done!

## Tech Stack

- React + Vite
- Tailwind CSS
- HTML5 Canvas
- Supabase (optional)
- MediaRecorder API for video export
