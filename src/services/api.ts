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

// API 기본 URL (환경 변수로 관리)
// 기본값: 프로덕션 배포 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ncssearch-backend-production.up.railway.app/api'

// API 응답 타입
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// HTTP 클라이언트
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      // 에러 응답의 본문을 읽어서 상세한 에러 메시지 가져오기
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData && errorData.error) {
          errorMessage = errorData.error
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
        console.error('에러 응답 파싱 실패:', e)
      }
      throw new Error(errorMessage)
    }

    const jsonData = await response.json()
    console.log('fetchApi 원본 응답:', jsonData)
    
    // API 응답이 이미 {success, data} 형태인 경우
    if (jsonData && typeof jsonData === 'object' && 'success' in jsonData && 'data' in jsonData) {
      console.log('이미 {success, data} 형태 - 그대로 반환')
      return jsonData as ApiResponse<T>
    }
    
    // API 응답이 직접 데이터인 경우
    console.log('데이터만 있음 - {success, data}로 감싸기')
    return { success: true, data: jsonData as T }
  } catch (error) {
    console.error('fetchApi 오류:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// 능력단위 검색 API
export interface SearchResponse {
  data: AbilityUnit[]
  pagination?: PaginationMeta
}

export async function searchAbilityUnits(
  filters: SearchFilters
): Promise<ApiResponse<SearchResponse>> {
  const queryParams = new URLSearchParams()
  
  if (filters.industry) queryParams.append('industry', filters.industry)
  if (filters.middle) queryParams.append('middle', filters.middle)
  if (filters.small) queryParams.append('small', filters.small)
  if (filters.department) queryParams.append('department', filters.department)
  if (filters.jobCategory) queryParams.append('jobCategory', filters.jobCategory)
  if (filters.jobTitle) queryParams.append('jobTitle', filters.jobTitle)
  if (filters.level) queryParams.append('level', filters.level.toString())
  if (filters.keyword) queryParams.append('keyword', filters.keyword)
  if (filters.subCategoryCode) queryParams.append('subCategoryCode', filters.subCategoryCode)
  if (filters.smallCategoryCode) queryParams.append('smallCategoryCode', filters.smallCategoryCode)
  if (filters.page) queryParams.append('page', filters.page.toString())
  if (filters.limit) queryParams.append('limit', filters.limit.toString())

  const url = `/ability-units?${queryParams.toString()}`
  console.log('API 요청 URL:', url)
  console.log('API 요청 필터:', filters)
  
  return fetchApi<SearchResponse>(url)
}

// 능력단위 상세 조회 API
export async function getAbilityUnitById(
  id: string
): Promise<ApiResponse<AbilityUnit>> {
  return fetchApi<AbilityUnit>(`/ability-units/${id}`)
}

// 별칭 매핑 API
export async function mapAlias(
  input: string,
  type: 'department' | 'industry' | 'job'
): Promise<ApiResponse<AliasMapping>> {
  return fetchApi<AliasMapping>('/alias/map', {
    method: 'POST',
    body: JSON.stringify({ input, type }),
  })
}

// 추천 능력단위 조회 API
export async function getRecommendations(
  industry?: string,
  department?: string
): Promise<ApiResponse<Recommendation[]>> {
  const queryParams = new URLSearchParams()
  if (industry) queryParams.append('industry', industry)
  if (department) queryParams.append('department', department)

  return fetchApi<Recommendation[]>(
    `/recommendations?${queryParams.toString()}`
  )
}

// 유사 능력단위 조회 API
export async function getSimilarAbilityUnits(
  abilityUnitId: string
): Promise<ApiResponse<AbilityUnit[]>> {
  return fetchApi<AbilityUnit[]>(`/ability-units/${abilityUnitId}/similar`)
}

// 선택 이력 저장 API
export async function saveSelectionHistory(
  userId: string,
  abilityUnitId: string,
  industry?: string,
  department?: string,
  job?: string
): Promise<ApiResponse<void>> {
  // 실제 전송되는 데이터 로그
  const requestBody = { 
    userId, 
    abilityUnitId,
    industry,
    department,
    job
  }
  
  console.log('=== API 호출: saveSelectionHistory ===')
  console.log('전송할 데이터:', JSON.stringify(requestBody, null, 2))
  console.log('각 필드 상세:')
  console.log('  - userId:', userId, '(type:', typeof userId, ')')
  console.log('  - abilityUnitId:', abilityUnitId, '(type:', typeof abilityUnitId, ')')
  console.log('  - industry:', industry, '(type:', typeof industry, ', isUndefined:', industry === undefined, ', isNull:', industry === null, ', isEmpty:', industry === '')
  console.log('  - department:', department, '(type:', typeof department, ', isUndefined:', department === undefined, ', isNull:', department === null, ', isEmpty:', department === '')
  console.log('  - job:', job, '(type:', typeof job, ', isUndefined:', job === undefined, ', isNull:', job === null, ', isEmpty:', job === '')
  console.log('JSON.stringify 결과:', JSON.stringify(requestBody))
  
  return fetchApi<void>('/history/selections', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  })
}

// 사용자별 선택 이력 조회 API
export async function getUserSelectionHistory(
  userId: string
): Promise<ApiResponse<Array<{ abilityUnitId: string; selectedAt: Date }>>> {
  return fetchApi<Array<{ abilityUnitId: string; selectedAt: Date }>>(
    `/history/selections/${userId}`
  )
}

// 기관 목록 조회 API
export async function getOrganizations(): Promise<ApiResponse<Organization[]>> {
  return fetchApi<Organization[]>('/organizations')
}

// 표준 코드 조회 API
export async function getStandardCodes(
  type: 'departments' | 'industries' | 'jobs'
): Promise<ApiResponse<string[]>> {
  return fetchApi<string[]>(`/standard-codes/${type}`)
}

// 4단계 계층구조 목록 조회 API
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

export async function getHierarchicalCodes(): Promise<ApiResponse<HierarchicalData[]>> {
  return fetchApi<HierarchicalData[]>('/standard-codes/hierarchical')
}

// 단계별 카테고리 목록 조회 API
export async function getCategoryList(
  level: 'major' | 'middle' | 'small' | 'sub',
  parent?: string
): Promise<ApiResponse<string[]>> {
  const url = parent
    ? `/standard-codes/category/${level}?parent=${encodeURIComponent(parent)}`
    : `/standard-codes/category/${level}`
  return fetchApi<string[]>(url)
}

// 능력단위 요소 조회 API
export async function getAbilityElements(
  abilityUnitId: string
): Promise<ApiResponse<AbilityUnit['elements']>> {
  return fetchApi<AbilityUnit['elements']>(
    `/ability-units/${abilityUnitId}/elements`
  )
}

// 세트 저장 API
export async function saveCartSet(
  userId: string,
  name: string,
  items: CartItem[]
): Promise<ApiResponse<CartSet>> {
  return fetchApi<CartSet>('/cart-sets', {
    method: 'POST',
    body: JSON.stringify({ userId, name, items }),
  })
}

// 사용자별 세트 목록 조회 API
export async function getCartSets(
  userId: string
): Promise<ApiResponse<Omit<CartSet, 'items'>[]>> {
  return fetchApi<Omit<CartSet, 'items'>[]>(`/cart-sets?userId=${userId}`)
}

// 세트 상세 조회 API (아이템 포함)
export async function getCartSetById(
  setId: string,
  userId: string
): Promise<ApiResponse<CartSet>> {
  return fetchApi<CartSet>(`/cart-sets/${setId}?userId=${userId}`)
}

// 세트 삭제 API
export async function deleteCartSet(
  setId: string,
  userId: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/cart-sets/${setId}?userId=${userId}`, {
    method: 'DELETE',
  })
}

// 선택목록 조회 API
export async function getCart(
  userId: string
): Promise<ApiResponse<CartItem[]>> {
  return fetchApi<CartItem[]>(`/cart?userId=${userId}`)
}

// 선택목록 아이템 추가 API
export async function addCartItem(
  userId: string,
  unitCode: string,
  memo?: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>('/cart', {
    method: 'POST',
    body: JSON.stringify({ userId, unitCode, memo }),
  })
}

// 선택목록 아이템 여러 개 추가 API
export async function addMultipleCartItems(
  userId: string,
  items: CartItem[]
): Promise<ApiResponse<void>> {
  return fetchApi<void>('/cart/multiple', {
    method: 'POST',
    body: JSON.stringify({ userId, items }),
  })
}

// 선택목록 아이템 삭제 API
export async function removeCartItem(
  unitCode: string,
  userId: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/cart/${unitCode}?userId=${userId}`, {
    method: 'DELETE',
  })
}

// 선택목록 메모 업데이트 API
export async function updateCartItemMemo(
  unitCode: string,
  userId: string,
  memo: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/cart/${unitCode}/memo`, {
    method: 'PUT',
    body: JSON.stringify({ userId, memo }),
  })
}

// 선택목록 전체 삭제 API
export async function clearCart(
  userId: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/cart?userId=${userId}`, {
    method: 'DELETE',
  })
}

// 회원가입 API
export async function register(
  email: string,
  password: string,
  name: string,
  organizationId?: string
): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, organizationId }),
  })
}

// 로그인 API
export async function login(
  email: string,
  password: string
): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Guest 로그인 API
export async function loginAsGuest(
  name?: string
): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}


