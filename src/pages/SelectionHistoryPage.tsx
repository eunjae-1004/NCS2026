import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Save, X, CheckSquare, Square, Search, Filter } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getSelectionHistory, updateSelectionHistory, bulkUpdateSelectionHistory, getStandardCodes } from '../services/apiService'
import { useAsync } from '../hooks/useAsync'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import type { SelectionHistoryItem } from '../services/api'

export default function SelectionHistoryPage() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValues, setEditingValues] = useState<{
    industryCode?: string
    departmentCode?: string
    jobCode?: string
  }>({})
  const [bulkEditValues, setBulkEditValues] = useState<{
    industryCode?: string
    departmentCode?: string
    jobCode?: string
  }>({})
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [filters, setFilters] = useState<{
    industryCode?: string
    departmentCode?: string
    jobCode?: string
  }>({})

  // 표준 코드 목록 로드
  const { data: industries } = useAsync(() => getStandardCodes('industries'), { immediate: false })
  const { data: departments } = useAsync(() => getStandardCodes('departments'), { immediate: false })
  const { data: jobs } = useAsync(() => getStandardCodes('jobs'), { immediate: false })
  
  const industriesList = industries || []
  const departmentsList = departments || []
  const jobsList = jobs || []

  // 선택 이력 조회
  const {
    data: history,
    loading,
    error,
    execute: loadHistory,
  } = useAsync(
    () => {
      if (!user?.id) return Promise.resolve([])
      return getSelectionHistory(user.id, filters)
    },
    { immediate: false }
  )
  
  const historyList = history || []

  useEffect(() => {
    if (user?.id) {
      loadHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters])

  // 개별 수정 시작
  const handleStartEdit = (item: SelectionHistoryItem) => {
    setEditingId(item.id)
    setEditingValues({
      industryCode: item.industryCode || '',
      departmentCode: item.departmentCode || '',
      jobCode: item.jobCode || '',
    })
  }

  // 개별 수정 취소
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingValues({})
  }

  // 개별 수정 저장
  const handleSaveEdit = async (id: number) => {
    if (!user?.id) return

    try {
      await updateSelectionHistory(id, user.id, {
        industryCode: editingValues.industryCode || null,
        departmentCode: editingValues.departmentCode || null,
        jobCode: editingValues.jobCode || null,
      })
      setEditingId(null)
      setEditingValues({})
      loadHistory()
      alert('수정되었습니다.')
    } catch (error) {
      console.error('수정 실패:', error)
      alert(error instanceof Error ? error.message : '수정에 실패했습니다.')
    }
  }

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedIds.size === historyList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(historyList.map((item) => item.id)))
    }
  }

  // 개별 선택/해제
  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 일괄 수정 저장
  const handleBulkSave = async () => {
    if (!user?.id) return
    if (selectedIds.size === 0) {
      alert('수정할 항목을 선택해주세요.')
      return
    }

    try {
      await bulkUpdateSelectionHistory(user.id, {
        ids: Array.from(selectedIds),
        industryCode: bulkEditValues.industryCode || null,
        departmentCode: bulkEditValues.departmentCode || null,
        jobCode: bulkEditValues.jobCode || null,
      })
      setShowBulkEdit(false)
      setBulkEditValues({})
      setSelectedIds(new Set())
      loadHistory()
      alert(`${selectedIds.size}개 항목이 수정되었습니다.`)
    } catch (error) {
      console.error('일괄 수정 실패:', error)
      alert(error instanceof Error ? error.message : '일괄 수정에 실패했습니다.')
    }
  }

  // 필터 적용
  const handleApplyFilters = () => {
    loadHistory()
  }

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({})
    loadHistory()
  }

  if (!user || user.role === 'guest') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          선택 이력 관리 ({historyList.length}개)
        </h2>
        <button
          onClick={() => navigate('/cart')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
        >
          선택목록으로 이동
        </button>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">검색 필터</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              산업분야
            </label>
            <select
              value={filters.industryCode || ''}
              onChange={(e) =>
                setFilters({ ...filters, industryCode: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {industriesList.map((industry) => (
                <option key={industry.code} value={industry.code}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부서
            </label>
            <select
              value={filters.departmentCode || ''}
              onChange={(e) =>
                setFilters({ ...filters, departmentCode: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {departmentsList.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직무
            </label>
            <select
              value={filters.jobCode || ''}
              onChange={(e) =>
                setFilters({ ...filters, jobCode: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {jobsList.map((job) => (
                <option key={job.code} value={job.code}>
                  {job.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleApplyFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Search className="w-4 h-4" />
            <span>검색</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error.message || '이력 조회 중 오류가 발생했습니다.'}
        />
      )}

      {/* 로딩 상태 */}
      {loading && <Loading message="이력을 불러오는 중..." />}

      {/* 일괄 수정 영역 */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-blue-900">
              {selectedIds.size}개 항목 선택됨
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkEdit(!showBulkEdit)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                <span>일괄 수정</span>
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                선택 해제
              </button>
            </div>
          </div>
          {showBulkEdit && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  산업분야
                </label>
                <select
                  value={bulkEditValues.industryCode || ''}
                  onChange={(e) =>
                    setBulkEditValues({
                      ...bulkEditValues,
                      industryCode: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">변경 안 함</option>
                  {industriesList.map((industry) => (
                    <option key={industry.code} value={industry.code}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  부서
                </label>
                <select
                  value={bulkEditValues.departmentCode || ''}
                  onChange={(e) =>
                    setBulkEditValues({
                      ...bulkEditValues,
                      departmentCode: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">변경 안 함</option>
                  {departmentsList.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직무
                </label>
                <select
                  value={bulkEditValues.jobCode || ''}
                  onChange={(e) =>
                    setBulkEditValues({
                      ...bulkEditValues,
                      jobCode: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">변경 안 함</option>
                  {jobsList.map((job) => (
                    <option key={job.code} value={job.code}>
                      {job.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {showBulkEdit && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleBulkSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <Save className="w-4 h-4" />
                <span>저장</span>
              </button>
              <button
                onClick={() => {
                  setShowBulkEdit(false)
                  setBulkEditValues({})
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}

      {/* 테이블 */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={handleSelectAll}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {selectedIds.size === historyList.length && historyList.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    능력단위 코드
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    능력단위명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    산업분야
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    부서
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    직무
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    선택일시
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      선택 이력이 없습니다.
                    </td>
                  </tr>
                ) : (
                  historyList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {selectedIds.has(item.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.unitCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.unitName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingId === item.id ? (
                          <select
                            value={editingValues.industryCode || ''}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                industryCode: e.target.value || undefined,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">선택 안 함</option>
                            {industriesList.map((industry) => (
                              <option key={industry.code} value={industry.code}>
                                {industry.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={item.industryName ? 'text-gray-900' : 'text-gray-400'}>
                            {item.industryName || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingId === item.id ? (
                          <select
                            value={editingValues.departmentCode || ''}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                departmentCode: e.target.value || undefined,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">선택 안 함</option>
                            {departmentsList.map((dept) => (
                              <option key={dept.code} value={dept.code}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={item.departmentName ? 'text-gray-900' : 'text-gray-400'}>
                            {item.departmentName || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingId === item.id ? (
                          <select
                            value={editingValues.jobCode || ''}
                            onChange={(e) =>
                              setEditingValues({
                                ...editingValues,
                                jobCode: e.target.value || undefined,
                              })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">선택 안 함</option>
                            {jobsList.map((job) => (
                              <option key={job.code} value={job.code}>
                                {job.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={item.jobName ? 'text-gray-900' : 'text-gray-400'}>
                            {item.jobName || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(item.selectedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingId === item.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
