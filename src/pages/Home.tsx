import { Link } from 'react-router-dom'
import { SubmitForm } from '../components/SubmitForm'

export function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <SubmitForm />

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <p className="text-center text-zinc-500 text-sm mb-4">View inboxes:</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/muci"
              className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-sm hover:border-zinc-500 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Muci's inbox
            </Link>
            <Link
              to="/aj"
              className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-sm hover:border-zinc-500 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              AJ's inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
