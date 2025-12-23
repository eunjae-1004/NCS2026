import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

export default function Loading({ message = '로딩 중...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return <div className="py-12">{content}</div>
}



