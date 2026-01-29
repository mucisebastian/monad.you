import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  slug: string
  name: string
  last_submitted_at: string | null
}

export interface Link {
  id: string
  sender_id: string
  recipient_id: string
  url: string
  title: string | null
  thumbnail: string | null
  platform_tag: string
  custom_tags: string[] | null
  note: string | null
  created_at: string
  watched: boolean
  watched_at: string | null
  sender?: User
  recipient?: User
}

// Fetch users
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) throw error
  return data
}

export async function getUserBySlug(slug: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}

// Check if user can submit (rate limiting - 2 submissions per day)
export async function canUserSubmit(userId: string): Promise<{ canSubmit: boolean; nextSubmitTime: Date | null; submissionsToday: number }> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Count submissions today
  const { data: links, error } = await supabase
    .from('links')
    .select('created_at')
    .eq('sender_id', userId)
    .gte('created_at', startOfDay.toISOString())

  if (error) {
    console.error('Error checking submissions:', error)
    return { canSubmit: true, nextSubmitTime: null, submissionsToday: 0 }
  }

  const submissionsToday = links?.length || 0

  if (submissionsToday >= 2) {
    // Calculate next available time (start of next day)
    const nextDay = new Date(startOfDay)
    nextDay.setDate(nextDay.getDate() + 1)
    return { canSubmit: false, nextSubmitTime: nextDay, submissionsToday }
  }

  return { canSubmit: true, nextSubmitTime: null, submissionsToday }
}

// Submit a link
export async function submitLink(
  senderId: string,
  recipientId: string,
  url: string,
  platformTag: string,
  customTags: string[],
  note: string | null,
  title: string | null = null,
  thumbnail: string | null = null
): Promise<Link> {
  // Insert the link
  const { data: link, error: linkError } = await supabase
    .from('links')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      url,
      title,
      thumbnail,
      platform_tag: platformTag,
      custom_tags: customTags,
      note: note || null
    })
    .select()
    .single()

  if (linkError) throw linkError

  return link
}

// Get inbox links (unread)
export async function getInboxLinks(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*, sender:sender_id(id, slug, name)')
    .eq('recipient_id', userId)
    .eq('watched', false)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get archive links (watched)
export async function getArchiveLinks(userId: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*, sender:sender_id(id, slug, name)')
    .eq('recipient_id', userId)
    .eq('watched', true)
    .order('watched_at', { ascending: false })

  if (error) throw error
  return data
}

// Mark link as watched
export async function markAsWatched(linkId: string): Promise<void> {
  const { error } = await supabase
    .from('links')
    .update({
      watched: true,
      watched_at: new Date().toISOString()
    })
    .eq('id', linkId)

  if (error) throw error
}
