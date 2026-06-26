import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../lib/content'

export default function PostDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)

  useEffect(() => {
    getPostBySlug(slug).then(setPost)
  }, [slug])

  if (!post) return <main className="section-shell page-shell"><p>Loading...</p></main>

  return (
    <main className="section-shell article-shell">
      <Link to="/posts">Back to posts</Link>
      <p className="eyebrow">{post.type === 'trade_note' ? 'Trade note' : 'Blog'}</p>
      <h1>{post.title}</h1>
      {post.cover_url ? <img className="cover-image" src={post.cover_url} alt="" /> : null}
      {post.type === 'trade_note' ? (
        <section className="trade-summary">
          {post.symbol ? <p><strong>Symbol:</strong> {post.symbol}</p> : null}
          {post.setup ? <p><strong>Setup:</strong> {post.setup}</p> : null}
          {post.thesis ? <p><strong>Thesis:</strong> {post.thesis}</p> : null}
          {post.invalidation ? <p><strong>Invalidation:</strong> {post.invalidation}</p> : null}
          {post.outcome ? <p><strong>Outcome:</strong> {post.outcome}</p> : null}
        </section>
      ) : null}
      <article>{post.content}</article>
    </main>
  )
}
