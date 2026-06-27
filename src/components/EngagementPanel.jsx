import { useEffect, useMemo, useState } from 'react'
import { Eye, Heart, MessageCircle, Send } from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

function getVisitorId() {
  const key = 'market-mind-visitor-id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing

  const next = crypto.randomUUID()
  window.localStorage.setItem(key, next)
  return next
}

export default function EngagementPanel({ post }) {
  const visitorId = useMemo(getVisitorId, [])
  const [counts, setCounts] = useState({ comments: 0, likes: 0, views: 0 })
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!hasSupabaseConfig || !post?.id) return

    recordView()
    loadEngagement()
  }, [post?.id])

  async function recordView() {
    await supabase
      .from('post_views')
      .upsert({ post_id: post.id, visitor_id: visitorId }, { onConflict: 'post_id,visitor_id' })
  }

  async function loadEngagement() {
    const [commentsResult, likesResult, viewsResult, likedResult] = await Promise.all([
      supabase
        .from('post_comments')
        .select('id, author_name, body, created_at', { count: 'exact' })
        .eq('post_id', post.id)
        .eq('approved', true)
        .order('created_at', { ascending: false }),
      supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
      supabase.from('post_views').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
      supabase.from('post_likes').select('id').eq('post_id', post.id).eq('visitor_id', visitorId).maybeSingle(),
    ])

    setComments(commentsResult.data || [])
    setCounts({
      comments: commentsResult.count || 0,
      likes: likesResult.count || 0,
      views: viewsResult.count || 0,
    })
    setLiked(Boolean(likedResult.data))
  }

  async function handleLike() {
    if (!hasSupabaseConfig || liked) return

    const { error } = await supabase.from('post_likes').insert({ post_id: post.id, visitor_id: visitorId })
    if (error) {
      setMessage(error.message)
      return
    }

    setLiked(true)
    setCounts((current) => ({ ...current, likes: current.likes + 1 }))
  }

  async function handleComment(event) {
    event.preventDefault()
    setMessage('')

    if (!name.trim() || !body.trim()) {
      setMessage('Add your name and comment before posting.')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.from('post_comments').insert({
      post_id: post.id,
      author_name: name.trim(),
      body: body.trim(),
    })
    setIsSubmitting(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setBody('')
    setMessage('Comment posted.')
    await loadEngagement()
  }

  if (!hasSupabaseConfig || !post?.id) return null

  return (
    <section className="engagement-panel">
      <div className="engagement-stats" aria-label="Post engagement">
        <span><Eye size={18} /> {counts.views} views</span>
        <button className={liked ? 'liked' : ''} type="button" onClick={handleLike} disabled={liked}>
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {counts.likes} likes
        </button>
        <span><MessageCircle size={18} /> {counts.comments} comments</span>
      </div>

      <form className="comment-form" onSubmit={handleComment}>
        <h2>Join the note</h2>
        <label>
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>
        <label>
          Comment
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows="4" placeholder="Share a thought, question, or reflection." />
        </label>
        {message ? <p className={message.includes('posted') ? 'success-message' : 'form-message'}>{message}</p> : null}
        <button className="button primary" type="submit" disabled={isSubmitting}>
          <Send size={17} /> {isSubmitting ? 'Posting...' : 'Post comment'}
        </button>
      </form>

      {comments.length ? (
        <div className="comment-list">
          {comments.map((comment) => (
            <article key={comment.id}>
              <strong>{comment.author_name}</strong>
              <time>{new Date(comment.created_at).toLocaleDateString()}</time>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="no-comments">No comments yet. First thoughtful note gets the quiet little dopamine badge.</p>
      )}
    </section>
  )
}
