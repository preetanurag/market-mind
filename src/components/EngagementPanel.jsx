import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Eye, Heart, MessageCircle, Reply, Send, X } from 'lucide-react'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

function getVisitorId() {
  const key = 'market-mind-visitor-id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing

  const next = crypto.randomUUID()
  window.localStorage.setItem(key, next)
  return next
}

function buildCommentTree(comments) {
  const commentMap = new Map()
  const roots = []

  comments.forEach((comment) => {
    commentMap.set(comment.id, { ...comment, replies: [] })
  })

  commentMap.forEach((comment) => {
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      commentMap.get(comment.parent_id).replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  const byOldest = (a, b) => new Date(a.created_at) - new Date(b.created_at)
  roots.sort(byOldest)
  commentMap.forEach((comment) => comment.replies.sort(byOldest))
  return roots
}

export default function EngagementPanel({ post }) {
  const visitorId = useMemo(getVisitorId, [])
  const [counts, setCounts] = useState({ comments: 0, likes: 0, views: 0 })
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [message, setMessage] = useState('')
  const [isCommentsOpen, setIsCommentsOpen] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const commentTree = useMemo(() => buildCommentTree(comments), [comments])

  useEffect(() => {
    if (!hasSupabaseConfig || !post?.id) return

    loadEngagement().then(recordView)
  }, [post?.id])

  async function recordView() {
    const { data, error } = await supabase.rpc('increment_post_view', { target_post_id: post.id })
    if (!error && typeof data === 'number') {
      setCounts((current) => ({ ...current, views: data }))
    }
  }

  async function loadEngagement() {
    const [commentsResult, likesResult, metricsResult, likedResult] = await Promise.all([
      supabase
        .from('post_comments')
        .select('id, parent_id, author_name, body, created_at, edited_at', { count: 'exact' })
        .eq('post_id', post.id)
        .eq('approved', true)
        .order('created_at', { ascending: true }),
      supabase.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
      supabase.from('post_metrics').select('view_count').eq('post_id', post.id).maybeSingle(),
      supabase.from('post_likes').select('id').eq('post_id', post.id).eq('visitor_id', visitorId).maybeSingle(),
    ])

    setComments(commentsResult.data || [])
    setCounts({
      comments: commentsResult.count || 0,
      likes: likesResult.count || 0,
      views: metricsResult.data?.view_count || 0,
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

  async function insertComment({ parentId = null, commentBody }) {
    const { error } = await supabase.from('post_comments').insert({
      post_id: post.id,
      parent_id: parentId,
      author_name: name.trim(),
      body: commentBody.trim(),
    })

    if (error) throw error
  }

  async function handleComment(event) {
    event.preventDefault()
    setMessage('')

    if (!name.trim() || !body.trim()) {
      setMessage('Add your name and comment before posting.')
      return
    }

    setIsSubmitting(true)
    try {
      await insertComment({ commentBody: body })
      setBody('')
      setMessage('Comment posted.')
      await loadEngagement()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleReply(event, commentId) {
    event.preventDefault()
    setMessage('')

    if (!name.trim() || !replyBody.trim()) {
      setMessage('Add your name and reply before posting.')
      return
    }

    setIsReplying(true)
    try {
      await insertComment({ parentId: commentId, commentBody: replyBody })
      setReplyBody('')
      setReplyingTo(null)
      setMessage('Reply posted.')
      await loadEngagement()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsReplying(false)
    }
  }

  function renderComment(comment, isReply = false) {
    return (
      <article className={isReply ? 'comment-card reply-card' : 'comment-card'} key={comment.id}>
        <div className="comment-meta">
          <strong>{comment.author_name}</strong>
          <time>{new Date(comment.created_at).toLocaleDateString()}</time>
          {comment.edited_at ? <span>edited</span> : null}
        </div>
        <p>{comment.body}</p>
        <button className="comment-reply-button" type="button" onClick={() => setReplyingTo(comment.id)}>
          <Reply size={15} /> Reply
        </button>

        {replyingTo === comment.id ? (
          <form className="reply-form" onSubmit={(event) => handleReply(event, comment.id)}>
            <textarea value={replyBody} onChange={(event) => setReplyBody(event.target.value)} rows="3" placeholder={`Reply to ${comment.author_name}`} />
            <div className="reply-actions">
              <button className="button primary compact" type="submit" disabled={isReplying}>
                <Send size={15} /> {isReplying ? 'Posting...' : 'Post reply'}
              </button>
              <button className="button ghost compact" type="button" onClick={() => { setReplyingTo(null); setReplyBody('') }}>
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        ) : null}

        {comment.replies?.length ? (
          <div className="comment-replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        ) : null}
      </article>
    )
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

      <div className="collapsible-section">
        <button
          className="collapsible-trigger"
          type="button"
          aria-expanded={isCommentsOpen}
          onClick={() => setIsCommentsOpen((current) => !current)}
        >
          <span><MessageCircle size={18} /> Comments and discussion</span>
          <span>{counts.comments} total {isCommentsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
        </button>

        {isCommentsOpen ? (
          <div className="collapsible-content">
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

            {commentTree.length ? (
              <div className="comment-list">
                {commentTree.map((comment) => renderComment(comment))}
              </div>
            ) : (
              <p className="no-comments">No comments yet. First thoughtful note gets the quiet little dopamine badge.</p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
