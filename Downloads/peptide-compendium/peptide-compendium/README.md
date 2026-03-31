# Peptide Compendium

A full-stack peptide reference application built with React + Vite + Supabase.

## Features

- 34 peptides across 9 standard categories
- Diabetes and Menopause condition categories with subcategories
- Context-aware detail pages for condition categories
- Dosing timing & optimization section for every peptide
- Stacking dos and don'ts for every peptide
- Home page with category overview
- Top navigation with dropdown peptide selector
- Favorites system synced to Supabase via profile key (PIN)
- Full-text search across all compounds

## Tech Stack

- **Frontend:** React 18, Vite
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (recommended)

---

## Database Setup (Supabase)

Run these SQL files **in order** in your Supabase SQL Editor:

1. `schema.sql` — creates all base tables and seeds all 34 peptides
2. `migration.sql` — adds dosing_timing table with timing data for all peptides
3. `condition_migration.sql` — adds Diabetes/Menopause categories, favorites table, condition context

---

## Local Development

### Prerequisites
- Node.js 18+ (nodejs.org)
- Git (git-scm.com)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file (copy from example)
cp .env.example .env

# 3. Fill in your Supabase credentials in .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Run dev server
npm run dev

# 5. Open http://localhost:5173
```

---

## Deployment (Vercel)

1. Push this repo to GitHub (`.env` is gitignored — keys stay local)
2. Go to vercel.com → Add New Project → import your GitHub repo
3. Add Environment Variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click Deploy — live in ~60 seconds
5. Every `git push` auto-redeploys

---

## Project Structure

```
peptide-compendium/
├── src/
│   ├── App.jsx                 # Main app, navigation, routing
│   ├── main.jsx                # React entry point
│   ├── components/
│   │   ├── HomePage.jsx        # Landing page with category overview
│   │   └── ProfileModal.jsx    # Profile key / favorites sync modal
│   └── lib/
│       └── supabase.js         # DB client, data fetching, favorites CRUD
├── schema.sql                  # Base schema + all 34 peptides seed data
├── migration.sql               # Dosing timing table + data
├── condition_migration.sql     # Diabetes/Menopause + favorites table
├── index.html                  # HTML entry point
├── vite.config.js              # Vite configuration
├── package.json
└── .env.example                # Environment variable template
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## Disclaimer

This application is for educational and research purposes only.
Content is NOT medical advice. Many compounds are research chemicals
not approved for human use. Consult a qualified healthcare provider
before considering any peptide therapy.
