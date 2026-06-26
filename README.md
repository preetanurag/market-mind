# Trade Notes Dynamic Site

A focused dynamic site for trade-related blogs, trade notes, market reflections, and decision journaling.

## Local setup

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Run `src/lib/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Without Supabase config, the app uses fallback mock posts.

## Planned admin features

- Supabase Auth login.
- Create/edit blog posts.
- Create/edit trade notes with symbol, setup, thesis, invalidation, outcome.
- Upload cover images to Supabase Storage.
