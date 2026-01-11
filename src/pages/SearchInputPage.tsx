import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Send, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getCategoryList } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import ErrorMessage from '../components/ErrorMessage'

export default function SearchInputPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'job'
  const { setFilters } = useStore()

  // 4단계 계층구조 선택 상태
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedMiddle, setSelectedMiddle] = useState<string>('')
  const [selectedSmall, setSelectedSmall] = useState<string>('')
  const [selectedSub, setSelectedSub] = useState<string>('')

  // 각 단계별 목록 로드
  const {
    data: majorList = [],
    execute: loadMajors,
  } = useAsync(() => getCategoryList('major'), { immediate: false })

  const {
    data: middleList = [],
    execute: loadMiddles,
  } = useAsync(() => getCategoryList('middle', selectedMajor), { immediate: false })

  const {
    data: smallList = [],
    execute: loadSmalls,
  } = useAsync(() => getCategoryList('small', selectedMajor && selectedMiddle ? `${selectedMajor}|${selectedMiddle}` : undefined), { immediate: false })

  const {
    data: subList = [],
    execute: loadSubs,
  } = useAsync(() => getCategoryList('sub', selectedMajor && selectedMiddle && selectedSmall ? `${selectedMajor}|${selectedMiddle}|${selectedSmall}` : undefined), { immediate: false })

  // 컴포넌트 마운트 시 Major 목록 로드
  useEffect(() => {
    if (mode === 'job') {
      loadMajors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Major 선택 시 Middle 목록 로드
  useEffect(() => {
    if (selectedMajor) {
      loadMiddles()
      // 하위 선택 초기화
      setSelectedMiddle('')
      setSelectedSmall('')
      setSelectedSub('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor])

  // Middle 선택 시 Small 목록 로드
  useEffect(() => {
    if (selectedMajor && selectedMiddle) {
      loadSmalls()
      // 하위 선택 초기화
      setSelectedSmall('')
      setSelectedSub('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor, selectedMiddle])

  // Small 선택 시 Sub 목록 로드
  useEffect(() => {
    if (selectedMajor && selectedMiddle && selectedSmall) {
      loadSubs()
      // 하위 선택 초기화
      setSelectedSub('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor, selectedMiddle, selectedSmall])

  // 키워드 모드 처리
  const [inputValue, setInputValue] = useState('')

  const extractKeyword = (input: string): string => {
    const stopWords = [
      '관련', '직무를', '직무', '찾아줘', '찾아', '보여줘', '알려줘', '검색해줘',
      '의', '을', '를', '이', '가', '에', '에서', '로', '으로', '와', '과',
      '어떤', '무엇', '어디', '누구', '언제', '어떻게',
      '관해서', '대해서', '위해서', '통해서',
      '등', '및', '또는', '그리고', '하지만', '그런데',
      '해줘', '해주세요', '주세요', '주시겠어요'
    ]
    
    let cleaned = input.trim()
    
    stopWords.forEach(word => {
      const regex = new RegExp(`\\s*${word}\\s*`, 'gi')
      cleaned = cleaned.replace(regex, ' ')
    })
    
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    if (!cleaned) {
      return input.trim()
    }
    
    const words = cleaned.split(/\s+/)
    
    if (words.length === 1) {
      return words[0]
    }
    
    const longestWord = words.reduce((a, b) => a.length > b.length ? a : b)
    
    if (longestWord.length <= 2) {
      return cleaned
    }
    
    if (longestWord.length >= cleaned.length * 0.5) {
      return longestWord
    }
    
    return cleaned
  }

  const handleSubmit = () => {
    if (mode === 'keyword') {
      if (!inputValue.trim()) return
      
      const extractedKeyword = extractKeyword(inputValue.trim())
      const newFilters: any = {
        keyword: extractedKeyword
      }
      
      setFilters(newFilters)
      navigate('/results')
      setInputValue('')
      return
    }

    // 직무 모드: 계층구조 선택 기반 검색
    if (!selectedMajor) {
      alert('대분류를 선택해주세요.')
      return
    }

    const newFilters: any = {
      industry: selectedMajor, // major_category_name
    }

    // 중분류 선택
    if (selectedMiddle) {
      newFilters.middle = selectedMiddle
    }

    // 소분류 선택
    if (selectedSmall) {
      newFilters.small = selectedSmall
    }

    // 세분류 선택 (jobCategory로 사용)
    if (selectedSub) {
      newFilters.jobCategory = selectedSub // sub_category_name
    } else if (selectedSmall) {
      // 소분류만 선택된 경우, 해당 소분류에 속한 세분류를 모두 검색
      // jobCategory는 사용하지 않고 small만 사용
      newFilters.jobCategory = undefined
    } else if (selectedMiddle) {
      // 중분류만 선택된 경우, 해당 중분류에 속한 모든 항목 검색
      newFilters.jobCategory = undefined
    }

    setFilters(newFilters)
    console.log('필터 설정 완료:', newFilters)
    navigate('/results')
  }

  const handleReset = () => {
    setSelectedMajor('')
    setSelectedMiddle('')
    setSelectedSmall('')
    setSelectedSub('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'job' ? '직무로 찾기' : '키워드로 찾기'}
        </h2>

        {mode === 'keyword' ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                placeholder="키워드를 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>전송</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 4단계 계층구조 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 대분류 (Major) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대분류 (Major)
                </label>
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {majorList.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>

              {/* 중분류 (Middle) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  중분류 (Middle)
                </label>
                <select
                  value={selectedMiddle}
                  onChange={(e) => setSelectedMiddle(e.target.value)}
                  disabled={!selectedMajor}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택하세요</option>
                  {middleList.map((middle) => (
                    <option key={middle} value={middle}>
                      {middle}
                    </option>
                  ))}
                </select>
              </div>

              {/* 소분류 (Small) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소분류 (Small)
                </label>
                <select
                  value={selectedSmall}
                  onChange={(e) => setSelectedSmall(e.target.value)}
                  disabled={!selectedMajor || !selectedMiddle}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택하세요</option>
                  {smallList.map((small) => (
                    <option key={small} value={small}>
                      {small}
                    </option>
                  ))}
                </select>
              </div>

              {/* 세분류 (Sub) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  세분류 (Sub)
                </label>
                <select
                  value={selectedSub}
                  onChange={(e) => setSelectedSub(e.target.value)}
                  disabled={!selectedMajor || !selectedMiddle || !selectedSmall}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택하세요</option>
                  {subList.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 선택된 계층구조 표시 */}
            {(selectedMajor || selectedMiddle || selectedSmall || selectedSub) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">선택된 계층구조:</span>
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  {selectedMajor && (
                    <span className="px-2 py-1 bg-blue-600 text-white rounded">
                      {selectedMajor}
                    </span>
                  )}
                  {selectedMiddle && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-blue-500 text-white rounded">
                        {selectedMiddle}
                      </span>
                    </>
                  )}
                  {selectedSmall && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-blue-400 text-white rounded">
                        {selectedSmall}
                      </span>
                    </>
                  )}
                  {selectedSub && (
                    <>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-1 bg-blue-300 text-white rounded">
                        {selectedSub}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit}
                disabled={!selectedMajor}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>검색</span>
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                초기화
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
