import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs } from '../lib/content'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    getBlogs().then(setBlogs)
  }, [])

  return (
    <main className="section-shell page-shell">
      <p className="eyebrow">Blogs</p>
      <h1>Things I’m thinking through in public.</h1>
      <div className="card-grid">
        {blogs.map((blog) => (
          <article className="content-card" key={blog.id}>
            {blog.cover_url ? <img src={blog.cover_url} alt="" /> : null}
            <span>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Draft'}</span>
            <h2>{blog.title}</h2>
            <p>{blog.excerpt}</p>
            <Link to={`/blogs/${blog.slug}`}>Read post</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
