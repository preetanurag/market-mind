import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, ExternalLink, FilePenLine, ImageUp, LogIn, LogOut, Save, Trash2, X } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import { hasSupabaseConfig, supabase } from '../lib/supabase'

const emptyForm = {
  type: 'blog',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_url: '',
  tags: '',
  symbol: '',
  setup: '',
  thesis: '',
  invalidation: '',
  outcome: '',
  published: true,
}

function getAllowedEmails() {
  return (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingPostId, setEditingPostId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isCoverUploading, setIsCoverUploading] = useState(false)
  const allowedEmails = useMemo(getAllowedEmails, [])
  const userEmail = session?.user?.email?.toLowerCase()
  const isAllowedAdmin = Boolean(userEmail && allowedEmails.includes(userEmail))

  useEffect(() => {
    if (!hasSupabaseConfig) return

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAllowedAdmin) return
    loadPosts()
  }, [isAllowedAdmin])

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('id, slug, type, title, published, published_at, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setPosts(data || [])
  }

  async function startEditing(postId) {
    setMessage('')

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      setMessage(error.message)
      return
    }

    setEditingPostId(data.id)
    setForm({
      type: data.type || 'blog',
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      cover_url: data.cover_url || '',
      tags: (data.tags || []).join(', '),
      symbol: data.symbol || '',
      setup: data.setup || '',
      thesis: data.thesis || '',
      invalidation: data.invalidation || '',
      outcome: data.outcome || '',
      published: Boolean(data.published),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetEditor() {
    setEditingPostId(null)
    setForm(emptyForm)
    setMessage('')
  }

  async function deletePost(post) {
    const confirmed = window.confirm(`Delete "${post.title}"? This cannot be undone.`)
    if (!confirmed) return

    setMessage('')
    const { error } = await supabase.from('posts').delete().eq('id', post.id)

    if (error) {
      setMessage(error.message)
      return
    }

    if (editingPostId === post.id) resetEditor()
    setMessage('Post deleted.')
    await loadPosts()
  }

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'title' && !current.slug) next.slug = createSlug(value)
      if (field === 'slug') next.slug = createSlug(value)
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    const slug = form.slug || createSlug(form.title)
    if (!form.content.trim()) {
      setIsSaving(false)
      setMessage('Add some content before saving the post.')
      return
    }

    const now = new Date().toISOString()
    const payload = {
      type: form.type,
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_url: form.cover_url.trim() || null,
      tags: splitTags(form.tags),
      symbol: form.type === 'trade_note' ? form.symbol.trim() || null : null,
      setup: form.type === 'trade_note' ? form.setup.trim() || null : null,
      thesis: form.type === 'trade_note' ? form.thesis.trim() || null : null,
      invalidation: form.type === 'trade_note' ? form.invalidation.trim() || null : null,
      outcome: form.type === 'trade_note' ? form.outcome.trim() || null : null,
      published: form.published,
      published_at: form.published ? now : null,
      updated_at: now,
    }

    const query = editingPostId
      ? supabase.from('posts').update(payload).eq('id', editingPostId)
      : supabase.from('posts').insert(payload)

    const { error } = await query
    setIsSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage(editingPostId ? 'Post updated.' : 'Post saved. It will appear publicly if published is enabled.')
    resetEditor()
    await loadPosts()
  }

  async function uploadPostImage(file, fileName) {
    const baseSlug = form.slug || createSlug(form.title) || 'draft'
    const path = `${session.user.id}/${baseSlug}/${Date.now()}-${fileName}`
    const { error } = await supabase.storage.from('post-images').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })

    if (error) {
      throw new Error(`${error.message}. Make sure the post-images Storage bucket exists in Supabase.`)
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file for the cover.')
      return
    }

    setIsCoverUploading(true)
    setMessage('Uploading cover image...')

    try {
      const url = await uploadPostImage(file, `cover-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`)
      updateField('cover_url', url)
      setMessage('Cover image uploaded.')
    } catch (error) {
      setMessage(error.message || 'Could not upload cover image.')
    } finally {
      setIsCoverUploading(false)
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="section-shell page-shell">
        <p className="eyebrow">Private admin</p>
        <h1>This area is separate from the public site.</h1>
        <div className="admin-panel">
          <h2>Setup required</h2>
          <p>Add Supabase environment variables and create your admin user before this editor can be used.</p>
          <p>The public navbar does not link here. The private admin URL is <code>/preet-admin</code>.</p>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="section-shell page-shell">
        <p className="eyebrow">Private admin</p>
        <h1>Login required.</h1>
        <form className="admin-panel admin-form" onSubmit={handleLogin}>
          <h2>Only approved admin users can continue</h2>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button className="button primary" type="submit"><LogIn size={18} /> Login</button>
        </form>
      </main>
    )
  }

  if (!isAllowedAdmin) {
    return (
      <main className="section-shell page-shell">
        <p className="eyebrow">Private admin</p>
        <h1>Not authorized.</h1>
        <div className="admin-panel">
          <h2>{session.user.email} is signed in, but is not an admin.</h2>
          <p>This account cannot create or edit posts. Database write policies should also block this user in Supabase.</p>
          <button className="button ghost" type="button" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </main>
    )
  }

  return (
    <main className="section-shell page-shell">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Private admin</p>
          <h1>Publish trade blogs and trade notes.</h1>
          <p>Signed in as {session.user.email}</p>
        </div>
        <button className="button ghost" type="button" onClick={handleLogout}><LogOut size={18} /> Logout</button>
      </div>

      <div className="admin-layout">
        <form className="admin-panel admin-form post-editor" onSubmit={handleSubmit}>
          <div className="editor-title-row">
            <h2>{editingPostId ? <><Edit3 size={22} /> Edit post</> : <><FilePenLine size={22} /> Create post</>}</h2>
            {editingPostId ? <button className="button ghost compact" type="button" onClick={resetEditor}><X size={16} /> Cancel edit</button> : null}
          </div>
          <label>
            Post type
            <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
              <option value="blog">Blog</option>
              <option value="trade_note">Trade note</option>
            </select>
          </label>
          <label>
            Title
            <input value={form.title} onChange={(event) => updateField('title', event.target.value)} required />
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} required />
          </label>
          <label>
            Short excerpt
            <textarea value={form.excerpt} onChange={(event) => updateField('excerpt', event.target.value)} rows="3" />
          </label>
          <div className="cover-upload-field">
            <label>
              Cover image URL
              <input value={form.cover_url} onChange={(event) => updateField('cover_url', event.target.value)} placeholder="https://..." />
            </label>
            <div className="cover-actions">
              <label className="upload-button">
                <ImageUp size={18} />
                {isCoverUploading ? 'Uploading...' : 'Upload cover'}
                <input accept="image/*" hidden onChange={handleCoverUpload} type="file" disabled={isCoverUploading} />
              </label>
              {form.cover_url ? <button className="button ghost compact" type="button" onClick={() => updateField('cover_url', '')}><X size={16} /> Remove</button> : null}
            </div>
            {form.cover_url ? <img className="cover-preview" src={form.cover_url} alt="Cover preview" /> : null}
          </div>
          <label>
            Tags, comma separated
            <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="Nifty, risk, psychology" />
          </label>
          {form.type === 'trade_note' ? (
            <div className="trade-fields">
              <label>
                Symbol
                <input value={form.symbol} onChange={(event) => updateField('symbol', event.target.value)} placeholder="NIFTY, RELIANCE, BTC" />
              </label>
              <label>
                Setup
                <input value={form.setup} onChange={(event) => updateField('setup', event.target.value)} />
              </label>
              <label>
                Thesis
                <textarea value={form.thesis} onChange={(event) => updateField('thesis', event.target.value)} rows="3" />
              </label>
              <label>
                Invalidation
                <textarea value={form.invalidation} onChange={(event) => updateField('invalidation', event.target.value)} rows="3" />
              </label>
              <label>
                Outcome
                <textarea value={form.outcome} onChange={(event) => updateField('outcome', event.target.value)} rows="3" />
              </label>
            </div>
          ) : null}
          <div className="editor-field">
            <div>
              <span>Content</span>
              <p>Format text, paste screenshots, drag images, or upload from your device.</p>
            </div>
            <RichTextEditor
              value={form.content}
              onChange={(content) => updateField('content', content)}
              onUploadImage={uploadPostImage}
              onStatus={setMessage}
            />
          </div>
          <label className="checkbox-label">
            <input checked={form.published} onChange={(event) => updateField('published', event.target.checked)} type="checkbox" />
            Publish immediately
          </label>
          {message ? <p className={message.includes('saved') || message.includes('updated') || message.includes('deleted') || message.includes('uploaded') || message.includes('inserted') || message.includes('Uploading') ? 'success-message' : 'form-message'}>{message}</p> : null}
          <button className="button primary" type="submit" disabled={isSaving}><Save size={18} /> {isSaving ? 'Saving...' : editingPostId ? 'Update post' : 'Save post'}</button>
        </form>

        <aside className="admin-panel post-list-panel">
          <h2>Recent posts</h2>
          {posts.length ? (
            <div className="admin-post-list">
              {posts.map((post) => (
                <article key={post.id}>
                  <span>{post.type === 'trade_note' ? 'Trade note' : 'Blog'} · {post.published ? 'Published' : 'Draft'}</span>
                  <h3>{post.title}</h3>
                  <div className="post-actions">
                    <button type="button" onClick={() => startEditing(post.id)}><Edit3 size={14} /> Edit</button>
                    <Link to={`/posts/${post.slug}`}><ExternalLink size={14} /> Open</Link>
                    <button className="danger-link" type="button" onClick={() => deletePost(post)}><Trash2 size={14} /> Delete</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No posts yet. The first one is always weirdly satisfying.</p>
          )}
        </aside>
      </div>
    </main>
  )
}
