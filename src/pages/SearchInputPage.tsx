import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Send, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { mapAlias, getStandardCodes } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import type { AliasMapping } from '../types'

export default function SearchInputPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'job'
  const { setFilters } = useStore()

  const [inputType, setInputType] = useState<'free' | 'dropdown'>('free')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Array<{ 
    type: 'user' | 'system'
    content: string
    mapping?: AliasMapping
    mappingType?: 'department' | 'industry' | 'job'
  }>>([
    {
      type: 'system',
      content: mode === 'job' 
        ? '직무, 산업, 부서를 입력해주세요. (예: "품질관리팀", "QA", "품질팀")'
        : '검색할 키워드를 입력해주세요.',
    },
  ])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'departments' | 'industries' | 'jobs'>('departments')
  const [mappingError, setMappingError] = useState<string | null>(null)

  // 표준 코드 로드 (selectedCategory 변경 시에만)
  const {
    data: standardCodes,
    loading: codesLoading,
    error: codesError,
    execute: loadStandardCodes,
  } = useAsync(() => getStandardCodes(selectedCategory), { immediate: false })

  const standardCodesList = standardCodes || []
  
  // selectedCategory 변경 시 표준 코드 로드
  useEffect(() => {
    loadStandardCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])
  
  // 디버깅: 표준 코드 로드 확인
  useEffect(() => {
    if (standardCodesList.length > 0) {
      console.log('표준 코드 로드됨:', selectedCategory, standardCodesList)
    }
  }, [standardCodesList, selectedCategory])

  // 핵심 키워드 추출 함수
  const extractKeyword = (input: string): string => {
    // 불필요한 단어 제거 패턴
    const stopWords = [
      '관련', '직무를', '직무', '찾아줘', '찾아', '보여줘', '알려줘', '검색해줘',
      '의', '을', '를', '이', '가', '에', '에서', '로', '으로', '와', '과',
      '어떤', '무엇', '어디', '누구', '언제', '어떻게',
      '관해서', '대해서', '위해서', '통해서',
      '등', '및', '또는', '그리고', '하지만', '그런데',
      '해줘', '해주세요', '주세요', '주시겠어요'
    ]
    
    let cleaned = input.trim()
    
    // 불필요한 단어 제거
    stopWords.forEach(word => {
      const regex = new RegExp(`\\s*${word}\\s*`, 'gi')
      cleaned = cleaned.replace(regex, ' ')
    })
    
    // 연속된 공백 제거 및 앞뒤 공백 제거
    cleaned = cleaned.replace(/\s+/g, ' ').trim()
    
    // 결과가 비어있으면 원본 반환
    if (!cleaned) {
      return input.trim()
    }
    
    // 여러 단어가 있으면 가장 긴 단어나 첫 번째 의미있는 단어 선택
    const words = cleaned.split(/\s+/)
    
    // 단어가 하나면 그대로 반환
    if (words.length === 1) {
      return words[0]
    }
    
    // 여러 단어 중 가장 긴 단어 선택 (일반적으로 핵심 키워드가 더 길 수 있음)
    const longestWord = words.reduce((a, b) => a.length > b.length ? a : b)
    
    // 가장 긴 단어가 너무 짧으면 (2자 이하) 전체를 반환
    if (longestWord.length <= 2) {
      return cleaned
    }
    
    // 가장 긴 단어가 전체의 50% 이상이면 그 단어만 반환, 아니면 전체 반환
    if (longestWord.length >= cleaned.length * 0.5) {
      return longestWord
    }
    
    return cleaned
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    setMappingError(null)

    // 사용자 메시지 추가
    const userInput = inputValue.trim()
    setMessages((prev) => [
      ...prev,
      { type: 'user', content: userInput },
    ])

    try {
      // 키워드 모드: 핵심 키워드 추출 후 검색
      if (mode === 'keyword') {
        const extractedKeyword = extractKeyword(userInput)
        const newFilters: any = {
          keyword: extractedKeyword
        }
        
        setFilters(newFilters)
        console.log('키워드 필터 설정 완료:', { 원본: userInput, 추출된키워드: extractedKeyword, 필터: newFilters })
        
        // 추출된 키워드가 원본과 다르면 시스템 메시지 추가
        if (extractedKeyword !== userInput) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              content: `핵심 키워드 "${extractedKeyword}"로 검색합니다.`,
            },
          ])
        }
        
        // 바로 검색 결과 페이지로 이동
        navigate('/results')
        setInputValue('')
        return
      }

      // 직무 모드: 별칭 매핑 처리
      // 매핑 타입 결정
      const mappingType =
        selectedCategory === 'departments'
          ? 'department'
          : selectedCategory === 'industries'
          ? 'industry'
          : 'job'

      // API를 통한 매핑 처리
      const mapping = await mapAlias(userInput, mappingType)
      console.log('매핑 결과 (전체):', mapping)
      console.log('매핑 타입 체크:', {
        isObject: typeof mapping === 'object',
        hasInput: 'input' in mapping,
        hasStandard: 'standard' in mapping,
        hasConfidence: 'confidence' in mapping,
        confidence: mapping?.confidence,
        confidenceType: typeof mapping?.confidence
      })

      // 시스템 응답 추가
      let systemMessage = ''
      let finalMapping = mapping
      
      if (mapping.confidence >= 0.8) {
        systemMessage = `"${mapping.standard}"(표준)로 매핑되었습니다.\n입력: ${mapping.input}`
      } else {
        // candidates가 없으면 표준 코드 목록을 사용
        const candidates = mapping.candidates && mapping.candidates.length > 0
          ? mapping.candidates
          : standardCodesList.length > 0
          ? standardCodesList.slice(0, 5) // 최대 5개만 표시
          : []
        
        // mapping 객체에 candidates 추가 (버튼 표시를 위해)
        finalMapping = {
          ...mapping,
          candidates: candidates.length > 0 ? candidates : mapping.candidates,
        }
        
        if (candidates.length > 0) {
          systemMessage = `${candidates.map((c, i) => `${i + 1}. ${c}`).join('\n')}`
        } else {
          systemMessage = `입력하신 "${userInput}"에 대한 표준 매핑을 찾을 수 없습니다.\n표준 코드를 선택하거나 다른 키워드를 입력해주세요.`
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: systemMessage,
          mapping: finalMapping,
          mappingType, // 매핑 타입도 저장
        },
      ])

      // 필터 설정 및 결과 페이지로 이동
      if (mapping.confidence >= 0.8) {
        const newFilters: any = {}
        if (mappingType === 'department') {
          newFilters.department = mapping.standard
        } else if (mappingType === 'industry') {
          newFilters.industry = mapping.standard
        } else {
          newFilters.jobCategory = mapping.standard
        }

        setFilters(newFilters)
        console.log('필터 설정 완료:', newFilters)

        // 필터가 설정된 후 바로 이동 (setTimeout 제거)
        navigate('/results')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '매핑 처리 중 오류가 발생했습니다.'
      setMappingError(errorMessage)
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          content: `오류: ${errorMessage}`,
        },
      ])
    }

    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDropdownSelect = (value: string) => {
    setInputValue(value)
    setShowDropdown(false)
    handleSubmit()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'job' ? '직무로 찾기' : '키워드로 찾기'}
        </h2>

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

        {/* 챗봇 대화 영역 */}
        <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${
                msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.mapping && msg.mapping.confidence < 0.8 && (() => {
                  // candidates가 없으면 표준 코드 목록 사용
                  // 메시지에 저장된 mappingType 사용, 없으면 현재 selectedCategory 기반으로 결정
                  const msgMappingType = msg.mappingType || (mode === 'job'
                    ? selectedCategory === 'departments'
                      ? 'department'
                      : selectedCategory === 'industries'
                      ? 'industry'
                      : 'job'
                    : 'department')
                  
                  // candidates가 있으면 사용, 없으면 표준 코드 목록 사용
                  let candidates = msg.mapping.candidates && msg.mapping.candidates.length > 0
                    ? msg.mapping.candidates
                    : []
                  
                  // candidates가 없고 표준 코드도 로드되지 않았으면 현재 카테고리의 표준 코드 사용
                  if (candidates.length === 0 && standardCodesList.length > 0) {
                    candidates = standardCodesList.slice(0, 5)
                  }
                  
                  console.log('후보 표시:', {
                    candidates,
                    standardCodesList,
                    msgMappingType,
                    mapping: msg.mapping
                  })
                  
                  if (candidates.length === 0) {
                    return null
                  }
                  
                  return (
                    <div className="mt-2 space-y-1">
                      {candidates.map((candidate, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            const newFilters: any = {}
                            if (mode === 'keyword') {
                              // 키워드 모드: 키워드 필터만 설정 (부서 필터 제거)
                              newFilters.keyword = candidate
                            } else {
                              // 직무 모드: 매핑 타입에 따라 필터 설정
                              if (msgMappingType === 'department') {
                                newFilters.department = candidate
                              } else if (msgMappingType === 'industry') {
                                newFilters.industry = candidate
                              } else {
                                newFilters.jobCategory = candidate
                              }
                            }
                            setFilters(newFilters)
                            navigate('/results')
                          }}
                          className="block w-full text-left px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded text-sm transition"
                        >
                          {candidate}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {mappingError && (
          <ErrorMessage
            message={mappingError}
            onDismiss={() => setMappingError(null)}
          />
        )}

        {/* 입력 영역 */}
        {inputType === 'free' ? (
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === 'job'
                  ? '직무, 산업, 부서를 입력하세요...'
                  : '키워드를 입력하세요...'
              }
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
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md flex justify-between items-center hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {selectedCategory === 'departments'
                    ? '부서'
                    : selectedCategory === 'industries'
                    ? '산업'
                    : '직무'}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {codesLoading ? (
                    <div className="px-4 py-2 text-center text-gray-500">
                      로딩 중...
                    </div>
                  ) : codesError ? (
                    <div className="px-4 py-2 text-center text-red-500">
                      오류가 발생했습니다.
                    </div>
                  ) : (
                    standardCodesList.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleDropdownSelect(item)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-md last:rounded-b-md"
                      >
                        {item}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory('departments')}
                className={`px-4 py-2 rounded-md text-sm ${
                  selectedCategory === 'departments'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                부서
              </button>
              <button
                onClick={() => setSelectedCategory('industries')}
                className={`px-4 py-2 rounded-md text-sm ${
                  selectedCategory === 'industries'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                산업
              </button>
              <button
                onClick={() => setSelectedCategory('jobs')}
                className={`px-4 py-2 rounded-md text-sm ${
                  selectedCategory === 'jobs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                직무
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

