import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBlogBySlug } from '../lib/content'

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)

  useEffect(() => {
    getBlogBySlug(slug).then(setBlog)
  }, [slug])

  if (!blog) {
    return <main className="section-shell page-shell"><p>Loading...</p></main>
  }

  return (
    <main className="section-shell article-shell">
      <Link to="/blogs">Back to blogs</Link>
      <p className="eyebrow">Blog</p>
      <h1>{blog.title}</h1>
      {blog.cover_url ? <img className="cover-image" src={blog.cover_url} alt="" /> : null}
      <article>{blog.content}</article>
    </main>
  )
}
