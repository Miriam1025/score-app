import React from 'react'

export default function WaterTempToggle({ value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-text-primary">Water temp:</span>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="waterTemp"
            value="room"
            checked={value === 'room'}
            onChange={() => onChange('room')}
            className="w-5 h-5 accent-action-primary"
          />
          <span className={value === 'room' ? 'font-medium' : 'text-text-secondary'}>
            Room temp
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="waterTemp"
            value="warmed"
            checked={value === 'warmed'}
            onChange={() => onChange('warmed')}
            className="w-5 h-5 accent-action-primary"
          />
          <span className={value === 'warmed' ? 'font-medium' : 'text-text-secondary'}>
            Warmed
          </span>
        </label>
      </div>
    </div>
  )
}
