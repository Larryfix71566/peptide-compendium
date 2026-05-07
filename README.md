# Peptide Compendium

A full-stack peptide reference app built with React + Supabase.

## Setup

1. Run the SQL in `schema.sql` in your Supabase SQL Editor
2. Copy `.env.example` to `.env` and fill in your Supabase credentials
3. `npm install`
4. `npm run dev`

## Deploy to Vercel

1. Push this repo to GitHub (make sure `.env` is in `.gitignore`)
2. Connect repo to Vercel at vercel.com
3. In Vercel project settings, add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy - Vercel auto-builds on every push
