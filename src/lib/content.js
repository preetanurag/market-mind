import { fallbackPosts } from '../data/fallback'
import { hasSupabaseConfig, supabase } from './supabase'

export async function getPosts(type = 'all') {
  if (!hasSupabaseConfig) {
    return type === 'all' ? fallbackPosts : fallbackPosts.filter((post) => post.type === type)
  }

  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (type !== 'all') query = query.eq('type', type)

  const { data, error } = await query

  if (error) {
    console.warn('Falling back to local posts:', error.message)
    return type === 'all' ? fallbackPosts : fallbackPosts.filter((post) => post.type === type)
  }

  return data?.length ? data : type === 'all' ? fallbackPosts : fallbackPosts.filter((post) => post.type === type)
}

export async function getPostBySlug(slug) {
  if (!hasSupabaseConfig) return fallbackPosts.find((post) => post.slug === slug)

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.warn('Falling back to local post:', error.message)
    return fallbackPosts.find((post) => post.slug === slug)
  }

  return data
}
