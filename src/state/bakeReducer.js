import { RECIPE_DEFAULTS, STAGES } from '../data/recipe'

// Initial state for a new bake
export const createInitialBakeState = () => ({
  id: `bake_${Date.now()}`,
  status: 'active',
  currentStage: 1,
  startedAt: new Date().toISOString(),
  completedAt: null,
  stages: STAGES.reduce((acc, stage) => {
    acc[stage.id] = {
      id: stage.id,
      stageNumber: stage.number,
      status: stage.number === 1 ? 'active' : 'pending',
      startedAt: stage.number === 1 ? new Date().toISOString() : null,
      completedAt: null,
      measurements: {
        ...(RECIPE_DEFAULTS[stage.id] || {}),
        waterTemp: 'room',
      },
      timerEnabled: false,
      photos: {
        baseline: null,
        check: null,
      },
      volumeAssessment: null,
      notes: '',
    }
    return acc
  }, {}),
  outcome: null,
})

// Action types
export const ACTIONS = {
  UPDATE_MEASUREMENT: 'UPDATE_MEASUREMENT',
  SET_WATER_TEMP: 'SET_WATER_TEMP',
  TOGGLE_TIMER: 'TOGGLE_TIMER',
  ADD_PHOTO: 'ADD_PHOTO',
  SET_VOLUME_ASSESSMENT: 'SET_VOLUME_ASSESSMENT',
  COMPLETE_STAGE: 'COMPLETE_STAGE',
  SET_OUTCOME: 'SET_OUTCOME',
  UPDATE_NOTES: 'UPDATE_NOTES',
  START_NEW_BAKE: 'START_NEW_BAKE',
  HYDRATE_BAKE: 'HYDRATE_BAKE',
}

// Reducer function
export function bakeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_MEASUREMENT: {
      const { stageId, ingredient, value } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            measurements: {
              ...state.stages[stageId].measurements,
              [ingredient]: Math.max(0, value),
            },
          },
        },
      }
    }

    case ACTIONS.SET_WATER_TEMP: {
      const { stageId, temp } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            measurements: {
              ...state.stages[stageId].measurements,
              waterTemp: temp,
            },
          },
        },
      }
    }

    case ACTIONS.TOGGLE_TIMER: {
      const { stageId } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            timerEnabled: !state.stages[stageId].timerEnabled,
          },
        },
      }
    }

    case ACTIONS.ADD_PHOTO: {
      const { stageId, photoType, photoData } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            photos: {
              ...state.stages[stageId].photos,
              [photoType]: photoData,
            },
          },
        },
      }
    }

    case ACTIONS.SET_VOLUME_ASSESSMENT: {
      const { stageId, assessment } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            volumeAssessment: assessment,
          },
        },
      }
    }

    case ACTIONS.COMPLETE_STAGE: {
      const { stageId } = action.payload
      const stage = state.stages[stageId]
      const nextStageNumber = stage.stageNumber + 1
      const nextStageId = `stage${nextStageNumber}`
      const isLastStage = nextStageNumber > 5

      return {
        ...state,
        currentStage: isLastStage ? state.currentStage : nextStageNumber,
        completedAt: isLastStage ? new Date().toISOString() : null,
        status: isLastStage ? 'completed' : 'active',
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            status: 'completed',
            completedAt: new Date().toISOString(),
          },
          ...(nextStageId in state.stages
            ? {
                [nextStageId]: {
                  ...state.stages[nextStageId],
                  status: 'active',
                  startedAt: new Date().toISOString(),
                },
              }
            : {}),
        },
      }
    }

    case ACTIONS.SET_OUTCOME: {
      const { outcome } = action.payload
      return {
        ...state,
        outcome: {
          ...state.outcome,
          ...outcome,
        },
      }
    }

    case ACTIONS.UPDATE_NOTES: {
      const { stageId, notes } = action.payload
      return {
        ...state,
        stages: {
          ...state.stages,
          [stageId]: {
            ...state.stages[stageId],
            notes,
          },
        },
      }
    }

    case ACTIONS.START_NEW_BAKE: {
      return createInitialBakeState()
    }

    case ACTIONS.HYDRATE_BAKE: {
      return action.payload
    }

    default:
      return state
  }
}
