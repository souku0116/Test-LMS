# Lead Manager

This is a React + Vite frontend for a lightweight lead-management app. It connects to Supabase Auth and a Supabase Edge Function for CRUD operations.

## Prerequisites
- Node.js 18+ (for Vite)
- A Supabase project (already created)

## Local setup
1. Install dependencies:
   - `npm i`

2. Create a `.env` file (copy from `.env.example`) and set your Supabase values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_FUNCTION_URL` (optional if you keep the default function name)

3. Start the dev server:
   - `npm run dev`

## Supabase backend
This project expects a Supabase Edge Function named `make-server-d67cb24d` with the routes defined in `supabase/functions/server/index.tsx` and a KV table defined in `supabase/functions/server/kv_store.tsx`.

If you already deployed the function in your Supabase project, update the `.env` values to match your project.

## Deploy to Vercel
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing is handled by `vercel.json`

Set these environment variables in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_FUNCTION_URL`
