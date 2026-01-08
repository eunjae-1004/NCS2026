import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ClipboardList, ArrowLeft, Tag, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getAbilityUnitById, saveSelectionHistory, searchAbilityUnits } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function AbilityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart, addMultipleToCart, recordSelection, user } = useStore()
  const [showCartMenu, setShowCartMenu] = useState(false)

  // 능력단위 데이터 로드
  const {
    data: abilityUnit,
    loading,
    error,
  } = useAsync(() => {
    if (!id) throw new Error('능력단위 ID가 없습니다.')
    return getAbilityUnitById(id)
  }, { immediate: true })

  // 페이지 로드 시 선택 이력 기록
  useEffect(() => {
    if (abilityUnit && user) {
      recordSelection(abilityUnit.id)
      // abilityUnit의 산업분야/부서 정보를 함께 전달
      console.log('선택 이력 저장 시도 (AbilityDetailPage - useEffect):', {
        userId: user.id,
        abilityUnitId: abilityUnit.id,
        industry: abilityUnit.industry,
        department: abilityUnit.department,
        abilityUnitKeys: Object.keys(abilityUnit),
      })
      
      saveSelectionHistory(
        user.id, 
        abilityUnit.id,
        abilityUnit.industry,
        abilityUnit.department
      ).catch((error) => {
        console.error('선택 이력 저장 실패:', error)
      })
    }
  }, [abilityUnit, user, recordSelection])

  const handleAddToCart = async () => {
    if (!abilityUnit) return
    
    try {
      await addToCart(abilityUnit)
      recordSelection(abilityUnit.id)
      
      if (user) {
        try {
          // abilityUnit의 산업분야/부서 정보를 함께 전달
          console.log('선택 이력 저장 시도 (AbilityDetailPage - handleAddToCart):', {
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
      
      setShowCartMenu(false)
      alert('선택목록에 추가되었습니다.')
    } catch (error) {
      console.error('선택목록 추가 실패:', error)
      alert(error instanceof Error ? error.message : '선택목록 추가에 실패했습니다.')
    }
  }

  // 세분류 전체 선택 핸들러
  const handleAddAllByCategory = async () => {
    console.log('세분류 전체 선택 - abilityUnit:', abilityUnit)
    console.log('세분류 전체 선택 - smallCategoryCode:', abilityUnit?.smallCategoryCode)
    console.log('세분류 전체 선택 - subCategoryCode:', abilityUnit?.subCategoryCode)
    console.log('세분류 전체 선택 - unit_code:', abilityUnit?.code)
    
    if (!abilityUnit || !abilityUnit.subCategoryCode) {
      console.error('sub_category_code가 없습니다:', {
        hasAbilityUnit: !!abilityUnit,
        subCategoryCode: abilityUnit?.subCategoryCode,
        smallCategoryCode: abilityUnit?.smallCategoryCode,
        unit_code: abilityUnit?.code,
      })
      alert(`소분류 코드 정보가 없습니다.\nunit_code: ${abilityUnit?.code || '없음'}\nsub_category_code: ${abilityUnit?.subCategoryCode || '없음'}`)
      return
    }

    try {
      // 같은 sub_category_code의 모든 능력단위 검색
      const searchFilters = {
        subCategoryCode: abilityUnit.subCategoryCode, // sub_category_code 사용 (예: 14010201)
        limit: 1000, // 최대 1000개까지 가져오기
      }
      console.log('검색 필터 (subCategoryCode 기준):', searchFilters)
      
      const result = await searchAbilityUnits(searchFilters)
      console.log('검색 결과:', result)

      if (result.data.length === 0) {
        alert('해당 세분류의 능력단위를 찾을 수 없습니다.')
        return
      }

      // 선택목록에 추가
      addMultipleToCart(result.data)

      // 선택 이력 저장 (능력단위의 산업분야/부서 정보 포함)
      if (user) {
        for (const unit of result.data) {
          try {
            recordSelection(unit.id)
            await saveSelectionHistory(
              user.id, 
              unit.id,
              unit.industry,
              unit.department
            )
          } catch (error) {
            console.error('선택 이력 저장 실패:', error)
          }
        }
      }

      setShowCartMenu(false)
      alert(`${result.data.length}개의 능력단위가 선택목록에 추가되었습니다.`)
    } catch (error) {
      console.error('세분류 전체 선택 오류:', error)
      alert('세분류 전체 선택 중 오류가 발생했습니다.')
    }
  }

  const handleViewSimilar = () => {
    if (!abilityUnit) return
    // 유사 능력단위 검색 (같은 부서, 유사한 레벨 등)
    navigate(`/results?department=${abilityUnit.department}&level=${abilityUnit.level}`)
  }

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.cart-menu-container')) {
        setShowCartMenu(false)
      }
    }

    if (showCartMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showCartMenu])

  if (loading) {
    return <Loading message="능력단위 정보를 불러오는 중..." />
  }

  if (error || !abilityUnit) {
    return (
      <div className="max-w-5xl mx-auto">
        <ErrorMessage
          message={error?.message || '능력단위를 찾을 수 없습니다.'}
        />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>뒤로가기</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 헤더 */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {abilityUnit.name}
              </h1>
              <p className="text-lg text-gray-500">코드: {abilityUnit.code}</p>
            </div>
            <div className="relative cart-menu-container">
              <button
                onClick={() => setShowCartMenu(!showCartMenu)}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <ClipboardList className="w-5 h-5" />
                <span>선택목록 추가</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCartMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={handleAddToCart}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-4 h-4" />
                        <span>현재 항목만 추가</span>
                      </div>
                    </button>
                    <button
                      onClick={handleAddAllByCategory}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <ClipboardList className="w-4 h-4" />
                        <span>세분류 전체 선택</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-6">
                        {abilityUnit.subCategoryCode
                          ? `코드: ${abilityUnit.subCategoryCode}` 
                          : abilityUnit.smallCategoryCode
                          ? `코드: ${abilityUnit.smallCategoryCode}`
                          : abilityUnit.jobCategory || '소분류'}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-700 text-lg">{abilityUnit.summary}</p>
        </div>

        {/* 능력단위 정의 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">능력단위 정의</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 leading-relaxed">
              {abilityUnit.definition}
            </p>
          </div>
        </section>

        {/* 능력단위 요소 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">능력단위 요소</h2>
          <div className="space-y-4">
            {abilityUnit.elements.map((element) => (
              <div
                key={element.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {element.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      코드: {element.code}
                    </p>
                    <p className="text-gray-700">{element.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 수행준거 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">수행준거</h2>
          <div className="space-y-2">
            {abilityUnit.performanceCriteria.map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-blue-600 font-semibold mt-1">
                  {criterion.id}.
                </span>
                <p className="text-gray-700 flex-1">{criterion.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 지식/기술/태도 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            지식/기술/태도 (K/S/A)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-blue-600">
                지식 (Knowledge)
              </h3>
              <ul className="space-y-2">
                {abilityUnit.knowledge.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-gray-700"
                  >
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-green-600">
                기술 (Skills)
              </h3>
              <ul className="space-y-2">
                {abilityUnit.skills.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-gray-700"
                  >
                    <span className="text-green-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-purple-600">
                태도 (Attitudes)
              </h3>
              <ul className="space-y-2">
                {abilityUnit.attitudes.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start space-x-2 text-gray-700"
                  >
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 관련 키워드/태그 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            관련 키워드/태그
          </h2>
          <div className="flex flex-wrap gap-2">
            {abilityUnit.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                <span>{keyword}</span>
              </span>
            ))}
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className="flex space-x-4 pt-6 border-t">
          <button
            onClick={handleViewSimilar}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            유사 능력단위 보기
          </button>
          <div className="relative cart-menu-container">
            {user?.role === 'guest' ? (
              <div className="px-6 py-3 bg-gray-400 text-white rounded-md cursor-not-allowed flex items-center space-x-2 opacity-60">
                <ClipboardList className="w-5 h-5" />
                <span>선택목록 추가 (Guest 불가)</span>
              </div>
            ) : (
              <button
                onClick={() => setShowCartMenu(!showCartMenu)}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center space-x-2"
              >
                <ClipboardList className="w-5 h-5" />
                <span>선택목록 추가</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
            {showCartMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={handleAddToCart}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>현재 항목만 추가</span>
                    </div>
                  </button>
                  <button
                    onClick={handleAddAllByCategory}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="w-4 h-4" />
                      <span>세분류 전체 선택</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-6">
                      {abilityUnit.subCategoryCode
                        ? `코드: ${abilityUnit.subCategoryCode}` 
                        : abilityUnit.smallCategoryCode
                        ? `코드: ${abilityUnit.smallCategoryCode}`
                        : abilityUnit.jobCategory || '소분류'}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

