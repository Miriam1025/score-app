import React from 'react'

export default function CompletedBake({ bake, onStartNew }) {
  const outcome = bake.outcome || {}

  const getDuration = () => {
    if (!bake.startedAt || !bake.completedAt) return 'Unknown'
    
    const start = new Date(bake.startedAt)
    const end = new Date(bake.completedAt)
    const diff = end - start
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`
    }
    return `${hours}h`
  }

  return (
    <div className="stage-card">
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl font-bold mb-2">Bake Complete!</h2>
        <p className="text-text-secondary mb-4">
          Total time: <span className="time-display">{getDuration()}</span>
        </p>
      </div>

      {Object.keys(outcome).length > 0 && (
        <div className="border-t border-border pt-4">
          <h3 className="font-medium mb-3">Results</h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {outcome.ovenSpring && (
              <div>
                <span className="text-text-secondary">Oven Spring: </span>
                <span className="capitalize">{outcome.ovenSpring}</span>
              </div>
            )}
            {outcome.crustColor && (
              <div>
                <span className="text-text-secondary">Crust: </span>
                <span className="capitalize">{outcome.crustColor}</span>
              </div>
            )}
            {outcome.crumbStructure && (
              <div>
                <span className="text-text-secondary">Crumb: </span>
                <span className="capitalize">{outcome.crumbStructure}</span>
              </div>
            )}
            {outcome.overallRating && (
              <div>
                <span className="text-text-secondary">Rating: </span>
                <span>{outcome.overallRating}/5</span>
              </div>
            )}
          </div>

          {outcome.flavorNotes && (
            <div className="mt-3">
              <span className="text-text-secondary text-sm">Notes: </span>
              <p className="text-sm mt-1">{outcome.flavorNotes}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={onStartNew}
          className="btn-primary w-full"
        >
          Start New Bake
        </button>
      </div>
    </div>
  )
}
