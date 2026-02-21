# Lead Manager

This is a React + Vite frontend for a lightweight lead-management app. It connects to Supabase Auth and a Supabase Edge Function for CRUD operations.

## Tech stack / tools
- React 18
- Vite 6
- Tailwind CSS 4
- Supabase JS v2
- npm (package manager)

## Fresh machine setup (no dev tools installed)

### 1) Install base tools
- Git
- Node.js 20 LTS (minimum supported for this repo: Node.js 18+)
- npm (installed with Node.js)

Verify:
- `git --version`
- `node -v`
- `npm -v`

### 2) System settings (one-time)

#### macOS
1. Install Apple Command Line Tools:
   - `xcode-select --install`
2. Install Homebrew (optional but recommended): https://brew.sh
3. Install Git and Node.js (if not already installed):
   - `brew install git node@20`

#### Windows
1. Install Git for Windows: https://git-scm.com/download/win
2. Install Node.js 20 LTS: https://nodejs.org
3. Enable long paths (helps avoid `node_modules` path issues):
   - Run as admin: `git config --system core.longpaths true`

#### Linux (Debian/Ubuntu)
1. Install base packages:
   - `sudo apt update && sudo apt install -y git curl ca-certificates build-essential`
2. Install Node.js 20 LTS from NodeSource (or use your preferred version manager):
   - https://github.com/nodesource/distributions

### 3) Clone and install
1. Clone the repository:
   - `git clone <your-repo-url>`
2. Enter the project:
   - `cd Test1`
3. Install dependencies:
   - `npm i`

### 4) Environment setup
1. Copy env file:
   - `cp .env.example .env`
2. Confirm/update these variables in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_FUNCTION_URL` (optional if you keep the default function name)

### 5) Run locally
- Start the dev server:
   - `npm run dev`
- Build:
   - `npm run build`
- Preview production build:
   - `npm run preview`

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
