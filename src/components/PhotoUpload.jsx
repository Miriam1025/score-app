import React, { useRef, useState } from 'react'
import { uploadPhoto } from '../services/storage'

export default function PhotoUpload({
  label = 'Photo',
  photo,
  onUpload,
  uid,
  bakeId,
  stageId,
  photoType,
}) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !uid || !bakeId) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const photoData = await uploadPhoto(
        uid,
        bakeId,
        stageId,
        photoType,
        file,
        (pct) => setProgress(pct)
      )
      onUpload(photoData)
    } catch (err) {
      console.error('Photo upload failed:', err)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  if (photo) {
    return (
      <div className="py-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-secondary text-sm">{label}</span>
          <button
            type="button"
            onClick={() => onUpload(null)}
            className="text-sm text-action-primary hover:underline"
          >
            Replace
          </button>
        </div>
        <div className="relative">
          <img
            src={photo.downloadUrl || photo.localUrl}
            alt={label}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {new Date(photo.uploadedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-3 border-t border-border">
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
        <span>{label}</span>
      </div>

      {uploading ? (
        <div className="space-y-2">
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-action-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary text-center">
            Uploading... {progress}%
          </p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUploadClick}
            className="btn-secondary flex-1 text-sm"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={handleUploadClick}
            className="btn-secondary flex-1 text-sm"
          >
            Camera
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
