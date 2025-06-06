'use client'

import { motion, AnimatePresence } from 'framer-motion'
import LivePhonePreview from './LivePhonePreview'

interface EditPhonePreviewProps {
  isVisible: boolean
  user?: any
  links?: any[]
}

export default function EditPhonePreview({ isVisible, user, links }: EditPhonePreviewProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ 
            type: 'spring',
            damping: 25,
            stiffness: 200
          }}
          className="hidden lg:block fixed right-80 top-0 h-full z-50"
        >
          <LivePhonePreview user={user} links={links} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}