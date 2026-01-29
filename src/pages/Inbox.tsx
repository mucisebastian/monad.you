import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserBySlug, getInboxLinks, type Link as LinkType, type User } from '../lib/supabase'
import { LinkCard } from '../components/LinkCard'

export function Inbox() {
  const { slug } = useParams<{ slug: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!slug) return

      try {
        const userData = await getUserBySlug(slug)
        if (!userData) {
          setError('User not found')
          return
        }
        setUser(userData)

        const linksData = await getInboxLinks(userData.id)
        setLinks(linksData)
      } catch (err) {
        setError('Failed to load inbox')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [slug])

  const handleMarkedAsWatched = (linkId: string) => {
    setLinks(prev => prev.filter(l => l.id !== linkId))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 font-mono">Loading...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono mb-4">{error || 'User not found'}</p>
          <Link to="/" className="text-zinc-400 hover:text-white underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <Link to="/" className="text-zinc-500 hover:text-white text-sm font-mono mb-2 block">
              ← back
            </Link>
            <h1 className="text-2xl font-mono font-bold">{user.name}'s inbox</h1>
          </div>
          <Link
            to={`/${slug}/archive`}
            className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono text-sm hover:border-zinc-500 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Archive
          </Link>
        </div>

        {/* Links */}
        {links.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-lg animate-fade-in">
            <p className="text-zinc-500 font-mono">No new links.</p>
            <p className="text-zinc-600 text-sm mt-2">Check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={link.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <LinkCard
                  link={link}
                  onMarkedAsWatched={() => handleMarkedAsWatched(link.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {links.length > 0 && (
          <p className="text-center text-zinc-600 text-sm mt-8">
            {links.length} unread {links.length === 1 ? 'drop' : 'drops'}
          </p>
        )}
      </div>
    </div>
  )
}
