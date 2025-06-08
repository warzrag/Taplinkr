'use client'

import { useState } from 'react'
import FileUpload from '@/components/upload/FileUpload'

export default function TestPage() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploadCount, setUploadCount] = useState(0)

  const handleUpload = (file: any) => {
    console.log('🎯 Test - File uploaded:', file)
    setImageUrl(file.url)
    setUploadCount(prev => prev + 1)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Upload</h1>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2">Upload Count: {uploadCount}</p>
          <p className="mb-2">Current Image URL: {imageUrl}</p>
        </div>

        <FileUpload 
          onFileUploaded={handleUpload}
          accept="image/*"
          maxSize={5 * 1024 * 1024}
        />

        {imageUrl && (
          <div className="mt-4">
            <p className="font-bold mb-2">Image Preview:</p>
            <img 
              src={imageUrl}
              alt="Test upload"
              className="w-48 h-48 object-cover border"
            />
          </div>
        )}
      </div>
    </div>
  )
}