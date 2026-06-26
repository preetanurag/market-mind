import { hasSupabaseConfig } from '../lib/supabase'

export default function Admin() {
  return (
    <main className="section-shell page-shell">
      <p className="eyebrow">Admin</p>
      <h1>Content control room.</h1>
      <div className="admin-panel">
        <h2>{hasSupabaseConfig ? 'Supabase connected' : 'Supabase not configured yet'}</h2>
        <p>
          Next step: add Supabase Auth, image upload, and create/edit forms for blog posts and trade notes.
        </p>
        <p>
          For now, the app uses fallback content when environment variables are missing.
        </p>
      </div>
    </main>
  )
}
