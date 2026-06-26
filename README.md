# Portfolio Dynamic

Dynamic portfolio prototype for blogs, trades, and admin-managed content.

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

Without Supabase config, the app uses fallback mock content.

## Next admin work

- Add Supabase Auth login.
- Add blog create/edit form.
- Add image upload to Supabase Storage.
- Add trade note create/edit form.
