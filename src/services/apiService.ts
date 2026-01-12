// API 서비스 래퍼
// 실제 API가 준비되면 mockData 대신 실제 API를 호출하도록 변경

import * as api from './api'
import {
  mockAbilityUnits,
  mockRecommendations,
  mockOrganizations,
  mockStandardCodes,
  getMockAliasMapping,
} from './mockData'
import type {
  AbilityUnit,
  SearchFilters,
  AliasMapping,
  Recommendation,
  Organization,
  PaginationMeta,
  CartSet,
  CartItem,
  User,
} from '../types'

// 개발 모드 확인 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// 능력단위 검색 (페이지네이션 포함)
export interface SearchResult {
  data: AbilityUnit[]
  pagination?: PaginationMeta
}

export async function searchAbilityUnits(
  filters: SearchFilters
): Promise<SearchResult> {
  if (USE_MOCK_DATA) {
    // Mock 데이터 필터링
    let results = [...mockAbilityUnits]

    if (filters.industry) {
      results = results.filter((r) => r.industry === filters.industry)
    }
    if (filters.department) {
      results = results.filter((r) => r.department === filters.department)
    }
    if (filters.jobCategory) {
      results = results.filter((r) => r.jobCategory === filters.jobCategory)
    }
    if (filters.level) {
      results = results.filter((r) => r.level === filters.level)
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          r.summary.toLowerCase().includes(keyword) ||
          r.keywords.some((k) => k.toLowerCase().includes(keyword))
      )
    }

    // 페이지네이션 처리
    const page = filters.page || 1
    const limit = filters.limit || 20
    const total = results.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedResults = results.slice(startIndex, endIndex)

    // 시뮬레이션을 위한 약간의 지연
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    return {
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  console.log('API 호출 - 필터:', filters)
  const response = await api.searchAbilityUnits(filters)
  console.log('API 응답 (전체):', JSON.stringify(response, null, 2))
  
  if (response.success && response.data) {
    // 백엔드 응답 구조: { success: true, data: { data: [...], pagination: {...} } }
    // 또는 { success: true, data: [...], pagination: {...} }
    const responseData = response.data
    
    // 응답 구조 확인
    if (Array.isArray(responseData)) {
      // data가 배열인 경우 (pagination은 별도 필드)
      console.log('응답 데이터가 배열입니다. 길이:', responseData.length)
      return {
        data: responseData,
        pagination: (response as any).pagination,
      }
    } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      // data가 { data: [...], pagination: {...} } 형태인 경우
      console.log('응답 데이터가 객체입니다. data 길이:', responseData.data?.length || 0)
      return {
        data: responseData.data || [],
        pagination: responseData.pagination,
      }
    } else {
      console.error('예상치 못한 응답 구조:', responseData)
      return {
        data: [],
        pagination: undefined,
      }
    }
  }
  
  console.error('검색 실패:', response)
  throw new Error(response.error || '검색에 실패했습니다.')
}

// 능력단위 상세 조회
export async function getAbilityUnitById(id: string): Promise<AbilityUnit> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const unit = mockAbilityUnits.find((u) => u.id === id)
    if (!unit) {
      throw new Error('능력단위를 찾을 수 없습니다.')
    }
    return unit
  }

  const response = await api.getAbilityUnitById(id)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '조회에 실패했습니다.')
}

// 별칭 매핑
export async function mapAlias(
  input: string,
  type: 'department' | 'industry' | 'job'
): Promise<AliasMapping> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return getMockAliasMapping(input, type)
  }

  const response = await api.mapAlias(input, type)
  console.log('API 응답 (전체):', response)
  console.log('API 응답 구조:', {
    success: response.success,
    hasData: !!response.data,
    dataType: typeof response.data,
    dataKeys: response.data ? Object.keys(response.data) : []
  })
  
  if (response.success && response.data) {
    const mapping = response.data
    console.log('반환할 매핑 데이터:', mapping)
    console.log('매핑 데이터 검증:', {
      hasInput: 'input' in mapping,
      hasStandard: 'standard' in mapping,
      hasConfidence: 'confidence' in mapping,
      hasCandidates: 'candidates' in mapping,
      input: mapping.input,
      standard: mapping.standard,
      confidence: mapping.confidence,
      candidates: mapping.candidates
    })
    return mapping
  }
  
  console.error('매핑 실패:', response)
  throw new Error(response.error || '매핑에 실패했습니다.')
}

// 추천 능력단위 조회
export async function getRecommendations(
  industry?: string,
  department?: string
): Promise<Recommendation[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    let results = [...mockRecommendations]

    if (industry) {
      results = results.filter((r) => r.abilityUnit.industry === industry)
    }
    if (department) {
      results = results.filter(
        (r) => r.abilityUnit.department === department
      )
    }

    return results
  }

  console.log('추천 API 호출:', { industry, department })
  const response = await api.getRecommendations(industry, department)
  console.log('추천 API 응답:', response)
  
  if (response.success && response.data) {
    console.log('추천 데이터:', response.data)
    return response.data
  }
  
  console.error('추천 조회 실패:', response.error)
  throw new Error(response.error || '추천 조회에 실패했습니다.')
}

// 유사 능력단위 조회
export async function getSimilarAbilityUnits(
  abilityUnitId: string
): Promise<AbilityUnit[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const unit = mockAbilityUnits.find((u) => u.id === abilityUnitId)
    if (!unit) {
      return []
    }

    // 같은 부서나 산업의 다른 능력단위 반환
    return mockAbilityUnits.filter(
      (u) =>
        u.id !== abilityUnitId &&
        (u.department === unit.department || u.industry === unit.industry)
    )
  }

  const response = await api.getSimilarAbilityUnits(abilityUnitId)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '유사 능력단위 조회에 실패했습니다.')
}

// 선택 이력 저장
export async function saveSelectionHistory(
  userId: string,
  abilityUnitId: string,
  industry?: string,
  department?: string,
  job?: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    // Mock 모드에서는 로컬 스토리지에 저장
    const key = `selection_history_${userId}`
    const history = JSON.parse(localStorage.getItem(key) || '[]')
    history.push({
      abilityUnitId,
      industry,
      department,
      job,
      selectedAt: new Date().toISOString(),
    })
    localStorage.setItem(key, JSON.stringify(history))
    return
  }

  // apiService에서 호출 전 파라미터 확인
  console.log('=== apiService.saveSelectionHistory 호출 ===')
  console.log('받은 파라미터:', {
    userId,
    abilityUnitId,
    industry,
    department,
    job,
    industryType: typeof industry,
    departmentType: typeof department,
    industryIsUndefined: industry === undefined,
    departmentIsUndefined: department === undefined,
    industryIsNull: industry === null,
    departmentIsNull: department === null,
  })
  
  const response = await api.saveSelectionHistory(userId, abilityUnitId, industry, department, job)
  if (!response.success) {
    throw new Error(response.error || '이력 저장에 실패했습니다.')
  }
}

// 선택 이력 조회 (필터링 지원)
export async function getSelectionHistory(
  userId: string,
  filters?: {
    industryCode?: string
    departmentCode?: string
    jobCode?: string
  }
): Promise<api.SelectionHistoryItem[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return []
  }

  const response = await api.getUserSelectionHistory(userId, filters)
  if (response.success && response.data) {
    return response.data.map((item) => ({
      ...item,
      selectedAt: new Date(item.selectedAt),
    }))
  }
  return []
}

// 선택 이력 수정 (개별)
export async function updateSelectionHistory(
  id: number,
  userId: string,
  updates: {
    industryCode?: string | null
    departmentCode?: string | null
    jobCode?: string | null
  }
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.updateSelectionHistory(id, userId, updates)
  if (!response.success) {
    throw new Error(response.error || '이력 수정에 실패했습니다.')
  }
}

// 선택 이력 일괄 수정 (다중/전체)
export async function bulkUpdateSelectionHistory(
  userId: string,
  updates: {
    ids?: number[]
    industryCode?: string | null
    departmentCode?: string | null
    jobCode?: string | null
  }
): Promise<{ updatedCount: number }> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { updatedCount: 0 }
  }

  const response = await api.bulkUpdateSelectionHistory(userId, updates)
  if (response.success && response.data) {
    return { updatedCount: response.data.updatedCount }
  }
  throw new Error(response.error || '이력 일괄 수정에 실패했습니다.')
}

// 기관 목록 조회
export async function getOrganizations(): Promise<Organization[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockOrganizations
  }

  const response = await api.getOrganizations()
  if (response.success && response.data) {
    return response.data
  }
  return []
}

// 표준 코드 조회
export async function getStandardCodes(
  type: 'departments' | 'industries' | 'jobs'
): Promise<string[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockStandardCodes[type]
  }

  const response = await api.getStandardCodes(type)
  if (response.success && response.data) {
    return response.data
  }
  return []
}

// 4단계 계층구조 목록 조회
export interface HierarchicalData {
  major: string
  middles: Array<{
    name: string
    smalls: Array<{
      name: string
      subs: string[]
    }>
  }>
}

export async function getHierarchicalCodes(): Promise<HierarchicalData[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return []
  }

  const response = await api.getHierarchicalCodes()
  if (response.success && response.data) {
    return response.data
  }
  return []
}

// 단계별 카테고리 목록 조회
export async function getCategoryList(
  level: 'major' | 'middle' | 'small' | 'sub',
  parent?: string
): Promise<string[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return []
  }

  const response = await api.getCategoryList(level, parent)
  if (response.success && response.data) {
    return response.data
  }
  return []
}

// 세트 저장
export async function saveCartSet(
  userId: string,
  name: string,
  items: CartItem[]
): Promise<CartSet> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    // Mock 데이터는 메모리에만 저장 (실제로는 DB에 저장)
    return {
      id: Date.now().toString(),
      name,
      items,
      createdAt: new Date(),
    }
  }

  const response = await api.saveCartSet(userId, name, items)
  if (response.success && response.data) {
    // API 응답에는 items가 없을 수 있으므로, 전달받은 items를 포함
    return {
      ...response.data,
      items,
      createdAt: response.data.createdAt
        ? new Date(response.data.createdAt)
        : new Date(),
    }
  }
  throw new Error(response.error || '세트 저장에 실패했습니다.')
}

// 사용자별 세트 목록 조회
export async function getCartSets(
  userId: string
): Promise<Omit<CartSet, 'items'>[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return []
  }

  const response = await api.getCartSets(userId)
  if (response.success && response.data) {
    return response.data.map((set) => ({
      ...set,
      createdAt: new Date(set.createdAt),
    }))
  }
  return []
}

// 세트 상세 조회 (아이템 포함)
export async function getCartSetById(
  setId: string,
  userId: string
): Promise<CartSet> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    throw new Error('Mock 데이터 모드에서는 세트 상세 조회를 지원하지 않습니다.')
  }

  const response = await api.getCartSetById(setId, userId)
  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      items: response.data.items.map((item) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      })),
    }
  }
  throw new Error(response.error || '세트 조회에 실패했습니다.')
}

// 세트 삭제
export async function deleteCartSet(
  setId: string,
  userId: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.deleteCartSet(setId, userId)
  if (!response.success) {
    throw new Error(response.error || '세트 삭제에 실패했습니다.')
  }
}

// 선택목록 조회
export async function getCart(userId: string): Promise<CartItem[]> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return []
  }

  const response = await api.getCart(userId)
  if (response.success && response.data) {
    return response.data.map((item) => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }))
  }
  return []
}

// 선택목록 아이템 추가
export async function addCartItem(
  userId: string,
  unitCode: string,
  memo?: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.addCartItem(userId, unitCode, memo)
  if (!response.success) {
    throw new Error(response.error || '선택목록 추가에 실패했습니다.')
  }
}

// 선택목록 아이템 여러 개 추가
export async function addMultipleCartItems(
  userId: string,
  items: CartItem[]
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.addMultipleCartItems(userId, items)
  if (!response.success) {
    throw new Error(response.error || '선택목록 추가에 실패했습니다.')
  }
}

// 선택목록 아이템 삭제
export async function removeCartItem(
  unitCode: string,
  userId: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.removeCartItem(unitCode, userId)
  if (!response.success) {
    throw new Error(response.error || '선택목록 삭제에 실패했습니다.')
  }
}

// 선택목록 메모 업데이트
export async function updateCartItemMemo(
  unitCode: string,
  userId: string,
  memo: string
): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.updateCartItemMemo(unitCode, userId, memo)
  if (!response.success) {
    throw new Error(response.error || '메모 업데이트에 실패했습니다.')
  }
}

// 선택목록 전체 삭제
export async function clearCart(userId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return
  }

  const response = await api.clearCart(userId)
  if (!response.success) {
    throw new Error(response.error || '선택목록 삭제에 실패했습니다.')
  }
}

// 회원가입
export async function register(
  email: string,
  password: string,
  name: string,
  organizationId?: string,
  industryCode?: string,
  departmentCode?: string,
  jobCode?: string
): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return {
      id: `user_${Date.now()}`,
      email,
      name,
      role: 'user',
      industryCode,
      departmentCode,
      jobCode,
    }
  }

  const response = await api.register(email, password, name, organizationId, industryCode, departmentCode, jobCode)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '회원가입에 실패했습니다.')
}

// 로그인
export async function login(email: string, password: string): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return {
      id: `user_${Date.now()}`,
      email,
      name: '사용자',
      role: 'user',
    }
  }

  const response = await api.login(email, password)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '로그인에 실패했습니다.')
}

// Guest 로그인
export async function loginAsGuest(name?: string): Promise<User> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return {
      id: `guest_${Date.now()}`,
      name: name || '게스트',
      role: 'guest',
    }
  }

  const response = await api.loginAsGuest(name)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Guest 로그인에 실패했습니다.')
}


