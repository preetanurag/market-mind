import { NotebookPen } from 'lucide-react'

export default function AuthorBox({ compact = false }) {
  if (compact) {
    return (
      <div className="author-mini">
        <span>PA</span>
        <p>By Preet Anurag</p>
      </div>
    )
  }

  return (
    <section className="author-box">
      <div className="author-avatar">PA</div>
      <div>
        <p className="eyebrow"><NotebookPen size={16} /> Author</p>
        <h2>Preet Anurag</h2>
        <p>
          I write about markets, trading psychology, journaling, and the process of making better decisions over time.
        </p>
      </div>
    </section>
  )
}
