# Market & Mind

A focused dynamic site for market notes, trading psychology, trade notes, business parallels, and decision journaling.

## Local setup

```bash
npm install
npm run dev
```

## Public routes

- `/`
- `/blogs`
- `/trades`
- `/posts/:slug`

## Private admin route

The admin panel is intentionally not linked in the public navbar.

Private URL:

```text
/preet-admin
```

Frontend access is limited by `VITE_ADMIN_EMAILS`, and real database write access is enforced by Supabase Row Level Security via the `admins` table.

## Supabase setup

1. Create a Supabase project.
2. Run `src/lib/schema.sql` in the Supabase SQL editor. This creates the `posts` and `admins` tables, plus a public `post-images` Storage bucket for uploaded article images.
3. Create your Auth user in Supabase.
4. Add yourself to the `admins` table:

```sql
insert into admins (user_id)
select id from auth.users where email = 'preetanurag5@gmail.com';
```

5. Copy `.env.example` to `.env.local`.
6. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_ADMIN_EMAILS`.

Without Supabase config, the app uses fallback mock posts and keeps admin locked.

## Admin editor features

- Create blog posts and trade notes.
- Add symbol, setup, thesis, invalidation, and outcome for trade notes.
- Format content with headings, quotes, bold, italic, underline, lists, and links.
- Paste screenshots directly into the editor.
- Drag images into the editor.
- Upload images from your device into Supabase Storage.

## Deploy on Vercel

Recommended settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Add these environment variables in Vercel:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAILS=preetanurag5@gmail.com
```

`vercel.json` is included so React Router routes like `/blogs`, `/trades`, `/posts/:slug`, and `/preet-admin` work on refresh.

After deployment, add the production URL to Supabase:

- Supabase Auth > URL Configuration > Site URL
- Supabase Auth > URL Configuration > Redirect URLs
