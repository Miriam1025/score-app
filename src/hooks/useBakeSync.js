import { useReducer, useEffect, useState, useCallback, useRef } from 'react'
import { bakeReducer, ACTIONS } from '../state/bakeReducer'
import {
  createBake,
  updateStageData,
  completeStage,
  completeBake,
  getActiveBake,
} from '../services/firestore'

export default function useBakeSync(uid) {
  const [bake, rawDispatch] = useReducer(bakeReducer, null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const bakeRef = useRef(bake)
  bakeRef.current = bake

  // Hydrate from Firestore on mount
  useEffect(() => {
    if (!uid) return

    let cancelled = false

    async function hydrate() {
      try {
        const activeBake = await getActiveBake(uid)
        if (!cancelled && activeBake) {
          rawDispatch({ type: ACTIONS.HYDRATE_BAKE, payload: activeBake })
        }
      } catch (err) {
        console.error('Failed to load bake from Firestore:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    hydrate()
    return () => { cancelled = true }
  }, [uid])

  // Wrapped dispatch that syncs to Firestore
  const dispatch = useCallback(
    async (action) => {
      // Apply locally first for instant UI
      rawDispatch(action)
      if (!uid) return

      setSyncing(true)
      try {
        const currentBake = bakeRef.current

        switch (action.type) {
          case ACTIONS.START_NEW_BAKE: {
            // After rawDispatch, bakeRef won't be updated yet in the same tick.
            // We need the new state. Since reducer is pure, we can compute it:
            const newBake = bakeReducer(currentBake, action)
            await createBake(uid, newBake)
            break
          }

          case ACTIONS.UPDATE_MEASUREMENT: {
            const { stageId, ingredient, value } = action.payload
            if (currentBake?.id) {
              await updateStageData(uid, currentBake.id, stageId, {
                [`measurements.${ingredient}`]: Math.max(0, value),
              })
            }
            break
          }

          case ACTIONS.SET_WATER_TEMP: {
            const { stageId, temp } = action.payload
            if (currentBake?.id) {
              await updateStageData(uid, currentBake.id, stageId, {
                'measurements.waterTemp': temp,
              })
            }
            break
          }

          case ACTIONS.TOGGLE_TIMER: {
            const { stageId } = action.payload
            if (currentBake?.id) {
              const stage = currentBake.stages[stageId]
              await updateStageData(uid, currentBake.id, stageId, {
                timerEnabled: !stage.timerEnabled,
              })
            }
            break
          }

          case ACTIONS.ADD_PHOTO: {
            const { stageId, photoType, photoData } = action.payload
            if (currentBake?.id) {
              await updateStageData(uid, currentBake.id, stageId, {
                [`photos.${photoType}`]: photoData,
              })
            }
            break
          }

          case ACTIONS.SET_VOLUME_ASSESSMENT: {
            const { stageId, assessment } = action.payload
            if (currentBake?.id) {
              await updateStageData(uid, currentBake.id, stageId, {
                volumeAssessment: assessment,
              })
            }
            break
          }

          case ACTIONS.COMPLETE_STAGE: {
            const { stageId } = action.payload
            if (currentBake?.id) {
              const stage = currentBake.stages[stageId]
              const nextStageNumber = stage.stageNumber + 1
              const nextStageId = `stage${nextStageNumber}`
              const isLastStage = nextStageNumber > 5
              await completeStage(uid, currentBake.id, stageId, nextStageId, isLastStage)
            }
            break
          }

          case ACTIONS.SET_OUTCOME: {
            const { outcome } = action.payload
            if (currentBake?.id) {
              await completeBake(uid, currentBake.id, {
                ...currentBake.outcome,
                ...outcome,
              })
            }
            break
          }

          case ACTIONS.UPDATE_NOTES: {
            const { stageId, notes } = action.payload
            if (currentBake?.id) {
              await updateStageData(uid, currentBake.id, stageId, { notes })
            }
            break
          }
        }
      } catch (err) {
        console.error('Firestore sync error:', err)
      } finally {
        setSyncing(false)
      }
    },
    [uid]
  )

  return { bake, dispatch, loading, syncing }
}
