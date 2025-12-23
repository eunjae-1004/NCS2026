// 개발 중 사용할 Mock 데이터
// 실제 API가 준비되면 이 파일은 제거하거나 API로 대체됩니다

import type {
  AbilityUnit,
  Recommendation,
  Organization,
  AliasMapping,
} from '../types'

export const mockOrganizations: Organization[] = [
  { id: '1', name: '공공기관 A', type: 'public' },
  { id: '2', name: '기업 B', type: 'enterprise' },
  { id: '3', name: '기관 C', type: 'public' },
]

export const mockAbilityUnits: AbilityUnit[] = [
  {
    id: '1',
    code: 'NCS-001',
    name: '품질관리 능력단위',
    summary: '제품 및 서비스의 품질을 관리하고 개선하는 능력',
    definition:
      '품질관리 능력단위는 제품 및 서비스의 품질을 체계적으로 관리하고 지속적으로 개선하는 능력을 의미합니다. 이를 통해 고객 만족도를 향상시키고 조직의 경쟁력을 강화할 수 있습니다.',
    industry: '제조업',
    department: '품질관리',
    jobCategory: '품질관리',
    jobTitle: '품질관리사',
    level: 3,
    elements: [
      {
        id: '1',
        code: 'ELE-001',
        name: '품질 기준 수립',
        description: '품질 기준을 수립하고 문서화하는 능력',
      },
      {
        id: '2',
        code: 'ELE-002',
        name: '품질 검사 수행',
        description: '품질 검사를 체계적으로 수행하는 능력',
      },
    ],
    performanceCriteria: [
      { id: '1', content: '품질 기준을 수립하고 관리한다', highlighted: true },
      { id: '2', content: '품질 검사를 수행하고 결과를 분석한다' },
      { id: '3', content: '품질 문제를 식별하고 개선 방안을 제시한다' },
      { id: '4', content: '품질 보고서를 작성하고 보고한다' },
    ],
    knowledge: [
      '품질관리 이론 및 원칙',
      '통계적 품질관리 방법',
      'ISO 품질 관리 시스템',
      '품질 검사 절차 및 기준',
    ],
    skills: [
      '품질 검사 수행 능력',
      '데이터 분석 및 해석 능력',
      '문제 해결 능력',
      '보고서 작성 능력',
    ],
    attitudes: ['정확성과 신뢰성', '책임감', '지속적 개선 의지', '협력적 태도'],
    keywords: ['품질', '검사', '관리', '개선', 'ISO'],
  },
  {
    id: '2',
    code: 'NCS-002',
    name: '생산관리 능력단위',
    summary: '생산 계획을 수립하고 실행하는 능력',
    definition:
      '생산관리 능력단위는 생산 계획을 수립하고 효율적으로 실행하는 능력을 의미합니다. 생산 일정을 관리하고 자원을 최적화하여 생산성을 향상시킵니다.',
    industry: '제조업',
    department: '생산관리',
    jobCategory: '생산관리',
    jobTitle: '생산관리사',
    level: 3,
    elements: [
      {
        id: '3',
        code: 'ELE-003',
        name: '생산 계획 수립',
        description: '생산 계획을 수립하고 검토하는 능력',
      },
      {
        id: '4',
        code: 'ELE-004',
        name: '생산 일정 관리',
        description: '생산 일정을 관리하고 조정하는 능력',
      },
    ],
    performanceCriteria: [
      { id: '5', content: '생산 계획을 수립한다', highlighted: true },
      { id: '6', content: '생산 일정을 관리한다' },
      { id: '7', content: '자원을 최적화하여 배치한다' },
    ],
    knowledge: ['생산관리 이론', '일정관리', '자원 관리'],
    skills: ['계획 수립', '일정 관리', '자원 배치'],
    attitudes: ['체계성', '효율성', '책임감'],
    keywords: ['생산', '계획', '일정'],
  },
  {
    id: '3',
    code: 'NCS-003',
    name: '인사관리 능력단위',
    summary: '인사 제도를 관리하고 운영하는 능력',
    definition:
      '인사관리 능력단위는 인사 제도를 관리하고 운영하는 능력을 의미합니다. 채용, 평가, 교육 등 인사 업무를 체계적으로 수행합니다.',
    industry: '서비스업',
    department: '인사관리',
    jobCategory: '인사관리',
    jobTitle: '인사담당자',
    level: 3,
    elements: [
      {
        id: '5',
        code: 'ELE-005',
        name: '채용 관리',
        description: '채용 프로세스를 관리하는 능력',
      },
    ],
    performanceCriteria: [
      { id: '8', content: '채용 계획을 수립한다', highlighted: true },
      { id: '9', content: '인사 평가를 수행한다' },
    ],
    knowledge: ['인사관리 이론', '노동법', '평가 제도'],
    skills: ['채용 관리', '평가 수행', '교육 기획'],
    attitudes: ['공정성', '객관성', '책임감'],
    keywords: ['인사', '채용', '평가'],
  },
]

export const mockRecommendations: Recommendation[] = [
  {
    abilityUnit: mockAbilityUnits[0],
    reason: '품질관리 부서에서 가장 많이 선택한 능력단위입니다',
    reasonType: 'popular',
  },
  {
    abilityUnit: mockAbilityUnits[1],
    reason: '입력하신 부서와 매핑된 능력단위입니다',
    reasonType: 'mapping',
  },
]

// 별칭 매핑 데이터
const aliasMappingData: Record<string, { standard: string; confidence: number }> = {
  // 부서 매핑
  'qa': { standard: '품질관리', confidence: 0.95 },
  '품질관리팀': { standard: '품질관리', confidence: 0.9 },
  '품질팀': { standard: '품질관리', confidence: 0.9 },
  'qc': { standard: '품질관리', confidence: 0.95 },
  'hr': { standard: '인사관리', confidence: 0.95 },
  '인사팀': { standard: '인사관리', confidence: 0.9 },
  '인사부': { standard: '인사관리', confidence: 0.9 },
  '생산팀': { standard: '생산관리', confidence: 0.9 },
  '생산부': { standard: '생산관리', confidence: 0.9 },
}

export function getMockAliasMapping(
  input: string,
  type: 'department' | 'industry' | 'job'
): AliasMapping {
  const lowerInput = input.toLowerCase().trim()
  const mapping = aliasMappingData[lowerInput]

  if (mapping && mapping.confidence >= 0.8) {
    return {
      input,
      standard: mapping.standard,
      confidence: mapping.confidence,
    }
  }

  // 불확실한 경우 후보 제시
  const candidates: string[] = []
  if (type === 'department') {
    candidates.push('품질관리', '생산관리', '인사관리', '재무관리', '마케팅')
  } else if (type === 'industry') {
    candidates.push('제조업', '서비스업', 'IT', '건설업', '금융업')
  } else {
    candidates.push('품질관리사', '생산관리사', '인사담당자', '회계사', '마케터')
  }

  return {
    input,
    standard: input, // 입력값 그대로
    confidence: 0.5,
    candidates,
  }
}

export const mockStandardCodes = {
  departments: ['품질관리', '생산관리', '인사관리', '재무관리', '마케팅'],
  industries: ['제조업', '서비스업', 'IT', '건설업', '금융업'],
  jobs: ['품질관리사', '생산관리사', '인사담당자', '회계사', '마케터'],
}



