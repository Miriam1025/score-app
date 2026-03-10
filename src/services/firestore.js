import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Bake Lifecycle ───

export async function createBake(uid, bakeState) {
  const bakeRef = doc(db, 'users', uid, 'bakes', bakeState.id)

  // Write the bake document
  await setDoc(bakeRef, {
    status: bakeState.status,
    currentStage: bakeState.currentStage,
    startedAt: bakeState.startedAt,
    completedAt: null,
    outcome: null,
    createdAt: serverTimestamp(),
  })

  // Write each stage as a subcollection document
  for (const [stageId, stageData] of Object.entries(bakeState.stages)) {
    const stageRef = doc(db, 'users', uid, 'bakes', bakeState.id, 'stages', stageId)
    await setDoc(stageRef, {
      stageNumber: stageData.stageNumber,
      status: stageData.status,
      startedAt: stageData.startedAt,
      completedAt: stageData.completedAt,
      measurements: stageData.measurements,
      timerEnabled: stageData.timerEnabled,
      photos: stageData.photos,
      volumeAssessment: stageData.volumeAssessment,
      notes: stageData.notes,
    })
  }

  return bakeState.id
}

export async function updateStageData(uid, bakeId, stageId, data) {
  const stageRef = doc(db, 'users', uid, 'bakes', bakeId, 'stages', stageId)
  await updateDoc(stageRef, data)
}

export async function completeStage(uid, bakeId, stageId, nextStageId, isLastStage) {
  // Mark current stage complete
  const stageRef = doc(db, 'users', uid, 'bakes', bakeId, 'stages', stageId)
  await updateDoc(stageRef, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  })

  // Activate next stage if not last
  if (!isLastStage && nextStageId) {
    const nextRef = doc(db, 'users', uid, 'bakes', bakeId, 'stages', nextStageId)
    await updateDoc(nextRef, {
      status: 'active',
      startedAt: new Date().toISOString(),
    })
  }

  // Update bake document
  const bakeRef = doc(db, 'users', uid, 'bakes', bakeId)
  if (isLastStage) {
    await updateDoc(bakeRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    })
  } else {
    const nextStageNumber = parseInt(nextStageId.replace('stage', ''), 10)
    await updateDoc(bakeRef, { currentStage: nextStageNumber })
  }
}

export async function completeBake(uid, bakeId, outcomeData) {
  const bakeRef = doc(db, 'users', uid, 'bakes', bakeId)
  await updateDoc(bakeRef, {
    outcome: outcomeData,
  })
}

// ─── Queries ───

export async function getActiveBake(uid) {
  const bakesRef = collection(db, 'users', uid, 'bakes')
  const q = query(bakesRef, where('status', '==', 'active'), limit(1))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  const bakeDoc = snapshot.docs[0]
  const bakeData = bakeDoc.data()

  // Fetch stages subcollection
  const stagesRef = collection(db, 'users', uid, 'bakes', bakeDoc.id, 'stages')
  const stagesSnapshot = await getDocs(stagesRef)

  const stages = {}
  stagesSnapshot.forEach((stageDoc) => {
    stages[stageDoc.id] = { id: stageDoc.id, ...stageDoc.data() }
  })

  return {
    id: bakeDoc.id,
    ...bakeData,
    stages,
  }
}

export function subscribeToActiveBake(uid, callback) {
  const bakesRef = collection(db, 'users', uid, 'bakes')
  const q = query(bakesRef, where('status', '==', 'active'), limit(1))

  return onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      callback(null)
      return
    }

    const bakeDoc = snapshot.docs[0]
    const bakeData = bakeDoc.data()

    // Fetch stages
    const stagesRef = collection(db, 'users', uid, 'bakes', bakeDoc.id, 'stages')
    const stagesSnapshot = await getDocs(stagesRef)

    const stages = {}
    stagesSnapshot.forEach((stageDoc) => {
      stages[stageDoc.id] = { id: stageDoc.id, ...stageDoc.data() }
    })

    callback({
      id: bakeDoc.id,
      ...bakeData,
      stages,
    })
  })
}
