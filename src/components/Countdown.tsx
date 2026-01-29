import { useState, useEffect } from 'react'
import { getTimeUntil } from '../lib/timeAgo'

interface CountdownProps {
  targetDate: Date
  onComplete?: () => void
}

export function Countdown({ targetDate, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now >= targetDate) {
        setTimeLeft('now')
        onComplete?.()
        clearInterval(interval)
      } else {
        setTimeLeft(getTimeUntil(targetDate))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onComplete])

  return (
    <div className="text-center p-6 border border-zinc-800 rounded-lg bg-zinc-900/50">
      <p className="text-zinc-400 mb-2">You can submit again in</p>
      <p className="text-3xl font-mono text-white">{timeLeft}</p>
    </div>
  )
}
