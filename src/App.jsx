import React, { useState } from 'react'
import { STAGES } from './data/recipe'
import { ACTIONS } from './state/bakeReducer'
import Header from './components/Header'
import StageCard from './components/StageCard'
import EmptyState from './components/EmptyState'
import CompletedBake from './components/CompletedBake'
import useAuth from './hooks/useAuth'
import useBakeSync from './hooks/useBakeSync'

export default function App() {
  const { uid, loading: authLoading, error: authError } = useAuth()
  const { bake, dispatch, loading: bakeLoading } = useBakeSync(uid)
  const [expandedStage, setExpandedStage] = useState(null)

  // Start a new bake
  const handleStartBake = () => {
    dispatch({ type: ACTIONS.START_NEW_BAKE })
    setExpandedStage(1)
  }

  // Update a measurement
  const handleUpdateMeasurement = (stageId, ingredient, value) => {
    dispatch({
      type: ACTIONS.UPDATE_MEASUREMENT,
      payload: { stageId, ingredient, value },
    })
  }

  // Set water temperature
  const handleSetWaterTemp = (stageId, temp) => {
    dispatch({
      type: ACTIONS.SET_WATER_TEMP,
      payload: { stageId, temp },
    })
  }

  // Toggle timer
  const handleToggleTimer = (stageId) => {
    dispatch({
      type: ACTIONS.TOGGLE_TIMER,
      payload: { stageId },
    })
  }

  // Add photo
  const handleAddPhoto = (stageId, photoType, photoData) => {
    dispatch({
      type: ACTIONS.ADD_PHOTO,
      payload: { stageId, photoType, photoData },
    })
  }

  // Complete stage
  const handleCompleteStage = (stageId) => {
    dispatch({
      type: ACTIONS.COMPLETE_STAGE,
      payload: { stageId },
    })
    
    // Auto-expand next stage
    const stage = STAGES.find(s => s.id === stageId)
    if (stage && stage.number < 5) {
      setExpandedStage(stage.number + 1)
    }
  }

  // Set outcome
  const handleSetOutcome = (outcome) => {
    dispatch({
      type: ACTIONS.SET_OUTCOME,
      payload: { outcome },
    })
  }

  // Determine which stage to show expanded
  const activeStage = bake?.currentStage || 1
  const displayedExpandedStage = expandedStage ?? activeStage

  if (authLoading || bakeLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-red-600">Failed to connect. Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header bake={bake} />
      
      <main className="max-w-xl mx-auto px-4 py-6">
        {/* No active bake */}
        {!bake && (
          <EmptyState onStartBake={handleStartBake} />
        )}

        {/* Bake completed */}
        {bake && bake.status === 'completed' && (
          <CompletedBake bake={bake} onStartNew={handleStartBake} />
        )}

        {/* Active bake - show all stages */}
        {bake && bake.status === 'active' && (
          <div>
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {STAGES.map((stage) => {
                const stageData = bake.stages[stage.id]
                const isCompleted = stageData.status === 'completed'
                const isActive = stageData.status === 'active'
                
                return (
                  <div
                    key={stage.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCompleted 
                        ? 'bg-success text-white' 
                        : isActive 
                          ? 'bg-action-primary text-white'
                          : 'bg-border text-text-secondary'
                      }`}
                  >
                    {isCompleted ? '✓' : stage.number}
                  </div>
                )
              })}
            </div>

            {/* Stage cards */}
            {STAGES.map((stage) => {
              const stageData = bake.stages[stage.id]
              const isExpanded = displayedExpandedStage === stage.number
              const isCompleted = stageData.status === 'completed'
              const isActive = stageData.status === 'active'

              return (
                <StageCard
                  key={stage.id}
                  stageData={stage}
                  bakeStageData={stageData}
                  isActive={isExpanded}
                  isCompleted={isCompleted}
                  onExpand={() => setExpandedStage(stage.number)}
                  onUpdateMeasurement={(ingredient, value) =>
                    handleUpdateMeasurement(stage.id, ingredient, value)
                  }
                  onSetWaterTemp={(temp) => handleSetWaterTemp(stage.id, temp)}
                  onToggleTimer={() => handleToggleTimer(stage.id)}
                  onAddPhoto={(type, photo) => handleAddPhoto(stage.id, type, photo)}
                  onComplete={() => handleCompleteStage(stage.id)}
                  onSetOutcome={handleSetOutcome}
                  outcome={bake.outcome}
                  uid={uid}
                  bakeId={bake.id}
                />
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
