import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Brain, CircleDollarSign, FileQuestion, LineChart, LoaderCircle, ShieldAlert, Target, Workflow } from 'lucide-react'
import AuthorBox from '../components/AuthorBox'
import RichContent from '../components/RichContent'
import { getPostBySlug } from '../lib/content'

export default function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    getPostBySlug(slug).then((nextPost) => {
      setPost(nextPost)
      setIsLoading(false)
    })
  }, [slug])

  if (isLoading) {
    return (
      <main className="section-shell page-shell">
        <div className="empty-state">
          <LoaderCircle className="spin-icon" size={34} />
          <h2>Loading post...</h2>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="section-shell page-shell">
        <Link className="back-link" to="/blogs"><ArrowLeft size={18} /> Back</Link>
        <div className="empty-state">
          <FileQuestion size={34} />
          <h2>Post not found.</h2>
          <p>This note may be unpublished, deleted, or still waiting in draft mode.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="section-shell article-shell">
      <div className="article-topbar">
        <Link className="back-link" to={post.type === 'trade_note' ? '/trades' : '/blogs'}><ArrowLeft size={18} /> Back</Link>
        <p className="eyebrow icon-eyebrow">
          {post.type === 'trade_note' ? <LineChart size={17} /> : <BookOpen size={17} />}
          {post.type === 'trade_note' ? 'Trade note' : 'Blog'}
        </p>
      </div>
      <h1>{post.title}</h1>
      {post.cover_url ? <img className="cover-image" src={post.cover_url} alt="" /> : null}
      {post.type === 'trade_note' ? (
        <section className="trade-summary">
          {post.symbol ? <p><CircleDollarSign size={18} /><strong>Symbol:</strong> {post.symbol}</p> : null}
          {post.setup ? <p><Workflow size={18} /><strong>Setup:</strong> {post.setup}</p> : null}
          {post.thesis ? <p><Target size={18} /><strong>Thesis:</strong> {post.thesis}</p> : null}
          {post.invalidation ? <p><ShieldAlert size={18} /><strong>Invalidation:</strong> {post.invalidation}</p> : null}
          {post.outcome ? <p><Brain size={18} /><strong>Outcome:</strong> {post.outcome}</p> : null}
        </section>
      ) : null}
      <RichContent content={post.content} />
      {post.type === 'blog' ? <AuthorBox /> : null}
    </main>
  )
}
