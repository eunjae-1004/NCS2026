import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
  title?: string
}

export default function ErrorMessage({
  message,
  onDismiss,
  title = '오류',
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="ml-4 text-red-600 hover:text-red-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}



