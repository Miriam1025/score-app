import React from 'react'

export default function EmptyState({ onStartBake }) {
  return (
    <div className="stage-card text-center py-12">
      <div className="text-4xl mb-4">🍞</div>
      <h2 className="text-lg font-medium mb-2">No active bake session</h2>
      <p className="text-text-secondary mb-6">
        Start tracking your sourdough journey
      </p>
      <button
        type="button"
        onClick={onStartBake}
        className="btn-primary"
      >
        Start New Bake
      </button>
    </div>
  )
}
