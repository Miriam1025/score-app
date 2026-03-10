import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { storage, db } from '../firebase'

export async function uploadPhoto(uid, bakeId, stageId, photoType, file, onProgress) {
  const photoId = `photo_${Date.now()}`
  const storagePath = `users/${uid}/bakes/${bakeId}/photos/${photoId}.jpg`
  const storageRef = ref(storage, storagePath)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        if (onProgress) onProgress(progress)
      },
      (error) => {
        console.error('Upload failed:', error)
        reject(error)
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)

          // Create Firestore photo document (matches functions/main.py expectations)
          const photoRef = doc(
            db,
            'users',
            uid,
            'bakes',
            bakeId,
            'photos',
            photoId
          )
          await setDoc(photoRef, {
            stageId,
            photoType,
            downloadUrl,
            filename: file.name,
            uploadedAt: new Date().toISOString(),
            createdAt: serverTimestamp(),
          })

          resolve({
            id: photoId,
            downloadUrl,
            filename: file.name,
            uploadedAt: new Date().toISOString(),
          })
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}
