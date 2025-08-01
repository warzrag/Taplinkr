'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
  cropShape?: 'rect' | 'round'
  minWidth?: number
  minHeight?: number
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio,
  cropShape = 'rect',
  minWidth = 100,
  minHeight = 100
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
  }, [aspectRatio])

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    setIsProcessing(true)
    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const crop = completedCrop

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setIsProcessing(false)
      return
    }

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotate * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    ctx.restore()

    // Convert to blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsProcessing(false)
          return
        }
        const croppedImageUrl = URL.createObjectURL(blob)
        onCropComplete(croppedImageUrl)
        setIsProcessing(false)
      },
      'image/jpeg',
      0.95
    )
  }, [completedCrop, scale, rotate, onCropComplete])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 sm:rounded-2xl w-full h-full sm:max-w-4xl sm:w-full sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recadrer l'image
            </h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image cropping area */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 dark:bg-gray-900">
            <div className="h-full flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={minWidth}
                minHeight={minHeight}
                circularCrop={cropShape === 'round'}
                className="touch-none"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxHeight: 'calc(100vh - 280px)',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                    touchAction: 'none'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4">
            {/* Mobile-optimized controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 sm:justify-center">
              {/* Zoom controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex-1 sm:flex-initial flex items-center gap-2 px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full sm:w-24 touch-none"
                  />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[2.5rem] sm:min-w-[3rem] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                </div>
                <button
                  onClick={() => setScale(Math.min(3, scale + 0.1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Rotate control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotate((rotate - 90) % 360)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {rotate}°
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between sm:justify-end gap-2 sm:gap-3">
              <button
                onClick={onCancel}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                onClick={handleCropComplete}
                disabled={!completedCrop || isProcessing}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Appliquer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hidden canvas for image processing */}
          <canvas
            ref={previewCanvasRef}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}