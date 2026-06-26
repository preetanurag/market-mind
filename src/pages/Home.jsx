import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <div>
          <p className="eyebrow">Trade journal / Market blog</p>
          <h1>A place to write down the trade before the market rewrites the memory.</h1>
          <p className="hero-text">
            This is a focused home for my market notes, trade-related blogs, watchlist ideas, process experiments, and post-trade reflections.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/posts">Read all posts</Link>
            <Link className="button ghost" to="/trades">Trade notes</Link>
          </div>
        </div>
        <aside className="signal-card">
          <p className="eyebrow">Core idea</p>
          <h2>Process over impulse.</h2>
          <p>
            Capture thesis, setup, invalidation, emotion, and outcome. The goal is not to sound right later, but to think better next time.
          </p>
        </aside>
      </section>
    </main>
  )
}
