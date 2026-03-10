import React from 'react'

export default function MeasurementInput({ 
  label, 
  value, 
  unit = 'g',
  onChange,
  increment = 5,
}) {
  // Use larger increment for bigger values
  const actualIncrement = value >= 100 ? 25 : increment

  const handleDecrease = () => {
    onChange(value - actualIncrement)
  }

  const handleIncrease = () => {
    onChange(value + actualIncrement)
  }

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-text-primary">
        {value}{unit} {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          className="btn-adjust"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          className="w-16 h-11 text-center border border-border rounded-lg 
                     text-text-primary bg-card focus:outline-none 
                     focus:border-action-primary"
          aria-label={`${label} amount in ${unit}`}
        />
        <button
          type="button"
          onClick={handleIncrease}
          className="btn-adjust"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
