import React from 'react'

export default function Instruction({ action, text, time }) {
  return (
    <div className="py-1">
      <span className="action-word">{action}</span>{' '}
      <span>{text}</span>
      {time && (
        <>
          {' '}
          <span className="time-display">[{time}]</span>
        </>
      )}
    </div>
  )
}
