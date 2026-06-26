import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts } from '../lib/content'

export default function Posts({ type = 'all', eyebrow = 'Posts', title = 'Market notes and trade writing.' }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getPosts(type).then(setPosts)
  }, [type])

  return (
    <main className="section-shell page-shell">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="card-grid">
        {posts.map((post) => (
          <article className="content-card" key={post.id}>
            {post.cover_url ? <img src={post.cover_url} alt="" /> : null}
            <span>{post.type === 'trade_note' ? 'Trade note' : 'Blog'} · {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <div className="tag-row">
              {(post.tags || []).map((tag) => <b key={tag}>{tag}</b>)}
            </div>
            <Link to={`/posts/${post.slug}`}>Read</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
