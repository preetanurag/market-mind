import { fallbackBlogs, fallbackTrades } from '../data/fallback'
import { hasSupabaseConfig, supabase } from './supabase'

export async function getBlogs() {
  if (!hasSupabaseConfig) return fallbackBlogs

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.warn('Falling back to local blogs:', error.message)
    return fallbackBlogs
  }

  return data?.length ? data : fallbackBlogs
}

export async function getBlogBySlug(slug) {
  if (!hasSupabaseConfig) return fallbackBlogs.find((blog) => blog.slug === slug)

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.warn('Falling back to local blog:', error.message)
    return fallbackBlogs.find((blog) => blog.slug === slug)
  }

  return data
}

export async function getTrades() {
  if (!hasSupabaseConfig) return fallbackTrades

  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Falling back to local trades:', error.message)
    return fallbackTrades
  }

  return data?.length ? data : fallbackTrades
}
