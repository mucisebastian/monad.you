export type PlatformTag = 'YouTube' | 'Tweet' | 'Substack' | 'Article' | 'Book' | 'Link'

export function detectPlatform(url: string): PlatformTag {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const pathname = urlObj.pathname.toLowerCase()

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube'
    }

    // Twitter/X
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'Tweet'
    }

    // Substack
    if (hostname.includes('substack.com')) {
      return 'Substack'
    }

    // Medium
    if (hostname.includes('medium.com')) {
      return 'Article'
    }

    // Books (Amazon or Goodreads)
    if (hostname.includes('amazon.com') && (pathname.includes('/dp/') || pathname.includes('/book'))) {
      return 'Book'
    }
    if (hostname.includes('goodreads.com')) {
      return 'Book'
    }

    // Default
    return 'Link'
  } catch {
    return 'Link'
  }
}

export function extractDomainTag(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove www. and get just the domain name
    return urlObj.hostname.replace(/^www\./, '').split('.')[0]
  } catch {
    return ''
  }
}

export const PLATFORM_COLORS: Record<PlatformTag, string> = {
  YouTube: 'bg-red-500/20 text-red-400',
  Tweet: 'bg-blue-500/20 text-blue-400',
  Substack: 'bg-orange-500/20 text-orange-400',
  Article: 'bg-green-500/20 text-green-400',
  Book: 'bg-purple-500/20 text-purple-400',
  Link: 'bg-zinc-500/20 text-zinc-400'
}
