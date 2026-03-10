import React from 'react'
import { STAGES } from '../data/recipe'
import MeasurementInput from './MeasurementInput'
import WaterTempToggle from './WaterTempToggle'
import Toggle from './Toggle'
import PhotoUpload from './PhotoUpload'
import Instruction from './Instruction'
import OutcomeForm from './OutcomeForm'

export default function StageCard({
  stageData,
  bakeStageData,
  isActive,
  isCompleted,
  onExpand,
  onUpdateMeasurement,
  onSetWaterTemp,
  onToggleTimer,
  onAddPhoto,
  onComplete,
  onSetOutcome,
  outcome,
  uid,
  bakeId,
}) {
  const stage = stageData
  const measurements = bakeStageData.measurements

  // Collapsed view
  if (!isActive) {
    return (
      <button
        type="button"
        onClick={onExpand}
        className="stage-card-collapsed w-full text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {isCompleted && <span className="text-success">✓</span>}
          <span className={isCompleted ? 'text-text-secondary' : ''}>
            Stage {stage.number}: {stage.name}
          </span>
        </div>
        <span className="time-display">[{stage.duration}]</span>
      </button>
    )
  }

  // Expanded view
  return (
    <div className="stage-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">
          Stage {stage.number}: {stage.name}
        </h2>
        <span className="time-display">[{stage.duration}]</span>
      </div>

      {/* Instructions and Measurements */}
      {stage.sections ? (
        // Stage 4 has sections (Preheat, Covered, Uncovered)
        stage.sections.map((section, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="font-medium text-text-secondary mb-2">{section.name}</h3>
            {section.instructions.map((inst, i) => (
              <Instruction key={i} {...inst} />
            ))}
          </div>
        ))
      ) : (
        <>
          {/* Regular instructions */}
          {stage.instructions && (
            <div className="mb-4">
              {stage.instructions.map((inst, i) => (
                <Instruction key={i} {...inst} />
              ))}
            </div>
          )}

          {/* Measurements */}
          {stage.measurements.length > 0 && (
            <div className="border-t border-border pt-3 mb-3">
              {stage.measurements.map((ingredient) => (
                <MeasurementInput
                  key={ingredient}
                  label={ingredient}
                  value={measurements[ingredient] || 0}
                  onChange={(value) => onUpdateMeasurement(ingredient, value)}
                />
              ))}
            </div>
          )}

          {/* Water temperature toggle */}
          {stage.hasWaterTemp && (
            <div className="border-t border-border pt-2">
              <WaterTempToggle
                value={measurements.waterTemp}
                onChange={onSetWaterTemp}
              />
            </div>
          )}

          {/* Stretch & Fold info for Stage 2 */}
          {stage.stretchFold && (
            <div className="border-t border-border pt-3 mt-3">
              <h3 className="font-medium mb-2">Stretch & Fold</h3>
              <p className="text-text-secondary text-sm">
                <span className="action-word">COMPLETE</span> stretch & fold set.{' '}
                <span className="action-word">REPEAT</span> every{' '}
                <span className="time-display">{stage.stretchFold.interval} min</span>.
              </p>
              <p className="text-text-secondary text-sm mt-1">
                Duration: <span className="time-display">[{stage.stretchFold.duration}]</span>
              </p>
            </div>
          )}

          {/* Bulk Fermentation info for Stage 2 */}
          {stage.bulkFermentation && (
            <div className="border-t border-border pt-3 mt-3">
              <h3 className="font-medium mb-2">Bulk Fermentation</h3>
              <p className="text-text-secondary text-sm">
                <span className="action-word">LEAVE</span> covered on counter until almost doubled.
              </p>
              <p className="text-text-secondary text-sm mt-1">
                Duration: <span className="time-display">[{stage.bulkFermentation.duration}]</span>
              </p>
            </div>
          )}

          {/* Final steps for Stage 2 */}
          {stage.finalSteps && (
            <div className="border-t border-border pt-3 mt-3">
              <h3 className="font-medium mb-2">Then:</h3>
              {stage.finalSteps.map((inst, i) => (
                <Instruction key={i} {...inst} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Target */}
      {stage.target && (
        <div className="bg-background rounded-lg p-3 mt-3">
          <span className="text-text-secondary text-sm">Target: </span>
          <span className="text-sm">{stage.target}</span>
        </div>
      )}

      {/* Photo Upload */}
      <PhotoUpload
        label="Baseline Photo"
        photo={bakeStageData.photos.baseline}
        onUpload={(photo) => onAddPhoto('baseline', photo)}
        uid={uid}
        bakeId={bakeId}
        stageId={stage.id}
        photoType="baseline"
      />

      {/* Timer Toggle */}
      {stage.timerLabel && (
        <div className="border-t border-border pt-2">
          <Toggle
            label={`Timer: ${stage.timerLabel}`}
            checked={bakeStageData.timerEnabled}
            onChange={onToggleTimer}
          />
        </div>
      )}

      {/* Outcome Form (Stage 5 only) */}
      {stage.hasOutcome && (
        <OutcomeForm outcome={outcome} onSetOutcome={onSetOutcome} />
      )}

      {/* Complete Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onComplete}
          className="btn-primary w-full"
        >
          Mark Stage Complete →
        </button>
      </div>
    </div>
  )
}
