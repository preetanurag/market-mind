import { Link } from 'react-router-dom'
import { ArrowRight, Brain, NotebookPen, ShieldCheck, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main>
      <section className="hero section-shell">
        <div>
          <p className="eyebrow">Market & Mind</p>
          <h1>A place to write down the trade before the market rewrites the memory.</h1>
          <p className="hero-text">
            A focused home for market notes, trading psychology, watchlist ideas, business parallels, process experiments, and post-trade reflections.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/blogs">Read blogs <ArrowRight size={18} /></Link>
            <Link className="button ghost" to="/trades"><TrendingUp size={18} /> Trade notes</Link>
          </div>
        </div>
        <aside className="signal-card">
          <p className="eyebrow">Core idea</p>
          <h2>Process over impulse.</h2>
          <p>
            Capture thesis, setup, invalidation, emotion, and outcome. The goal is not to sound right later, but to think better next time.
          </p>
          <div className="signal-grid">
            <span><NotebookPen size={18} /> Thesis</span>
            <span><ShieldCheck size={18} /> Risk</span>
            <span><Brain size={18} /> Emotion</span>
          </div>
        </aside>
      </section>
    </main>
  )
}
