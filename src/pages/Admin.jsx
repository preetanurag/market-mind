import { hasSupabaseConfig } from '../lib/supabase'

export default function Admin() {
  return (
    <main className="section-shell page-shell">
      <p className="eyebrow">Admin</p>
      <h1>Publish trade blogs and trade notes.</h1>
      <div className="admin-panel">
        <h2>{hasSupabaseConfig ? 'Supabase connected' : 'Supabase not configured yet'}</h2>
        <p>
          This will become the private editor for creating posts with title, cover image, content, tags, and trade-specific fields like symbol,
          setup, thesis, invalidation, and outcome.
        </p>
        <p>Next step: add Supabase Auth, image upload, and create/edit forms.</p>
      </div>
    </main>
  )
}
