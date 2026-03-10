import React from 'react'
import { OUTCOME_OPTIONS } from '../data/recipe'

export default function OutcomeForm({ outcome, onSetOutcome }) {
  const currentOutcome = outcome || {}

  const handleChange = (field, value) => {
    onSetOutcome({ [field]: value })
  }

  return (
    <div className="border-t border-border pt-4 mt-4">
      <h3 className="font-medium mb-4">Record Outcome</h3>

      {/* Oven Spring */}
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Oven Spring
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.ovenSpring.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange('ovenSpring', option)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors
                ${currentOutcome.ovenSpring === option
                  ? 'bg-action-primary text-white'
                  : 'bg-border text-text-primary hover:bg-gray-300'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Crust Color */}
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Crust Color
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.crustColor.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange('crustColor', option)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors
                ${currentOutcome.crustColor === option
                  ? 'bg-action-primary text-white'
                  : 'bg-border text-text-primary hover:bg-gray-300'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Crumb Structure */}
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Crumb Structure
        </label>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.crumbStructure.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange('crumbStructure', option)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors
                ${currentOutcome.crumbStructure === option
                  ? 'bg-action-primary text-white'
                  : 'bg-border text-text-primary hover:bg-gray-300'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Overall Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleChange('overallRating', rating)}
              className={`w-11 h-11 rounded-lg text-lg transition-colors
                ${currentOutcome.overallRating === rating
                  ? 'bg-action-primary text-white'
                  : 'bg-border text-text-primary hover:bg-gray-300'
                }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Flavor Notes */}
      <div className="mb-4">
        <label className="block text-sm text-text-secondary mb-2">
          Flavor Notes
        </label>
        <textarea
          value={currentOutcome.flavorNotes || ''}
          onChange={(e) => handleChange('flavorNotes', e.target.value)}
          placeholder="How did it taste? Any observations..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg 
                     text-text-primary bg-card focus:outline-none 
                     focus:border-action-primary resize-none"
        />
      </div>
    </div>
  )
}
