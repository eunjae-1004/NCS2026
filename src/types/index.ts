// 사용자 및 인증 관련 타입
export interface User {
  id: string
  email?: string
  name: string
  organization?: string
  role?: 'user' | 'guest' | 'admin'
}

// 기관 정보
export interface Organization {
  id: string
  name: string
  type: 'public' | 'enterprise'
}

// 능력단위 관련 타입
export interface AbilityUnit {
  id: string
  code: string
  name: string
  summary: string
  definition: string
  industry?: string
  department?: string
  jobCategory?: string
  jobTitle?: string
  smallCategoryCode?: string // 세분류 코드 (예: 15030202)
  subCategoryCode?: string // 소분류 코드 (예: 150302)
  level?: number
  elements: AbilityElement[]
  performanceCriteria: PerformanceCriterion[]
  knowledge: string[]
  skills: string[]
  attitudes: string[]
  keywords: string[]
}

export interface AbilityElement {
  id: string
  code: string
  name: string
  description: string
}

export interface PerformanceCriterion {
  id: string
  content: string
  highlighted?: boolean
}

// 검색 필터 타입
export interface SearchFilters {
  industry?: string // major_category_name
  middle?: string // middle_category_name
  small?: string // small_category_name
  department?: string
  jobCategory?: string // sub_category_name
  jobTitle?: string
  level?: number
  keyword?: string
  subCategoryCode?: string
  smallCategoryCode?: string
  page?: number
  limit?: number
}

// 페이지네이션 메타데이터
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 선택목록 아이템
export interface CartItem {
  abilityUnit: AbilityUnit
  memo?: string
  addedAt: Date
}

// 선택목록 세트
export interface CartSet {
  id: string
  name: string
  items: CartItem[]
  createdAt: Date
}

// 추천 결과
export interface Recommendation {
  abilityUnit: AbilityUnit
  reason: string
  reasonType: 'mapping' | 'popular' | 'similar'
}

// 별칭 매핑
export interface AliasMapping {
  input: string
  standard: string
  confidence: number
  candidates?: string[]
}


