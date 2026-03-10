import React from 'react'

export default function Header({ bake }) {
  const getElapsedTime = () => {
    if (!bake?.startedAt) return null
    
    const start = new Date(bake.startedAt)
    const now = new Date()
    const diff = now - start
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours === 0) {
      return `${minutes}m`
    }
    return `${hours}h ${minutes}m`
  }

  const formatStartTime = () => {
    if (!bake?.startedAt) return null
    return new Date(bake.startedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍞</span>
            <h1 className="font-bold text-lg">Sourdough Tracker</h1>
          </div>
          <a
            href="https://forms.gle/YOUR_FORM_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary p-2 text-sm"
          >
            Feedback
          </a>
        </div>
        
        {bake && bake.status === 'active' && (
          <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border">
            <span className="text-text-secondary">
              Started: {formatStartTime()}
            </span>
            <span className="time-display">
              Elapsed: {getElapsedTime()}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
