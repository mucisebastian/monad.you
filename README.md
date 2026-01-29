# ☉ monad.you

A minimal link-sharing app for two friends. Send links, watch later, archive forever.

## What is this?

monad.you is a personal link inbox for friends to share interesting content with each other. No social feed, no algorithms—just a simple way to drop links and come back to them later.

## Features

- **Simple sharing** - Paste a URL, add an optional note, send it
- **Auto previews** - Automatically fetches titles and thumbnails for any link
- **Rate limiting** - 2 submissions per person per day (resets at midnight)
- **Inbox & Archive** - Mark links as watched to move them to your archive
- **Search & filter** - Find old links by title or platform type
- **Platform detection** - Automatically tags YouTube, Twitter, Substack, articles, books, and more
- **Dark mode** - Clean, minimal aesthetic with smooth animations

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **Deployment**: Vercel
- **Metadata**: jsonlink.io & microlink.io APIs

## Local Development

### Prerequisites
- Node.js 18+
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/mucisebastian/monad.you.git
cd monad.you
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL in `supabase/schema.sql` in the SQL Editor
   - Copy your project URL and anon key

4. Create `.env` file:
```bash
cp .env.example .env
```

Then add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the dev server:
```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment

The app is configured for Vercel deployment:

1. Push to GitHub
2. Import the repo in Vercel
3. Add environment variables in Vercel settings
4. Deploy

## Routes

- `/` - Submit a link
- `/muci` - Muci's inbox
- `/aj` - AJ's inbox
- `/muci/archive` - Muci's archive
- `/aj/archive` - AJ's archive

## Database Schema

Two simple tables:

**users** - Stores Friend 1 and Friend 2 
- `id` (uuid)
- `slug` (text) - "Friend 1" or "Friend 2"
- `name` (text)

**links** - Stores all shared links
- `id` (uuid)
- `sender_id` (uuid) - Who sent it
- `recipient_id` (uuid) - Who received it
- `url` (text)
- `title` (text) - Auto-fetched
- `thumbnail` (text) - Auto-fetched image URL
- `platform_tag` (text) - YouTube, Tweet, Article, etc.
- `note` (text) - Optional message
- `watched` (boolean)
- `watched_at` (timestamp)
- `created_at` (timestamp)

## License

Personal project. Not open for contributions.

---

Built with ☉ by Muci
