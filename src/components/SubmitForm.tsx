import { useState, useEffect } from 'react'
import type { User } from '../lib/supabase'
import { getUsers, canUserSubmit, submitLink } from '../lib/supabase'
import { detectPlatform } from '../lib/detectPlatform'
import { fetchUrlMetadata } from '../lib/fetchMetadata'
import { Countdown } from './Countdown'

export function SubmitForm() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserSlug, setCurrentUserSlug] = useState<string>('')
  const [recipientSlug, setRecipientSlug] = useState<string>('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [platformTag, setPlatformTag] = useState<string>('Link')

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [canSubmit, setCanSubmit] = useState(true)
  const [nextSubmitTime, setNextSubmitTime] = useState<Date | null>(null)
  const [submissionsToday, setSubmissionsToday] = useState(0)

  // Load users
  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers()
        console.log('Loaded users:', data)
        setUsers(data)
        if (data.length > 0) {
          setCurrentUserSlug(data[0].slug)
          setRecipientSlug(data[1]?.slug || data[0].slug)
        }
      } catch (err) {
        console.error('Failed to load users:', err)
        setError('Failed to load users')
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [])

  // Check rate limit when current user changes
  useEffect(() => {
    async function checkRateLimit() {
      if (!currentUserSlug || users.length === 0) return

      const currentUser = users.find(u => u.slug === currentUserSlug)
      if (!currentUser) return

      const { canSubmit: allowed, nextSubmitTime: next, submissionsToday: count } = await canUserSubmit(currentUser.id)
      setCanSubmit(allowed)
      setNextSubmitTime(next)
      setSubmissionsToday(count)
    }
    checkRateLimit()
  }, [currentUserSlug, users, success])

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (url) {
      const detected = detectPlatform(url)
      setPlatformTag(detected)
    }
  }, [url])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    const recipient = users.find(u => u.slug === recipientSlug)
    const sender = users.find(u => u.slug === currentUserSlug)

    if (!recipient || !sender) {
      setError('Invalid users')
      return
    }

    if (sender.id === recipient.id) {
      setError('Cannot send to yourself')
      return
    }

    setIsSubmitting(true)

    try {
      // Fetch metadata for the URL
      const metadata = await fetchUrlMetadata(url.trim())

      await submitLink(
        sender.id,
        recipient.id,
        url.trim(),
        platformTag,
        [],
        note.trim() || null,
        metadata.title,
        metadata.thumbnail
      )

      setSuccess(true)
      setUrl('')
      setNote('')
      setPlatformTag('Link')
    } catch (err) {
      setError('Failed to submit link')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-500 font-mono">Loading...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-400 font-mono">No users found. Check Supabase connection.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-6xl text-white mb-4 transition-transform duration-300 hover:scale-110">☉</div>
        <p className="text-zinc-500">Share a link.</p>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 animate-slide-down">
          <p className="text-green-400 text-center font-mono">
            ✓ Link sent successfully!
          </p>
        </div>
      )}

      {!canSubmit && nextSubmitTime ? (
        <div className="space-y-4">
          <Countdown
            targetDate={nextSubmitTime}
            onComplete={() => {
              setCanSubmit(true)
              setNextSubmitTime(null)
            }}
          />
          <p className="text-center text-zinc-500 text-sm">
            You've used both submissions today (2/2)
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          {/* Who are you */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Who are you?
            </label>
            <select
              value={currentUserSlug}
              onChange={(e) => {
                setCurrentUserSlug(e.target.value)
                setSuccess(false)
              }}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono focus:outline-none focus:border-zinc-500 transition-all duration-200 hover:border-zinc-600"
            >
              {users.map(user => (
                <option key={user.id} value={user.slug}>
                  {user.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              <span className="text-zinc-400">{2 - submissionsToday}/2 left today</span>
            </p>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              To:
            </label>
            <select
              value={recipientSlug}
              onChange={(e) => {
                setRecipientSlug(e.target.value)
                setSuccess(false)
              }}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono focus:outline-none focus:border-zinc-500 transition-all duration-200 hover:border-zinc-600"
            >
              {users.map(user => (
                <option key={user.id} value={user.slug}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              URL:
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-all duration-200 hover:border-zinc-600 focus:scale-[1.01]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2">
              Note (optional):
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note..."
              rows={2}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 resize-none transition-all duration-200 hover:border-zinc-600 focus:scale-[1.01]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-mono">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-3 rounded font-mono font-medium transition-all duration-300
              ${isSubmitting
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed scale-95'
                : 'bg-white text-black hover:bg-zinc-200 hover:scale-105 active:scale-95'
              }
            `}
          >
            {isSubmitting ? 'Sending...' : 'Send it'}
          </button>
        </form>
      )}
    </div>
  )
}
