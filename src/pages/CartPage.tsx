import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Download, Save, Eye, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import * as XLSX from 'xlsx'

export default function CartPage() {
  const navigate = useNavigate()
  const {
    cart,
    removeFromCart,
    updateCartMemo,
    clearCart,
    saveCartSet,
    cartSets,
    loadCartSet,
    deleteCartSet,
    loadCartSets,
    loadCart,
    user,
  } = useStore()
  const [editingMemo, setEditingMemo] = useState<Record<string, boolean>>({})
  const [memoValues, setMemoValues] = useState<Record<string, string>>({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [setName, setSetName] = useState('')
  const [loading, setLoading] = useState(false)

  // 페이지 로드 시 세트 목록 불러오기 (Guest 제외)
  useEffect(() => {
    if (user && user.role !== 'guest') {
      loadCartSets().catch((error) => {
        console.error('세트 목록 로드 실패:', error)
      })
      // 선택목록도 다시 불러오기 (혹시 모를 동기화 문제 대비)
      loadCart().catch((error) => {
        console.error('선택목록 로드 실패:', error)
      })
    }
  }, [user, loadCartSets, loadCart])

  const handleDownloadExcel = () => {
    if (cart.length === 0) {
      alert('선택목록이 비어있습니다.')
      return
    }

    // 엑셀 데이터 준비
    const data = cart.map((item) => ({
      코드: item.abilityUnit.code,
      능력단위명: item.abilityUnit.name,
      요약: item.abilityUnit.summary,
      정의: item.abilityUnit.definition,
      산업: item.abilityUnit.industry || '',
      부서: item.abilityUnit.department || '',
      직무: item.abilityUnit.jobCategory || '',
      레벨: item.abilityUnit.level || '',
      메모: item.memo || '',
      추가일시: item.addedAt.toLocaleString('ko-KR'),
    }))

    // 워크북 생성
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '능력단위 목록')

    // 파일 다운로드
    XLSX.writeFile(wb, `NCS_능력단위_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleSaveSet = async () => {
    if (!setName.trim()) {
      alert('세트 이름을 입력해주세요.')
      return
    }
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    try {
      await saveCartSet(setName)
      setSetName('')
      setShowSaveDialog(false)
      alert('세트가 저장되었습니다.')
    } catch (error) {
      console.error('세트 저장 실패:', error)
      alert(error instanceof Error ? error.message : '세트 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSet = async (setId: string) => {
    if (cart.length > 0 && !confirm('현재 선택목록이 비워집니다. 계속하시겠습니까?')) {
      return
    }
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    try {
      await loadCartSet(setId)
      alert('세트가 로드되었습니다.')
    } catch (error) {
      console.error('세트 로드 실패:', error)
      alert(error instanceof Error ? error.message : '세트 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('세트를 삭제하시겠습니까?')) {
      return
    }
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    try {
      await deleteCartSet(setId)
      alert('세트가 삭제되었습니다.')
    } catch (error) {
      console.error('세트 삭제 실패:', error)
      alert(error instanceof Error ? error.message : '세트 삭제에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // Guest 사용자 체크
  if (user?.role === 'guest') {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">선택목록</h2>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 mb-6">
            <p className="text-yellow-800 font-medium mb-2">
              Guest 사용자는 선택목록 기능을 사용할 수 없습니다.
            </p>
            <p className="text-yellow-700 text-sm">
              선택목록, 세트 저장 등 기능을 사용하려면 회원가입이 필요합니다.
            </p>
          </div>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              회원가입 / 로그인
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              검색하러 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">선택목록</h2>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">선택목록이 비어있습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            검색하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          선택목록 ({cart.length}개)
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Save className="w-5 h-5" />
            <span>세트 저장</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            <span>엑셀 다운로드</span>
          </button>
                 <button
                   onClick={async () => {
                     if (confirm('선택목록을 비우시겠습니까?')) {
                       try {
                         await clearCart()
                         alert('선택목록이 비워졌습니다.')
                       } catch (error) {
                         console.error('선택목록 삭제 실패:', error)
                         alert(error instanceof Error ? error.message : '선택목록 삭제에 실패했습니다.')
                       }
                     }
                   }}
                   className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                 >
                   <Trash2 className="w-5 h-5" />
                   <span>전체 삭제</span>
                 </button>
        </div>
      </div>

      {/* 저장된 세트 목록 */}
      {cartSets.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">저장된 세트</h3>
          <div className="flex flex-wrap gap-2">
            {cartSets.map((set) => (
              <div
                key={set.id}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md"
              >
                      <button
                        onClick={() => handleLoadSet(set.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        {set.name} ({'itemsCount' in set ? (set as any).itemsCount : 'items' in set ? (set as any).items.length : 0}개)
                      </button>
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택목록 아이템 목록 */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.abilityUnit.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.abilityUnit.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  코드: {item.abilityUnit.code}
                </p>
                <p className="text-gray-700 mb-3">{item.abilityUnit.summary}</p>
              </div>
                     <button
                       onClick={async () => {
                         try {
                           await removeFromCart(item.abilityUnit.id)
                         } catch (error) {
                           console.error('선택목록 삭제 실패:', error)
                           alert(error instanceof Error ? error.message : '선택목록 삭제에 실패했습니다.')
                         }
                       }}
                       className="ml-4 text-red-600 hover:text-red-800 transition"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
            </div>

            {/* 메모 영역 */}
            <div className="border-t pt-4">
              {editingMemo[item.abilityUnit.id] ? (
                <div className="space-y-2">
                  <textarea
                    value={memoValues[item.abilityUnit.id] || item.memo || ''}
                    onChange={(e) =>
                      setMemoValues({
                        ...memoValues,
                        [item.abilityUnit.id]: e.target.value,
                      })
                    }
                    placeholder="왜 선택했는지 메모를 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          await updateCartMemo(
                            item.abilityUnit.id,
                            memoValues[item.abilityUnit.id] || ''
                          )
                          setEditingMemo({
                            ...editingMemo,
                            [item.abilityUnit.id]: false,
                          })
                        } catch (error) {
                          console.error('메모 저장 실패:', error)
                          alert(error instanceof Error ? error.message : '메모 저장에 실패했습니다.')
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setEditingMemo({
                          ...editingMemo,
                          [item.abilityUnit.id]: false,
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">메모</p>
                      <p className="text-gray-600">
                        {item.memo || '메모가 없습니다.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingMemo({
                          ...editingMemo,
                          [item.abilityUnit.id]: true,
                        })
                        setMemoValues({
                          ...memoValues,
                          [item.abilityUnit.id]: item.memo || '',
                        })
                      }}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {item.memo ? '수정' : '추가'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate(`/ability/${item.abilityUnit.id}`)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition"
              >
                <Eye className="w-4 h-4" />
                <span>상세보기</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 세트 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">세트 저장</h3>
            <input
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="예: 품질팀_검사업무_신입"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveSet}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSetName('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


