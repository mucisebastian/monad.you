import { useState } from 'react'
import type { Link } from '../lib/supabase'
import { markAsWatched } from '../lib/supabase'
import { timeAgo, formatDate } from '../lib/timeAgo'
import { PLATFORM_COLORS, type PlatformTag } from '../lib/detectPlatform'

interface LinkCardProps {
  link: Link
  isArchive?: boolean
  onMarkedAsWatched?: () => void
}

export function LinkCard({ link, isArchive = false, onMarkedAsWatched }: LinkCardProps) {
  const [isMarking, setIsMarking] = useState(false)
  const [isMarked, setIsMarked] = useState(false)

  const handleMarkAsWatched = async () => {
    setIsMarking(true)
    try {
      await markAsWatched(link.id)
      setIsMarked(true)
      setTimeout(() => {
        onMarkedAsWatched?.()
      }, 300)
    } catch (error) {
      console.error('Failed to mark as watched:', error)
    } finally {
      setIsMarking(false)
    }
  }

  const senderName = (link.sender as unknown as { name: string })?.name || 'Unknown'
  const platformColor = PLATFORM_COLORS[link.platform_tag as PlatformTag] || PLATFORM_COLORS.Link

  return (
    <div
      className={`
        border border-zinc-800 rounded-lg p-4 bg-zinc-900/50
        transition-all duration-300 hover:border-zinc-700
        ${isMarked ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* Header: Platform tag + Time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${platformColor}`}>
          {link.platform_tag}
        </span>
        <span className="text-xs text-zinc-500 font-mono">
          {isArchive && link.watched_at
            ? `Watched ${formatDate(link.watched_at)}`
            : timeAgo(link.created_at)}
        </span>
      </div>

      {/* Thumbnail (clickable) */}
      {link.thumbnail && (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3 rounded overflow-hidden group"
        >
          <img
            src={link.thumbnail}
            alt={link.title || 'Link thumbnail'}
            className="w-full h-32 object-cover group-hover:opacity-90 transition-opacity"
          />
        </a>
      )}

      {/* Title & URL */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <h3 className="font-medium text-zinc-100 group-hover:text-white transition-colors mb-1">
          {link.title || link.url}
        </h3>
        {link.title && (
          <p className="text-xs text-zinc-500 font-mono truncate">
            {link.url}
          </p>
        )}
      </a>

      {/* Custom tags */}
      {link.custom_tags && link.custom_tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {link.custom_tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-xs font-mono bg-zinc-800 text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Note from sender */}
      {link.note && (
        <div className="mt-3 p-2 rounded bg-zinc-800/50 border-l-2 border-zinc-600">
          <p className="text-sm text-zinc-300 italic">"{link.note}"</p>
        </div>
      )}

      {/* Footer: Sender + Action */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">
          from <span className="text-zinc-400">{senderName}</span>
        </span>

        {!isArchive && (
          <button
            onClick={handleMarkAsWatched}
            disabled={isMarking || isMarked}
            className={`
              px-3 py-1.5 rounded text-xs font-mono transition-all duration-200
              ${isMarking || isMarked
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed scale-95'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:scale-105 active:scale-95'
              }
            `}
          >
            {isMarking ? 'Marking...' : isMarked ? '✓ Watched' : 'Mark as watched'}
          </button>
        )}
      </div>
    </div>
  )
}
