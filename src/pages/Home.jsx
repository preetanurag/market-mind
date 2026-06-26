import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <div>
          <p className="eyebrow">Dynamic portfolio experiment</p>
          <h1>I like making complex things feel understandable.</h1>
          <p className="hero-text">
            This version keeps the personal portfolio feel, but can fetch blogs and trades from an API-backed content source.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/blogs">Read blogs</Link>
            <Link className="button ghost" to="/trades">View trades</Link>
          </div>
        </div>
        <aside className="signal-card">
          <p className="eyebrow">Why dynamic?</p>
          <h2>Post once, render everywhere.</h2>
          <p>
            Blogs, trade notes, and images can live in Supabase, while this app stays fast and deployable.
          </p>
        </aside>
      </section>
    </main>
  )
}
