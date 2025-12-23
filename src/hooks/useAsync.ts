import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseAsyncResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<void>
  reset: () => void
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncResult<T> {
  const { immediate = false, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)

  // 최신 asyncFunction을 항상 참조하도록 useRef 사용
  const asyncFunctionRef = useRef(asyncFunction)
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction
  }, [asyncFunction])

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true)
      setError(null)

      try {
        // 항상 최신 asyncFunction을 호출
        const result = await asyncFunctionRef.current(...args)
        setData(result)
        onSuccess?.(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    [onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate])

  return { data, loading, error, execute, reset }
}


