import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRecommendations, saveSelectionHistory, getStandardCodes } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function RecommendationPage() {
  const navigate = useNavigate()
  const { addToCart, recordSelection, user } = useStore()
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')

  // standard_codes에서 산업분야 목록 가져오기 (NCS 분류와 무관한 실제 산업분야)
  const {
    data: industries,
    loading: industriesLoading,
    error: industriesError,
    execute: loadIndustries,
  } = useAsync(() => getStandardCodes('industries'), { immediate: false })

  // standard_codes에서 부서 목록 가져오기 (NCS 분류와 무관한 실제 부서)
  const {
    data: departments,
    loading: departmentsLoading,
    error: departmentsError,
    execute: loadDepartments,
  } = useAsync(() => getStandardCodes('departments'), { immediate: false })
  
  const industriesList = industries || []
  const departmentsList = departments || []

  // 컴포넌트 마운트 시 목록 로드
  useEffect(() => {
    loadIndustries()
    loadDepartments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 추천 데이터 로드
  const {
    data: recommendations,
    loading,
    error,
    execute: executeSearch,
  } = useAsync(
    () =>
      getRecommendations(
        selectedIndustry || undefined,
        selectedDepartment || undefined
      ),
    { immediate: false }
  )

  // recommendations가 null이거나 undefined인 경우 빈 배열로 처리
  const recommendationsList = recommendations || []

  // 디버깅: 추천 데이터 확인
  useEffect(() => {
    console.log('추천 데이터 상태:', {
      recommendations,
      recommendationsList,
      loading,
      error: error?.message,
      hasData: !!recommendations,
      dataLength: recommendationsList.length
    })
  }, [recommendations, recommendationsList, loading, error])

  const handleSearch = () => {
    console.log('추천 검색 실행:', { industry: selectedIndustry, department: selectedDepartment })
    executeSearch()
  }

  const handleAddToCart = async (recommendation: any) => {
    addToCart(recommendation.abilityUnit)
    recordSelection(recommendation.abilityUnit.id)
    
    if (user) {
      try {
        // 우선순위: 1) abilityUnit의 정보, 2) 사용자가 선택한 정보
        const industry = recommendation.abilityUnit?.industry || selectedIndustry || undefined
        const department = recommendation.abilityUnit?.department || selectedDepartment || undefined
        
        console.log('선택 이력 저장 시도:', {
          userId: user.id,
          abilityUnitId: recommendation.abilityUnit.id,
          industry,
          department,
          abilityUnitIndustry: recommendation.abilityUnit?.industry,
          abilityUnitDepartment: recommendation.abilityUnit?.department,
          selectedIndustry,
          selectedDepartment,
        })
        
        await saveSelectionHistory(
          user.id, 
          recommendation.abilityUnit.id,
          industry,
          department
        )
      } catch (error) {
        console.error('선택 이력 저장 실패:', error)
      }
    }
    
    alert('선택목록에 추가되었습니다.')
  }

  const getReasonBadgeColor = (type: string) => {
    switch (type) {
      case 'mapping':
        return 'bg-blue-100 text-blue-800'
      case 'popular':
        return 'bg-green-100 text-green-800'
      case 'similar':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReasonLabel = (type: string) => {
    switch (type) {
      case 'mapping':
        return '매핑 기반'
      case 'popular':
        return '인기 기반'
      case 'similar':
        return '유사도 기반'
      default:
        return '추천'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          추천으로 시작하기
        </h1>
        <p className="text-lg text-gray-600">
          산업/부서별 추천 능력단위를 확인하세요
        </p>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              산업분야
              {industriesLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              disabled={industriesLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">전체</option>
              {industriesList.map((industry) => (
                <option key={industry.code} value={industry.name}>
                  {industry.name}
                </option>
              ))}
            </select>
            {industriesError && (
              <p className="text-sm text-red-600 mt-1">산업분야 목록을 불러오는 중 오류가 발생했습니다.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부서
              {departmentsLoading && <span className="text-gray-400 ml-2">(로딩 중...)</span>}
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={departmentsLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">전체</option>
              {departmentsList.map((dept) => (
                <option key={dept.code} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {departmentsError && (
              <p className="text-sm text-red-600 mt-1">부서 목록을 불러오는 중 오류가 발생했습니다.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '로딩 중...' : '추천 보기'}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error.message || '추천 조회 중 오류가 발생했습니다.'}
        />
      )}

      {/* 로딩 상태 */}
      {loading && <Loading message="추천을 불러오는 중..." />}

      {/* 추천 결과 */}
      {!loading && !error && recommendationsList.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              추천 능력단위 ({recommendationsList.length}개)
            </h2>
          </div>

          {recommendationsList.map((recommendation) => (
            <div
              key={recommendation.abilityUnit.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {recommendation.abilityUnit.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonBadgeColor(
                        recommendation.reasonType
                      )}`}
                    >
                      {getReasonLabel(recommendation.reasonType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    코드: {recommendation.abilityUnit.code}
                  </p>
                  <p className="text-gray-700 mb-3">
                    {recommendation.abilityUnit.summary}
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">추천 이유: </span>
                      {recommendation.reason}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/ability/${recommendation.abilityUnit.id}`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  상세보기
                </button>
                <button
                  onClick={() => handleAddToCart(recommendation)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>바로 담기</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error && recommendationsList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">
            {selectedIndustry || selectedDepartment
              ? '추천 결과가 없습니다. 다른 조건으로 검색해보세요.'
              : '산업/부서를 선택하고 추천 보기를 클릭하세요.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}

