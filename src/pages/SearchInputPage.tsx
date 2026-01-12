import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getHierarchicalCodes } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'

export default function SearchInputPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'job'
  const { setFilters } = useStore()

  // 계층구조 선택 상태
  const [selectedMajor, setSelectedMajor] = useState<string>('')
  const [selectedMiddle, setSelectedMiddle] = useState<string>('')
  const [selectedSmall, setSelectedSmall] = useState<string>('')
  const [selectedSub, setSelectedSub] = useState<string>('')

  // 계층구조 데이터 로드
  const {
    data: hierarchicalData = [],
    loading: hierarchicalLoading,
    error: hierarchicalError,
    execute: loadHierarchical,
  } = useAsync(() => getHierarchicalCodes(), { immediate: false })

  // 컴포넌트 마운트 시 계층구조 데이터 로드
  useEffect(() => {
    if (mode === 'job') {
      loadHierarchical()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // 디버깅: 계층구조 데이터 로드 확인
  useEffect(() => {
    if (hierarchicalData && hierarchicalData.length > 0) {
      console.log('계층구조 데이터 로드됨:', hierarchicalData.length, '개')
      console.log('첫 번째 항목:', hierarchicalData[0])
    } else if (!hierarchicalLoading && !hierarchicalError) {
      console.log('계층구조 데이터가 비어있습니다.')
    }
    if (hierarchicalError) {
      console.error('계층구조 데이터 로드 오류:', hierarchicalError)
    }
  }, [hierarchicalData, hierarchicalLoading, hierarchicalError])

  // 선택 초기화 함수 (하위 레벨만 초기화)
  const resetSelection = (level: 'major' | 'middle' | 'small' | 'sub') => {
    if (level === 'major') {
      // 대분류 선택 시 하위 레벨만 초기화 (대분류는 유지)
      setSelectedMiddle('')
      setSelectedSmall('')
      setSelectedSub('')
    } else if (level === 'middle') {
      // 중분류 선택 시 하위 레벨만 초기화
      setSelectedSmall('')
      setSelectedSub('')
    } else if (level === 'small') {
      // 소분류 선택 시 하위 레벨만 초기화
      setSelectedSub('')
    }
    // sub 레벨은 하위가 없으므로 초기화할 것이 없음
  }

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

  // 현재 선택된 계층에 따른 표시할 데이터
  const getCurrentLevelData = () => {
    if (!hierarchicalData || hierarchicalData.length === 0) {
      return []
    }

    if (!selectedMajor) {
      // 대분류 목록
      return hierarchicalData.map((item) => ({
        type: 'major' as const,
        name: item.major,
        data: item,
      }))
    }

    const selectedMajorData = hierarchicalData.find((item) => item.major === selectedMajor)
    if (!selectedMajorData) return []

    if (!selectedMiddle) {
      // 중분류 목록
      return selectedMajorData.middles.map((middle) => ({
        type: 'middle' as const,
        name: middle.name,
        data: middle,
      }))
    }

    const selectedMiddleData = selectedMajorData.middles.find((m) => m.name === selectedMiddle)
    if (!selectedMiddleData) return []

    if (!selectedSmall) {
      // 소분류 목록
      return selectedMiddleData.smalls.map((small) => ({
        type: 'small' as const,
        name: small.name,
        data: small,
      }))
    }

    const selectedSmallData = selectedMiddleData.smalls.find((s) => s.name === selectedSmall)
    if (!selectedSmallData) return []

    // 세분류 목록
    return selectedSmallData.subs.map((sub) => ({
      type: 'sub' as const,
      name: sub,
      data: null,
    }))
  }

  const currentLevelData = getCurrentLevelData()

  const getLevelLabel = () => {
    if (!selectedMajor) return '대분류'
    if (!selectedMiddle) return '중분류'
    if (!selectedSmall) return '소분류'
    return '세분류'
  }

  const handleItemClick = (type: 'major' | 'middle' | 'small' | 'sub', name: string) => {
    console.log('버튼 클릭:', type, name)
    if (type === 'major') {
      console.log('대분류 선택:', name)
      resetSelection('major') // 하위 레벨 초기화
      setSelectedMajor(name) // 대분류 선택
    } else if (type === 'middle') {
      console.log('중분류 선택:', name)
      resetSelection('middle') // 하위 레벨 초기화
      setSelectedMiddle(name) // 중분류 선택
    } else if (type === 'small') {
      console.log('소분류 선택:', name)
      resetSelection('small') // 하위 레벨 초기화
      setSelectedSmall(name) // 소분류 선택
    } else if (type === 'sub') {
      console.log('세분류 선택:', name)
      setSelectedSub(name) // 세분류 선택
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* 계층구조 선택 (직무 모드일 때만 표시) */}
        {mode === 'job' && (
          <div className="w-full bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">계층구조 선택</h3>

            {/* 선택 경로 표시 */}
            {(selectedMajor || selectedMiddle || selectedSmall || selectedSub) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-gray-700 mb-2 font-semibold">선택된 경로:</p>
                <div className="flex items-center space-x-2 text-sm flex-wrap">
                  {selectedMajor && (
                    <>
                      <button
                        onClick={() => resetSelection('major')}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {selectedMajor}
                      </button>
                      {selectedMiddle && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedMiddle && (
                    <>
                      <button
                        onClick={() => resetSelection('middle')}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {selectedMiddle}
                      </button>
                      {selectedSmall && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedSmall && (
                    <>
                      <button
                        onClick={() => resetSelection('small')}
                        className="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                      >
                        {selectedSmall}
                      </button>
                      {selectedSub && <span className="text-gray-400">→</span>}
                    </>
                  )}
                  {selectedSub && (
                    <span className="px-2 py-1 bg-blue-300 text-white rounded">
                      {selectedSub}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 현재 레벨 버튼 목록 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {getLevelLabel()} 선택
                {hierarchicalLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
              </h4>
              {hierarchicalError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-700">데이터를 불러오는 중 오류가 발생했습니다.</p>
                </div>
              )}
              {!hierarchicalLoading && !hierarchicalError && currentLevelData.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-700">표시할 데이터가 없습니다.</p>
                </div>
              )}
              {currentLevelData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {currentLevelData.map((item, index) => (
                    <button
                      key={`${item.type}-${item.name}-${index}`}
                      onClick={() => handleItemClick(item.type, item.name)}
                      className={`px-4 py-2 rounded-md text-sm transition ${
                        (item.type === 'major' && selectedMajor === item.name) ||
                        (item.type === 'middle' && selectedMiddle === item.name) ||
                        (item.type === 'small' && selectedSmall === item.name) ||
                        (item.type === 'sub' && selectedSub === item.name)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 검색 버튼 */}
            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={!selectedMajor}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
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

        {/* 메인 컨텐츠 */}
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
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
              <p className="text-gray-600">
                위의 계층구조 선택 패널에서 대분류, 중분류, 소분류, 세분류를 선택하여 검색하세요.
              </p>
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">
                  <strong>사용 방법:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>대분류 버튼을 클릭하면 중분류 목록이 표시됩니다</li>
                  <li>중분류 버튼을 클릭하면 소분류 목록이 표시됩니다</li>
                  <li>소분류 버튼을 클릭하면 세분류 목록이 표시됩니다</li>
                  <li>원하는 단계까지 선택한 후 검색 버튼을 클릭하세요</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
