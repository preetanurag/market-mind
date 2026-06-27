import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, CalendarDays, FileSearch, LineChart, Tag } from 'lucide-react'
import AuthorBox from '../components/AuthorBox'
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
      {posts.length ? (
        <div className="card-grid">
          {posts.map((post) => (
            <article className="content-card" key={post.id}>
              {post.cover_url ? <img src={post.cover_url} alt="" /> : null}
              <div className="card-meta">
                <span className="type-badge">
                  {post.type === 'trade_note' ? <LineChart size={15} /> : <BookOpen size={15} />}
                  {post.type === 'trade_note' ? 'Trade note' : 'Blog'}
                </span>
                <span><CalendarDays size={15} /> {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</span>
              </div>
              <h2>{post.title}</h2>
              {post.type === 'blog' ? <AuthorBox compact /> : null}
              <p>{post.excerpt}</p>
              <div className="tag-row">
                {(post.tags || []).map((tag) => <b key={tag}><Tag size={13} /> {tag}</b>)}
              </div>
              <Link className="read-link" to={`/posts/${post.slug}`}>Read <ArrowUpRight size={17} /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileSearch size={34} />
          <h2>No posts here yet.</h2>
          <p>Once you publish from the private admin, the entries will show up here with their own symbols, dates, and tags.</p>
        </div>
      )}
    </main>
  )
}
