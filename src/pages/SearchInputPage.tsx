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

  // 입력 방식 선택
  const [inputType, setInputType] = useState<'free' | 'dropdown'>('free')
  
  // 자유 입력 모드
  const [inputValue, setInputValue] = useState('')

  // 드롭다운 선택 모드
  const [selectedCategory, setSelectedCategory] = useState<'major' | 'middle' | 'small' | 'sub'>('major')
  const [selectedValue, setSelectedValue] = useState<string>('')
  const [showDropdown, setShowDropdown] = useState(false)

  // 계층구조 선택 상태 (검색용)
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedMiddle, setSelectedMiddle] = useState<string>('')
  const [selectedSmall, setSelectedSmall] = useState<string>('')
  const [selectedSub, setSelectedSub] = useState<string>('')

  // 각 카테고리별 목록 로드
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

  // 현재 선택된 카테고리에 따른 목록
  const getCurrentList = () => {
    switch (selectedCategory) {
      case 'major':
        return majorList
      case 'middle':
        return middleList
      case 'small':
        return smallList
      case 'sub':
        return subList
      default:
        return []
    }
  }

  const currentList = getCurrentList()

  // 컴포넌트 마운트 시 Major 목록 로드
  useEffect(() => {
    if (mode === 'job') {
      loadMajors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // 카테고리 변경 시 목록 로드
  useEffect(() => {
    if (selectedCategory === 'major') {
      loadMajors()
    } else if (selectedCategory === 'middle' && selectedMajor) {
      loadMiddles()
    } else if (selectedCategory === 'small' && selectedMajor && selectedMiddle) {
      loadSmalls()
    } else if (selectedCategory === 'sub' && selectedMajor && selectedMiddle && selectedSmall) {
      loadSubs()
    }
    setSelectedValue('')
    setShowDropdown(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedMajor, selectedMiddle, selectedSmall])

  // Major 선택 시 Middle 목록 로드
  useEffect(() => {
    if (selectedMajor) {
      loadMiddles()
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
      setSelectedSmall('')
      setSelectedSub('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor, selectedMiddle])

  // Small 선택 시 Sub 목록 로드
  useEffect(() => {
    if (selectedMajor && selectedMiddle && selectedSmall) {
      loadSubs()
      setSelectedSub('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMajor, selectedMiddle, selectedSmall])

  // 키워드 추출 함수
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

    // 직무 모드
    if (inputType === 'free') {
      // 자유 입력 모드: 입력값을 키워드로 검색
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

    // 드롭다운 선택 모드
    if (!selectedValue) {
      alert(`${selectedCategory === 'major' ? '대분류' : selectedCategory === 'middle' ? '중분류' : selectedCategory === 'small' ? '소분류' : '세분류'}를 선택해주세요.`)
      return
    }

    // 선택된 값에 따라 계층구조 업데이트
    if (selectedCategory === 'major') {
      setSelectedMajor(selectedValue)
      // 대분류만 선택된 경우 바로 검색
      const newFilters: any = {
        industry: selectedValue,
      }
      setFilters(newFilters)
      navigate('/results')
    } else if (selectedCategory === 'middle') {
      if (!selectedMajor) {
        alert('대분류를 먼저 선택해주세요.')
        return
      }
      setSelectedMiddle(selectedValue)
      const newFilters: any = {
        industry: selectedMajor,
        middle: selectedValue,
      }
      setFilters(newFilters)
      navigate('/results')
    } else if (selectedCategory === 'small') {
      if (!selectedMajor || !selectedMiddle) {
        alert('대분류와 중분류를 먼저 선택해주세요.')
        return
      }
      setSelectedSmall(selectedValue)
      const newFilters: any = {
        industry: selectedMajor,
        middle: selectedMiddle,
        small: selectedValue,
      }
      setFilters(newFilters)
      navigate('/results')
    } else if (selectedCategory === 'sub') {
      if (!selectedMajor || !selectedMiddle || !selectedSmall) {
        alert('대분류, 중분류, 소분류를 먼저 선택해주세요.')
        return
      }
      setSelectedSub(selectedValue)
      const newFilters: any = {
        industry: selectedMajor,
        middle: selectedMiddle,
        small: selectedSmall,
        jobCategory: selectedValue,
      }
      setFilters(newFilters)
      navigate('/results')
    }

    setSelectedValue('')
    setShowDropdown(false)
  }

  const handleDropdownSelect = (value: string) => {
    setSelectedValue(value)
    setShowDropdown(false)
    // 자동으로 검색 실행
    setTimeout(() => {
      handleSubmit()
    }, 100)
  }

  const handleReset = () => {
    setSelectedMajor('')
    setSelectedMiddle('')
    setSelectedSmall('')
    setSelectedSub('')
    setSelectedValue('')
    setInputValue('')
  }

  const getCategoryLabel = () => {
    switch (selectedCategory) {
      case 'major':
        return '대분류'
      case 'middle':
        return '중분류'
      case 'small':
        return '소분류'
      case 'sub':
        return '세분류'
      default:
        return ''
    }
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
          <div className="space-y-4">
            {/* 입력 방식 선택 */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setInputType('free')}
                className={`px-4 py-2 rounded-md transition ${
                  inputType === 'free'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                자유 입력
              </button>
              <button
                onClick={() => setInputType('dropdown')}
                className={`px-4 py-2 rounded-md transition ${
                  inputType === 'dropdown'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                드롭다운 선택
              </button>
            </div>

            {inputType === 'free' ? (
              /* 자유 입력 모드 */
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-gray-500 mb-4">
                    직무, 산업, 부서를 입력해주세요. (예: "품질관리팀", "QA", "품질팀")
                  </p>
                </div>
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
                    placeholder="직무, 산업, 부서를 입력하세요..."
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
              /* 드롭다운 선택 모드 */
              <div className="space-y-4">
                {/* 카테고리 선택 버튼 */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('major')
                      setSelectedValue('')
                      setShowDropdown(false)
                    }}
                    className={`px-4 py-2 rounded-md text-sm ${
                      selectedCategory === 'major'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    대분류
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedMajor) {
                        alert('대분류를 먼저 선택해주세요.')
                        return
                      }
                      setSelectedCategory('middle')
                      setSelectedValue('')
                      setShowDropdown(false)
                    }}
                    disabled={!selectedMajor}
                    className={`px-4 py-2 rounded-md text-sm ${
                      selectedCategory === 'middle'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    중분류
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedMajor || !selectedMiddle) {
                        alert('대분류와 중분류를 먼저 선택해주세요.')
                        return
                      }
                      setSelectedCategory('small')
                      setSelectedValue('')
                      setShowDropdown(false)
                    }}
                    disabled={!selectedMajor || !selectedMiddle}
                    className={`px-4 py-2 rounded-md text-sm ${
                      selectedCategory === 'small'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    소분류
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedMajor || !selectedMiddle || !selectedSmall) {
                        alert('대분류, 중분류, 소분류를 먼저 선택해주세요.')
                        return
                      }
                      setSelectedCategory('sub')
                      setSelectedValue('')
                      setShowDropdown(false)
                    }}
                    disabled={!selectedMajor || !selectedMiddle || !selectedSmall}
                    className={`px-4 py-2 rounded-md text-sm ${
                      selectedCategory === 'sub'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
                  >
                    세분류
                  </button>
                </div>

                {/* 선택된 카테고리의 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50"
                  >
                    <span className="text-gray-700">
                      {selectedValue || `${getCategoryLabel()}를 선택하세요`}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                  {showDropdown && currentList.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {currentList.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleDropdownSelect(item)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-md last:rounded-b-md"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
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
                    disabled={!selectedValue}
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
        )}
      </div>
    </div>
  )
}
