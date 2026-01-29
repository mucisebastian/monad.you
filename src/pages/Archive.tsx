import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserBySlug, getArchiveLinks, type Link as LinkType, type User } from '../lib/supabase'
import { LinkCard } from '../components/LinkCard'
import type { PlatformTag } from '../lib/detectPlatform'

const PLATFORM_FILTERS: PlatformTag[] = ['YouTube', 'Tweet', 'Substack', 'Article', 'Book', 'Link']

export function Archive() {
  const { slug } = useParams<{ slug: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string | null>(null)

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

        const linksData = await getArchiveLinks(userData.id)
        setLinks(linksData)
      } catch (err) {
        setError('Failed to load archive')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [slug])

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      // Platform filter
      if (platformFilter && link.platform_tag !== platformFilter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const title = (link.title || '').toLowerCase()
        const url = link.url.toLowerCase()
        const tags = (link.custom_tags || []).join(' ').toLowerCase()

        if (!title.includes(query) && !url.includes(query) && !tags.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [links, platformFilter, searchQuery])

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
        <div className="mb-8 animate-fade-in">
          <Link
            to={`/${slug}`}
            className="text-zinc-500 hover:text-white text-sm font-mono mb-2 block"
          >
            ← back to inbox
          </Link>
          <h1 className="text-2xl font-mono font-bold">{user.name}'s archive</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-700 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-all duration-200 hover:border-zinc-600 focus:scale-[1.01]"
          />

          {/* Platform filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`px-2 py-1 rounded text-xs font-mono transition-all duration-200 hover:scale-105 active:scale-95 ${
                platformFilter === null
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            {PLATFORM_FILTERS.map(platform => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all duration-200 hover:scale-105 active:scale-95 ${
                  platformFilter === platform
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Links */}
        {links.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-lg animate-fade-in">
            <p className="text-zinc-500 font-mono">No archived links yet.</p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-16 border border-zinc-800 rounded-lg animate-fade-in">
            <p className="text-zinc-500 font-mono">No matches found.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setPlatformFilter(null)
              }}
              className="text-zinc-400 hover:text-white text-sm mt-2 underline transition-all duration-200 hover:scale-105"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLinks.map((link, index) => (
              <div key={link.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <LinkCard link={link} isArchive />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {links.length > 0 && (
          <p className="text-center text-zinc-600 text-sm mt-8">
            {filteredLinks.length} of {links.length} archived {links.length === 1 ? 'drop' : 'drops'}
          </p>
        )}
      </div>
    </div>
  )
}
