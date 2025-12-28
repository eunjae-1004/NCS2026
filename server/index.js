import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// 데이터베이스 라우트 (조건부 import)
let abilityUnitsRouter, historyRouter
let dbConnected = false

try {
  const dbModule = await import('./db.js')
  const routesModule = await import('./routes/abilityUnits.js')
  const historyModule = await import('./routes/history.js')
  abilityUnitsRouter = routesModule.default
  historyRouter = historyModule.default
  
  // 데이터베이스 연결 테스트
  const testQuery = await dbModule.default.query('SELECT NOW()')
  if (testQuery) {
    dbConnected = true
    console.log('✅ PostgreSQL 데이터베이스 연결 성공')
  }
} catch (error) {
  console.error('❌ 데이터베이스 연결 실패. Mock 데이터 모드로 동작합니다.')
  console.error('   에러 메시지:', error.message)
  console.error('   에러 코드:', error.code)
  console.error('   환경 변수 확인:')
  console.error('     DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')
  console.error('     DB_HOST:', process.env.DB_HOST || '없음')
  console.error('     DB_NAME:', process.env.DB_NAME || '없음')
  console.error('     DB_USER:', process.env.DB_USER || '없음')
  console.error('     DB_PASSWORD:', process.env.DB_PASSWORD ? '설정됨' : '없음')
  dbConnected = false
}

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 포트 충돌 시 에러 처리
process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ 포트 ${PORT}가 이미 사용 중입니다.`)
    console.error('해결 방법:')
    console.error('1. 사용 중인 프로세스 종료: Get-Process -Name node | Stop-Process -Force')
    console.error(`2. 다른 포트 사용: PORT=3001 node index.js`)
    process.exit(1)
  } else {
    throw err
  }
})

// 미들웨어
// CORS 설정 (프로덕션 환경에서 프론트엔드 도메인 허용)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없거나 (같은 도메인 요청) null/undefined (로컬 파일) 또는 허용된 origin이면 통과
    // 로컬 파일 테스트를 위해 null origin도 허용
    if (!origin || origin === 'null' || origin === null || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// 루트 경로 - API 서버 안내
app.get('/', (req, res) => {
  res.json({
    message: 'NCS 능력단위 검색 시스템 API 서버',
    version: '1.0.0',
    endpoints: {
      base: '/api',
      abilityUnits: '/api/ability-units',
      organizations: '/api/organizations',
      recommendations: '/api/recommendations',
      documentation: '프로젝트 루트의 API_DOCUMENTATION.md 참고'
    },
    status: 'running'
  })
})

// 임시 데이터베이스 (실제로는 PostgreSQL, MySQL 등을 사용)
const abilityUnits = [
  {
    id: '1',
    code: 'NCS-001',
    name: '품질관리 능력단위',
    summary: '제품 및 서비스의 품질을 관리하고 개선하는 능력',
    definition:
      '품질관리 능력단위는 제품 및 서비스의 품질을 체계적으로 관리하고 지속적으로 개선하는 능력을 의미합니다.',
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
    ],
    knowledge: [
      '품질관리 이론 및 원칙',
      '통계적 품질관리 방법',
      'ISO 품질 관리 시스템',
    ],
    skills: ['품질 검사 수행 능력', '데이터 분석 및 해석 능력'],
    attitudes: ['정확성과 신뢰성', '책임감', '지속적 개선 의지'],
    keywords: ['품질', '검사', '관리', '개선'],
  },
  {
    id: '2',
    code: 'NCS-002',
    name: '생산관리 능력단위',
    summary: '생산 계획을 수립하고 실행하는 능력',
    definition:
      '생산관리 능력단위는 생산 계획을 수립하고 효율적으로 실행하는 능력을 의미합니다.',
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
    ],
    performanceCriteria: [
      { id: '4', content: '생산 계획을 수립한다', highlighted: true },
      { id: '5', content: '생산 일정을 관리한다' },
    ],
    knowledge: ['생산관리 이론', '일정관리'],
    skills: ['계획 수립', '일정 관리'],
    attitudes: ['체계성', '효율성'],
    keywords: ['생산', '계획', '일정'],
  },
  {
    id: '3',
    code: 'NCS-003',
    name: '인사관리 능력단위',
    summary: '인사 제도를 관리하고 운영하는 능력',
    definition:
      '인사관리 능력단위는 인사 제도를 관리하고 운영하는 능력을 의미합니다.',
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
      { id: '6', content: '채용 계획을 수립한다', highlighted: true },
    ],
    knowledge: ['인사관리 이론', '노동법'],
    skills: ['채용 관리', '평가 수행'],
    attitudes: ['공정성', '객관성'],
    keywords: ['인사', '채용', '평가'],
  },
]

const organizations = [
  { id: '1', name: '공공기관 A', type: 'public' },
  { id: '2', name: '기업 B', type: 'enterprise' },
  { id: '3', name: '기관 C', type: 'public' },
]

const standardCodes = {
  departments: ['품질관리', '생산관리', '인사관리', '재무관리', '마케팅'],
  industries: ['제조업', '서비스업', 'IT', '건설업', '금융업'],
  jobs: ['품질관리사', '생산관리사', '인사담당자', '회계사', '마케터'],
}

// 선택 이력 저장 (메모리 기반, 실제로는 DB에 저장)
const selectionHistory = []

// 별칭 매핑 데이터
const aliasMapping = {
  qa: { standard: '품질관리', confidence: 0.95 },
  '품질관리팀': { standard: '품질관리', confidence: 0.9 },
  '품질팀': { standard: '품질관리', confidence: 0.9 },
  qc: { standard: '품질관리', confidence: 0.95 },
  hr: { standard: '인사관리', confidence: 0.95 },
  '인사팀': { standard: '인사관리', confidence: 0.9 },
}

// API 라우트

// 데이터베이스 라우트 (연결 성공 시에만 사용)
if (dbConnected && abilityUnitsRouter && historyRouter) {
  app.use('/api/ability-units', abilityUnitsRouter)
  app.use('/api/history', historyRouter)
  console.log('📊 데이터베이스 모드로 API 서버 실행 중')
  
  // 기관, 표준코드, 별칭, 추천, 세트, 장바구니, 인증 라우트도 추가
  try {
    const orgRouter = (await import('./routes/organizations.js')).default
    const stdCodeRouter = (await import('./routes/standardCodes.js')).default
    const aliasRouter = (await import('./routes/alias.js')).default
    const recommendationsRouter = (await import('./routes/recommendations.js')).default
    const cartSetsRouter = (await import('./routes/cartSets.js')).default
    const cartRouter = (await import('./routes/cart.js')).default
    const authRouter = (await import('./routes/auth.js')).default
    app.use('/api/organizations', orgRouter)
    app.use('/api/standard-codes', stdCodeRouter)
    app.use('/api/alias', aliasRouter)
    app.use('/api/recommendations', recommendationsRouter)
    app.use('/api/cart-sets', cartSetsRouter)
    app.use('/api/cart', cartRouter)
    app.use('/api/auth', authRouter)
    console.log('✅ 추가 라우트 등록 완료: organizations, standard-codes, alias, recommendations, cart-sets, cart, auth')
  } catch (error) {
    console.error('❌ 추가 라우트 로드 실패:', error.message)
    console.error('   상세 에러:', error)
  }
} else {
  console.log('📝 Mock 데이터 모드로 API 서버 실행 중')
}

// 기존 Mock 데이터 라우트 (데이터베이스 연결 실패 시 fallback)
// 1. 능력단위 검색 (Mock - 데이터베이스 연결 실패 시에만 사용)
app.get('/api/ability-units', (req, res) => {
  try {
    const {
      industry,
      department,
      jobCategory,
      jobTitle,
      level,
      keyword,
    } = req.query

    let results = [...abilityUnits]

    // 필터링
    if (industry) {
      results = results.filter((r) => r.industry === industry)
    }
    if (department) {
      results = results.filter((r) => r.department === department)
    }
    if (jobCategory) {
      results = results.filter((r) => r.jobCategory === jobCategory)
    }
    if (jobTitle) {
      results = results.filter((r) => r.jobTitle === jobTitle)
    }
    if (level) {
      results = results.filter((r) => r.level === parseInt(level))
    }
    if (keyword) {
      const keywordLower = keyword.toLowerCase()
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(keywordLower) ||
          r.summary.toLowerCase().includes(keywordLower) ||
          r.keywords.some((k) => k.toLowerCase().includes(keywordLower))
      )
    }

    res.json({ success: true, data: results })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '검색 중 오류가 발생했습니다.',
    })
  }
})

// 2. 능력단위 상세 조회
app.get('/api/ability-units/:id', (req, res) => {
  try {
    const { id } = req.params
    const unit = abilityUnits.find((u) => u.id === id)

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: '능력단위를 찾을 수 없습니다.',
      })
    }

    res.json({ success: true, data: unit })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '조회 중 오류가 발생했습니다.',
    })
  }
})

// 3. 별칭 매핑 (Mock - fallback)
app.post('/api/alias/map', (req, res) => {
  try {
    const { input, type } = req.body
    const lowerInput = input.toLowerCase().trim()

    const mapping = aliasMapping[lowerInput]

    if (mapping && mapping.confidence >= 0.8) {
      return res.json({
        success: true,
        data: {
          input,
          standard: mapping.standard,
          confidence: mapping.confidence,
        },
      })
    }

    // 불확실한 경우 후보 제시
    const candidates =
      type === 'department'
        ? standardCodes.departments
        : type === 'industry'
        ? standardCodes.industries
        : standardCodes.jobs

    res.json({
      success: true,
      data: {
        input,
        standard: input,
        confidence: 0.5,
        candidates: candidates.slice(0, 5),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '매핑 중 오류가 발생했습니다.',
    })
  }
})

// 4. 추천 능력단위 조회
app.get('/api/recommendations', (req, res) => {
  try {
    const { industry, department } = req.query

    let results = abilityUnits.map((unit) => ({
      abilityUnit: unit,
      reason: department
        ? `${department} 부서에서 많이 선택한 능력단위입니다`
        : '인기 있는 능력단위입니다',
      reasonType: department ? 'mapping' : 'popular',
    }))

    if (industry) {
      results = results.filter((r) => r.abilityUnit.industry === industry)
    }
    if (department) {
      results = results.filter(
        (r) => r.abilityUnit.department === department
      )
    }

    res.json({ success: true, data: results })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '추천 조회 중 오류가 발생했습니다.',
    })
  }
})

// 5. 유사 능력단위 조회
app.get('/api/ability-units/:id/similar', (req, res) => {
  try {
    const { id } = req.params
    const unit = abilityUnits.find((u) => u.id === id)

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: '능력단위를 찾을 수 없습니다.',
      })
    }

    // 같은 부서나 산업의 다른 능력단위 반환
    const similar = abilityUnits.filter(
      (u) =>
        u.id !== id &&
        (u.department === unit.department || u.industry === unit.industry)
    )

    res.json({ success: true, data: similar })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '유사 능력단위 조회 중 오류가 발생했습니다.',
    })
  }
})

// 6. 선택 이력 저장
app.post('/api/history/selections', (req, res) => {
  try {
    const { userId, abilityUnitId } = req.body

    if (!userId || !abilityUnitId) {
      return res.status(400).json({
        success: false,
        error: 'userId와 abilityUnitId가 필요합니다.',
      })
    }

    selectionHistory.push({
      userId,
      abilityUnitId,
      selectedAt: new Date().toISOString(),
    })

    // 실제로는 데이터베이스에 저장
    console.log('선택 이력 저장:', { userId, abilityUnitId })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '이력 저장 중 오류가 발생했습니다.',
    })
  }
})

// 7. 사용자별 선택 이력 조회 (Mock - fallback)
app.get('/api/history/selections/:userId', (req, res) => {
  try {
    const { userId } = req.params
    const history = selectionHistory.filter((h) => h.userId === userId)

    res.json({
      success: true,
      data: history.map((h) => ({
        abilityUnitId: h.abilityUnitId,
        selectedAt: h.selectedAt,
      })),
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '이력 조회 중 오류가 발생했습니다.',
    })
  }
})

// 8. 기관 목록 조회
app.get('/api/organizations', (req, res) => {
  try {
    res.json({ success: true, data: organizations })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '기관 목록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 9. 표준 코드 조회
app.get('/api/standard-codes/:type', (req, res) => {
  try {
    const { type } = req.params

    if (!standardCodes[type]) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 타입입니다. (departments, industries, jobs)',
      })
    }

    res.json({ success: true, data: standardCodes[type] })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || '표준 코드 조회 중 오류가 발생했습니다.',
    })
  }
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`)
  console.log(`📚 API 문서: http://localhost:${PORT}/api`)
})


