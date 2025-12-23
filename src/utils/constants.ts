// 상수 정의

export const API_ENDPOINTS = {
  ABILITY_UNITS: '/ability-units',
  ABILITY_UNIT_DETAIL: (id: string) => `/ability-units/${id}`,
  ABILITY_UNIT_SIMILAR: (id: string) => `/ability-units/${id}/similar`,
  SEARCH: '/ability-units/search',
  ALIAS_MAP: '/alias/map',
  RECOMMENDATIONS: '/recommendations',
  ORGANIZATIONS: '/organizations',
  STANDARD_CODES: (type: string) => `/standard-codes/${type}`,
  SELECTION_HISTORY: '/history/selections',
  USER_SELECTION_HISTORY: (userId: string) => `/history/selections/${userId}`,
} as const

export const LEVELS = [
  { value: 1, label: '1단계 (초급)' },
  { value: 2, label: '2단계 (중급)' },
  { value: 3, label: '3단계 (고급)' },
  { value: 4, label: '4단계 (전문가)' },
  { value: 5, label: '5단계 (최고 전문가)' },
] as const

export const CONFIDENCE_THRESHOLD = 0.8

export const MAPPING_TYPES = {
  DEPARTMENT: 'department',
  INDUSTRY: 'industry',
  JOB: 'job',
} as const



