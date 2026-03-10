import { useState, useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setLoading(false)
      } else {
        // No user signed in — sign in anonymously
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed:', err)
          setError(err)
          setLoading(false)
        })
      }
    })

    return unsubscribe
  }, [])

  return { user, uid: user?.uid ?? null, loading, error }
}
