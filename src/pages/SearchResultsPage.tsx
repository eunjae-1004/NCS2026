import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, ClipboardList, Eye, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import { searchAbilityUnits, saveSelectionHistory, getHierarchicalCodes } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import Pagination from '../components/Pagination'
import type { SearchFilters, PaginationMeta } from '../types'

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const { filters, addToCart, recordSelection, user } = useStore()
  const [showFilters, setShowFilters] = useState(true)
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    ...filters,
    page: 1,
    limit: 20,
  })
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  // 계층구조 데이터 로드
  const {
    data: hierarchicalData,
    execute: loadHierarchical,
  } = useAsync(() => getHierarchicalCodes(), { immediate: false })

  // 산업분야 목록 추출 (major에서 추출)
  const industryCodes = (hierarchicalData || []).map((item) => item.major)

  // 선택된 대분류에 해당하는 중분류 목록
  const middleCodes = localFilters.industry
    ? (() => {
        const selectedIndustry = (hierarchicalData || []).find((item) => item.major === localFilters.industry)
        if (!selectedIndustry) return []
        return selectedIndustry.middles.map((middle) => middle.name)
      })()
    : []

  // 선택된 중분류에 해당하는 소분류 목록
  const smallCodes = localFilters.industry && localFilters.middle
    ? (() => {
        const selectedIndustry = (hierarchicalData || []).find((item) => item.major === localFilters.industry)
        if (!selectedIndustry) return []
        const selectedMiddle = selectedIndustry.middles.find((m) => m.name === localFilters.middle)
        if (!selectedMiddle) return []
        return selectedMiddle.smalls.map((small) => small.name)
      })()
    : []

  // 선택된 소분류에 해당하는 세분류 목록
  const subCodes = localFilters.industry && localFilters.middle && localFilters.small
    ? (() => {
        const selectedIndustry = (hierarchicalData || []).find((item) => item.major === localFilters.industry)
        if (!selectedIndustry) return []
        const selectedMiddle = selectedIndustry.middles.find((m) => m.name === localFilters.middle)
        if (!selectedMiddle) return []
        const selectedSmall = selectedMiddle.smalls.find((s) => s.name === localFilters.small)
        if (!selectedSmall) return []
        return selectedSmall.subs
      })()
    : []

  // 컴포넌트 마운트 시 계층구조 데이터 로드
  useEffect(() => {
    loadHierarchical()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // filters가 변경되면 localFilters 업데이트 (페이지는 유지)
  useEffect(() => {
    console.log('스토어 filters 변경됨:', filters)
    // filters에 실제 값이 있고, localFilters와 다를 때만 업데이트
    const hasFilters = Object.keys(filters).length > 0
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify({
      ...localFilters,
      page: localFilters.page,
      limit: localFilters.limit,
    })
    
    if (hasFilters && filtersChanged) {
      console.log('localFilters 업데이트:', { 기존: localFilters, 새: filters })
      setLocalFilters({
        ...filters,
        page: localFilters.page || 1, // 페이지는 유지
        limit: localFilters.limit || 20, // limit도 유지
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // 검색 실행
  // 검색 실행을 위한 상태 관리
  const [searchFilters, setSearchFilters] = useState<SearchFilters | null>(null)
  
  const {
    data: searchResult,
    loading,
    error,
    execute: executeSearch,
  } = useAsync(async () => {
    if (!searchFilters) return null
    console.log('검색 실행 - 필터:', searchFilters)
    try {
      const result = await searchAbilityUnits(searchFilters)
      console.log('검색 결과 받음:', result)
      return result
    } catch (err) {
      console.error('검색 오류:', err)
      throw err
    }
  }, { immediate: false })

  const filteredResults = searchResult?.data || []
  
  // 디버깅: 검색 결과 확인
  useEffect(() => {
    console.log('검색 결과 상태:', {
      searchResult,
      hasData: !!searchResult?.data,
      dataLength: searchResult?.data?.length || 0,
      filteredResultsLength: filteredResults.length,
      pagination: searchResult?.pagination,
      error,
      loading
    })
  }, [searchResult, filteredResults, error, loading])

  // 검색 결과 업데이트 시 페이지네이션 정보 설정
  useEffect(() => {
    if (searchResult?.pagination) {
      setPagination(searchResult.pagination)
    }
  }, [searchResult])

  // 초기 마운트 시 검색 실행 (한 번만)
  useEffect(() => {
    // 스토어의 filters가 있으면 localFilters 업데이트
    if (filters && Object.keys(filters).length > 0) {
      setLocalFilters({
        ...filters,
        page: localFilters.page || 1,
        limit: localFilters.limit || 20,
      })
      setSearchFilters({
        ...filters,
        page: 1,
        limit: 20,
      })
    } else if (Object.keys(localFilters).length > 0) {
      setSearchFilters(localFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // searchFilters가 변경되면 검색 실행
  useEffect(() => {
    if (searchFilters) {
      executeSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilters])

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

  // 필터 변경 시 localFilters만 업데이트 (자동 검색 안 함)
  const handleFilterChange = (newFilters: SearchFilters) => {
    // 대분류가 변경되면 하위 필터 모두 초기화
    if (newFilters.industry !== localFilters.industry) {
      newFilters.middle = undefined
      newFilters.small = undefined
      newFilters.jobCategory = undefined
    }
    // 중분류가 변경되면 하위 필터 초기화
    else if (newFilters.middle !== localFilters.middle) {
      newFilters.small = undefined
      newFilters.jobCategory = undefined
    }
    // 소분류가 변경되면 하위 필터 초기화
    else if (newFilters.small !== localFilters.small) {
      newFilters.jobCategory = undefined
    }
    setLocalFilters({ ...newFilters, page: 1, limit: 20 })
  }

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    // 키워드가 있으면 핵심 키워드 추출
    const filtersToSearch = { ...localFilters, page: 1 }
    
    if (filtersToSearch.keyword) {
      const originalKeyword = filtersToSearch.keyword
      const extractedKeyword = extractKeyword(originalKeyword)
      
      // 검색에는 추출된 키워드 사용 (더 정확한 검색을 위해)
      if (extractedKeyword !== originalKeyword) {
        filtersToSearch.keyword = extractedKeyword
        console.log('핵심 키워드 추출:', { 원본: originalKeyword, 추출된키워드: extractedKeyword })
      }
      
      // 입력 필드에는 원본 키워드 유지 (사용자가 입력한 전체 텍스트 표시)
      // localFilters는 업데이트하지 않음 (원본 키워드 유지)
    }
    
    // 페이지는 업데이트 (검색 시 1페이지로 이동)
    setLocalFilters({ ...localFilters, page: 1 })
    setSearchFilters(filtersToSearch) // 추출된 키워드로 검색 실행
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    console.log('페이지 변경 요청:', { 현재페이지: localFilters.page, 새페이지: newPage })
    const updatedFilters = { ...localFilters, page: newPage }
    console.log('업데이트된 필터:', updatedFilters)
    setLocalFilters(updatedFilters)
    setSearchFilters(updatedFilters) // 페이지 변경 시 자동 검색
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddToCart = async (abilityUnit: any) => {
    try {
      await addToCart(abilityUnit)
      recordSelection(abilityUnit.id)
      
      // DB에 선택 이력 저장 (능력단위의 산업분야/부서 정보 포함)
      if (user) {
        try {
          console.log('선택 이력 저장 시도 (SearchResultsPage - handleAddToCart):', {
            userId: user.id,
            abilityUnitId: abilityUnit.id,
            industry: abilityUnit.industry,
            department: abilityUnit.department,
            abilityUnitKeys: Object.keys(abilityUnit),
          })
          
          await saveSelectionHistory(
            user.id, 
            abilityUnit.id,
            abilityUnit.industry,
            abilityUnit.department
          )
        } catch (error) {
          console.error('선택 이력 저장 실패:', error)
        }
      }
      
      alert('선택목록에 추가되었습니다.')
    } catch (error) {
      console.error('선택목록 추가 실패:', error)
      alert(error instanceof Error ? error.message : '선택목록 추가에 실패했습니다.')
    }
  }

  const handleViewDetail = async (abilityUnit: any) => {
    recordSelection(abilityUnit.id)
    
    // DB에 선택 이력 저장 (능력단위의 산업분야/부서 정보 포함)
    if (user) {
      try {
        console.log('선택 이력 저장 시도 (SearchResultsPage - handleViewDetail):', {
          userId: user.id,
          abilityUnitId: abilityUnit.id,
          industry: abilityUnit.industry,
          department: abilityUnit.department,
          abilityUnitKeys: Object.keys(abilityUnit),
        })
        
        await saveSelectionHistory(
          user.id, 
          abilityUnit.id,
          abilityUnit.industry,
          abilityUnit.department
        )
      } catch (error) {
        console.error('선택 이력 저장 실패:', error)
      }
    }
    
    navigate(`/ability/${abilityUnit.id}`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          검색 결과{' '}
          {loading
            ? ''
            : pagination
            ? `(${pagination.total.toLocaleString()}개)`
            : `(${filteredResults.length}개)`}
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
        >
          <Filter className="w-5 h-5" />
          <span>필터 {showFilters ? '숨기기' : '보기'}</span>
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error.message || '검색 중 오류가 발생했습니다.'}
        />
      )}

      {/* 로딩 상태 */}
      {loading && <Loading message="검색 중..." />}

      <div className="flex gap-6">
        {/* 좌측 필터 */}
        {showFilters && (
          <div className="w-64 bg-white rounded-lg shadow p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">필터</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대분류
              </label>
              <select
                value={
                  localFilters.industry && industryCodes && industryCodes.includes(localFilters.industry)
                    ? localFilters.industry
                    : ''
                }
                onChange={(e) =>
                  handleFilterChange({ ...localFilters, industry: e.target.value || undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {industryCodes && industryCodes.length > 0 && industryCodes.map((code: string) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                중분류
              </label>
              <select
                value={localFilters.middle || ''}
                onChange={(e) =>
                  handleFilterChange({ ...localFilters, middle: e.target.value || undefined })
                }
                disabled={!localFilters.industry || middleCodes.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">전체</option>
                {middleCodes.map((code: string) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소분류
              </label>
              <select
                value={localFilters.small || ''}
                onChange={(e) =>
                  handleFilterChange({ ...localFilters, small: e.target.value || undefined })
                }
                disabled={!localFilters.middle || smallCodes.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">전체</option>
                {smallCodes.map((code: string) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                세분류
              </label>
              <select
                value={localFilters.jobCategory || ''}
                onChange={(e) =>
                  handleFilterChange({ ...localFilters, jobCategory: e.target.value || undefined })
                }
                disabled={!localFilters.small || subCodes.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">전체</option>
                {subCodes.map((code: string) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키워드 검색
              </label>
              <input
                type="text"
                value={localFilters.keyword || ''}
                onChange={(e) =>
                  handleFilterChange({
                    ...localFilters,
                    keyword: e.target.value.trim() || undefined,
                  })
                }
                placeholder="키워드를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>검색</span>
              </button>
              <button
                onClick={() => {
                  const emptyFilters: SearchFilters = { page: 1, limit: 20 }
                  handleFilterChange(emptyFilters)
                  setSearchFilters(emptyFilters) // 필터 초기화 후 검색 실행
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
              >
                초기화
              </button>
            </div>
          </div>
        )}

        {/* 우측 결과 리스트 */}
        <div className="flex-1 space-y-4">
          {filteredResults.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">검색 결과가 없습니다.</p>
            </div>
          ) : (
            filteredResults.map((abilityUnit) => (
              <div
                key={abilityUnit.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {abilityUnit.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      코드: {abilityUnit.code}
                    </p>
                    <p className="text-gray-700 mb-3">{abilityUnit.summary}</p>

                    {/* 수행준거 하이라이트 */}
                    {abilityUnit.performanceCriteria
                      .filter((pc) => pc.highlighted)
                      .map((pc) => (
                        <div
                          key={pc.id}
                          className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2"
                        >
                          <p className="text-sm text-gray-700">{pc.content}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetail(abilityUnit)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>상세보기</span>
                  </button>
                  {user?.role === 'guest' ? (
                    <button
                      disabled
                      className="flex items-center space-x-1 px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-60"
                      title="Guest 사용자는 선택목록 기능을 사용할 수 없습니다"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>선택목록 추가 (불가)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(abilityUnit)}
                      className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>선택목록 추가</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

