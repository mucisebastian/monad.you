// Metadata fetching utility

export interface UrlMetadata {
  title: string | null
  thumbnail: string | null
}

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v')
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1)
    }
  } catch {
    // ignore
  }
  return null
}

// Get YouTube thumbnail
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

// Fetch YouTube title using oEmbed API (no API key needed)
async function fetchYouTubeTitle(videoId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    if (response.ok) {
      const data = await response.json()
      return data.title || null
    }
  } catch (error) {
    console.error('Failed to fetch YouTube title:', error)
  }
  return null
}

// Fetch metadata using jsonlink.io API (free, no key required)
async function fetchGenericMetadata(url: string): Promise<UrlMetadata> {
  try {
    // Using jsonlink.io - a free Open Graph scraper
    const apiUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)

    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title || data.og?.title || null,
        thumbnail: data.images?.[0] || data.og?.image || null
      }
    }
  } catch (error) {
    console.error('Failed to fetch metadata:', error)
  }

  // Fallback: try microlink.io (also free)
  try {
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)

    if (response.ok) {
      const result = await response.json()
      if (result.status === 'success' && result.data) {
        return {
          title: result.data.title || null,
          thumbnail: result.data.image?.url || result.data.logo?.url || null
        }
      }
    }
  } catch (error) {
    console.error('Microlink fallback failed:', error)
  }

  return {
    title: null,
    thumbnail: null
  }
}

// Fetch metadata for a URL
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  // YouTube - use oEmbed API (faster and more reliable)
  const videoId = getYouTubeVideoId(url)
  if (videoId) {
    const title = await fetchYouTubeTitle(videoId)
    return {
      title,
      thumbnail: getYouTubeThumbnail(videoId)
    }
  }

  // For all other URLs, use generic Open Graph scraping
  return await fetchGenericMetadata(url)
}

// Example Supabase Edge Function (save as supabase/functions/fetch-metadata/index.ts):
/*
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { url } = await req.json()

  try {
    const response = await fetch(url)
    const html = await response.text()

    // Extract OG tags
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/)
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)

    return new Response(JSON.stringify({
      title: titleMatch?.[1] || null,
      thumbnail: imageMatch?.[1] || null
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({ title: null, thumbnail: null }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
*/
