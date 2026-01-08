# 실수와 오류를 줄이기 위한 개발 가이드

## 1. 개발 전 준비 단계

### 1.1 프로젝트 구조 파악

#### 필수 확인 사항
```bash
# 프로젝트 구조 확인
tree -L 2
# 또는
ls -la

# 주요 파일 확인
- package.json (루트)
- server/package.json (백엔드)
- vite.config.ts 또는 webpack.config.js (프론트엔드)
- .env.example (환경 변수 예시)
```

#### 확인할 내용
- [ ] 모노레포인지, 분리된 저장소인지
- [ ] 백엔드와 프론트엔드가 같은 저장소에 있는지
- [ ] 빌드 산출물 위치 (`dist`, `build` 등)
- [ ] 설정 파일 위치

### 1.2 기술 스택 확인

#### package.json 확인
```json
{
  "engines": {
    "node": ">=18.0.0"  // Node.js 버전 확인
  },
  "type": "module"  // ES Modules 확인
}
```

#### 확인할 내용
- [ ] Node.js 버전 요구사항
- [ ] 모듈 시스템 (CommonJS vs ES Modules)
- [ ] 프레임워크 버전
- [ ] 주요 의존성 버전

### 1.3 환경 변수 확인

#### .env.example 파일 확인
```bash
# 백엔드
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=password
PORT=3000
NODE_ENV=development

# 프론트엔드
VITE_API_BASE_URL=http://localhost:3000/api
```

#### 확인할 내용
- [ ] 필수 환경 변수 목록
- [ ] 각 변수의 타입 (string, number, boolean)
- [ ] 기본값이 있는지
- [ ] 환경별로 다른 값이 필요한지

---

## 2. 코드 작성 시 주의사항

### 2.1 PostgreSQL 쿼리 작성 규칙

#### ❌ 나쁜 예
```javascript
// 타입 추론에 의존
await query('INSERT INTO users (id, name) VALUES ($1, $2)', [userId, name])

// 숫자를 직접 전달
await query('SELECT * FROM items WHERE id = $1', [itemId])
```

#### ✅ 좋은 예
```javascript
// 명시적 타입 캐스팅
await query(
  'INSERT INTO users (id, name) VALUES ($1::VARCHAR, $2::VARCHAR)', 
  [String(userId), String(name)]
)

// 숫자도 명시적 변환
await query(
  'SELECT * FROM items WHERE id = $1::INTEGER', 
  [parseInt(itemId, 10)]
)
```

#### 타입 캐스팅 규칙
```sql
-- VARCHAR 컬럼
WHERE column = $1::VARCHAR
VALUES ($1::VARCHAR, $2::VARCHAR)

-- INTEGER 컬럼
WHERE id = $1::INTEGER
VALUES ($1::INTEGER)

-- TEXT 컬럼
WHERE content = $1::TEXT
VALUES ($1::TEXT)

-- TIMESTAMP 컬럼
WHERE created_at = $1::TIMESTAMP
VALUES ($1::TIMESTAMP, CURRENT_TIMESTAMP)
```

### 2.2 JavaScript 타입 변환

#### ❌ 나쁜 예
```javascript
// 타입 가정
const userId = req.body.userId  // number일 수도 있음
const port = process.env.PORT  // string
const limit = req.query.limit  // string
```

#### ✅ 좋은 예
```javascript
// 명시적 타입 변환
const userId = String(req.body.userId)
const port = parseInt(process.env.PORT || '3000', 10)
const limit = parseInt(req.query.limit || '10', 10)
const isActive = req.body.isActive === 'true' || req.body.isActive === true
```

#### 타입 변환 헬퍼 함수
```javascript
// 유틸리티 함수 생성
function toInt(value, defaultValue = 0) {
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function toString(value, defaultValue = '') {
  return value != null ? String(value) : defaultValue
}

function toBool(value, defaultValue = false) {
  if (value === 'true' || value === true) return true
  if (value === 'false' || value === false) return false
  return defaultValue
}

// 사용
const limit = toInt(req.query.limit, 10)
const userId = toString(req.body.userId)
const isActive = toBool(req.body.isActive, false)
```

### 2.3 에러 처리

#### ❌ 나쁜 예
```javascript
// 에러 무시
try {
  await someOperation()
} catch (error) {
  // 아무것도 안 함
}

// 에러 메시지만 출력
try {
  await someOperation()
} catch (error) {
  console.error(error.message)
}
```

#### ✅ 좋은 예
```javascript
// 상세한 에러 정보
try {
  await someOperation()
} catch (error) {
  console.error('작업 실패:', {
    operation: 'someOperation',
    error: error.message,
    code: error.code,  // PostgreSQL 에러 코드
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    context: {
      userId: req.body?.userId,
      // 관련 데이터
    }
  })
  throw error  // 또는 적절한 에러 응답
}
```

#### PostgreSQL 에러 코드 처리
```javascript
try {
  await query('INSERT INTO ...')
} catch (error) {
  // PostgreSQL 에러 코드별 처리
  switch (error.code) {
    case '23505':  // 중복 키
      return res.status(409).json({ error: '이미 존재합니다.' })
    case '23503':  // 외래 키 제약
      return res.status(400).json({ error: '참조하는 데이터가 없습니다.' })
    case '42P08':  // 타입 불일치
      return res.status(500).json({ error: '타입 오류가 발생했습니다.' })
    default:
      throw error
  }
}
```

### 2.4 로깅 전략

#### ❌ 나쁜 예
```javascript
// 모든 요청마다 로그 출력
console.log('요청 받음:', req.body)
console.log('쿼리 실행:', sql)
console.log('결과:', result)
```

#### ✅ 좋은 예
```javascript
// 환경별 로깅
if (process.env.NODE_ENV !== 'production') {
  console.log('디버그 정보:', data)
}

// 느린 쿼리만 로깅
const duration = Date.now() - start
if (duration > 1000) {
  console.warn('느린 쿼리:', { duration, query: sql.substring(0, 100) })
}

// 에러는 항상 로깅
console.error('에러 발생:', error)
```

#### 로그 레벨 구분
```javascript
// 개발 환경: 상세 로그
if (process.env.NODE_ENV !== 'production') {
  console.log('요청:', { method: req.method, path: req.path, body: req.body })
}

// 프로덕션: 최소한의 로그
console.error('에러:', error.message)  // 에러만
console.warn('경고:', warningMessage)  // 중요한 경고만
```

---

## 3. 배포 설정 시 주의사항

### 3.1 Railway 설정

#### Root Directory 확인
```
❌ 잘못된 설정:
- Root Directory: . (루트)
- Start Command: cd server && npm start

✅ 올바른 설정:
- Root Directory: server
- Start Command: npm start
```

#### Build Command 확인
```
❌ 잘못된 설정:
- Build Command: npm build  (존재하지 않는 명령어)

✅ 올바른 설정:
- Build Command: (비워두기) 또는 npm install
- Node.js 서버는 빌드가 필요 없음
```

#### 환경 변수 설정
```
❌ 잘못된 설정:
- DATABASE_URL: ${{PostgreSQL.DATABASE_URL}}  (참조가 작동하지 않을 수 있음)

✅ 올바른 설정:
- 방법 1: PostgreSQL Variables에서 값 직접 복사
- 방법 2: 참조 사용 시 서비스 이름 정확히 확인
```

### 3.2 Vercel 설정

#### Framework Preset 확인
```
✅ 자동 감지되는 경우:
- Vite: vite.config.ts 존재
- Next.js: next.config.js 존재
- Create React App: package.json에 react-scripts

⚠️ 수동 설정 필요한 경우:
- 커스텀 빌드 설정
- 특수한 프레임워크
```

#### 환경 변수 확인
```
❌ 잘못된 설정:
- API_BASE_URL=http://...  (Vite는 VITE_ 접두사 필요)

✅ 올바른 설정:
- VITE_API_BASE_URL=https://...
- REACT_APP_API_BASE_URL=https://...  (CRA 사용 시)
- NEXT_PUBLIC_API_BASE_URL=https://...  (Next.js 사용 시)
```

---

## 4. 데이터베이스 작업 시 주의사항

### 4.1 스키마 확인

#### 테이블 생성 전 확인
```sql
-- 테이블이 이미 존재하는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 컬럼 타입 확인
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users';
```

#### 타입 일치 확인
```sql
-- 실제 데이터 타입 확인
SELECT 
  column_name,
  data_type,
  CASE 
    WHEN data_type = 'character varying' THEN 'VARCHAR'
    WHEN data_type = 'text' THEN 'TEXT'
    WHEN data_type = 'integer' THEN 'INTEGER'
    ELSE data_type
  END as type_for_query
FROM information_schema.columns
WHERE table_name = 'cart_items';
```

### 4.2 쿼리 작성 체크리스트

#### INSERT 쿼리
- [ ] 모든 VARCHAR 파라미터에 `::VARCHAR` 추가
- [ ] JavaScript에서 `String()` 변환
- [ ] NULL 값 처리 (`memo || null`)

#### UPDATE 쿼리
- [ ] WHERE 절 파라미터도 타입 캐스팅
- [ ] SET 절 파라미터 타입 확인

#### SELECT 쿼리
- [ ] WHERE 절 파라미터 타입 캐스팅
- [ ] JOIN 조건 타입 확인

### 4.3 COALESCE 함수 사용 시

#### ❌ 나쁜 예
```sql
COALESCE((SELECT role FROM users WHERE id = $1), 'user')
```

#### ✅ 좋은 예
```sql
COALESCE((SELECT role FROM users WHERE id = $1::VARCHAR), 'user'::VARCHAR)
```

---

## 5. 테스트 전략

### 5.1 로컬 테스트

#### 데이터베이스 연결 테스트
```javascript
// test-db-connection.js
import pool from './db.js'

try {
  const result = await pool.query('SELECT NOW()')
  console.log('✅ 연결 성공:', result.rows[0])
} catch (error) {
  console.error('❌ 연결 실패:', error)
}
```

#### API 엔드포인트 테스트
```javascript
// test-api.js 또는 test-api.html
fetch('http://localhost:3000/api/test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 5.2 배포 후 테스트

#### Health Check
```bash
curl https://your-backend.railway.app/
```

#### 주요 엔드포인트 테스트
```bash
# 회원가입
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"테스트"}'
```

---

## 6. 문제 해결 프로세스

### 6.1 에러 발생 시 체크리스트

#### 1단계: 로그 확인
- [ ] Railway/Vercel 로그 확인
- [ ] 에러 메시지 읽기
- [ ] 스택 트레이스 확인
- [ ] 에러 코드 확인 (PostgreSQL 에러 코드 등)

#### 2단계: 환경 변수 확인
- [ ] 필수 환경 변수 모두 설정되었는지
- [ ] 값이 올바른지 (타입, 형식)
- [ ] 참조가 제대로 작동하는지

#### 3단계: 데이터베이스 확인
- [ ] 연결 상태 확인
- [ ] 테이블 존재 여부 확인
- [ ] 스키마 일치 여부 확인
- [ ] 데이터 타입 확인

#### 4단계: 코드 확인
- [ ] 타입 변환 확인
- [ ] SQL 쿼리 문법 확인
- [ ] 에러 처리 확인
- [ ] 로깅 확인

### 6.2 일반적인 에러와 해결책

#### 에러: "inconsistent types deduced for parameter"
**원인**: PostgreSQL 타입 불일치
**해결**: 
- SQL에 `::VARCHAR` 등 명시적 타입 캐스팅 추가
- JavaScript에서 `String()` 변환

#### 에러: "Cannot POST /api/..."
**원인**: 라우터가 등록되지 않음
**해결**: 
- 데이터베이스 연결 확인
- 라우터 등록 코드 확인
- 서버 재시작

#### 에러: "CORS policy에 의해 차단"
**원인**: CORS 설정 문제
**해결**: 
- `ALLOWED_ORIGINS`에 프론트엔드 URL 추가
- `null` origin 허용 (로컬 파일 테스트용)

#### 에러: "데이터베이스 연결 실패"
**원인**: 환경 변수 또는 연결 설정 문제
**해결**: 
- `DATABASE_URL` 또는 DB 환경 변수 확인
- Railway 내부 URL 사용 시 SSL 비활성화
- 연결 타임아웃 증가

---

## 7. 코드 리뷰 체크리스트

### 7.1 쿼리 작성 검토

- [ ] 모든 VARCHAR 파라미터에 `::VARCHAR` 추가되었는가?
- [ ] JavaScript에서 `String()` 변환했는가?
- [ ] NULL 값 처리가 올바른가?
- [ ] COALESCE 함수에 타입 캐스팅이 있는가?

### 7.2 에러 처리 검토

- [ ] try-catch 블록이 적절한가?
- [ ] 에러 로그가 상세한가?
- [ ] 에러 응답이 적절한가?
- [ ] PostgreSQL 에러 코드를 처리했는가?

### 7.3 로깅 검토

- [ ] 프로덕션에서 불필요한 로그가 비활성화되었는가?
- [ ] 에러 로그는 항상 출력되는가?
- [ ] Rate limit을 고려했는가?

### 7.4 환경 변수 검토

- [ ] 필수 환경 변수가 모두 사용되는가?
- [ ] 기본값이 적절한가?
- [ ] 타입 변환이 올바른가?

---

## 8. 자동화 및 도구

### 8.1 타입 체크 스크립트

```javascript
// scripts/check-types.js
// PostgreSQL 쿼리에서 타입 캐스팅 확인
const fs = require('fs')
const files = fs.readdirSync('server/routes')

files.forEach(file => {
  const content = fs.readFileSync(`server/routes/${file}`, 'utf8')
  const queries = content.match(/query\([^)]+\)/g)
  
  queries?.forEach(query => {
    // $1, $2 등이 있는데 ::VARCHAR가 없는지 확인
    if (query.includes('$') && !query.includes('::VARCHAR') && !query.includes('::INTEGER')) {
      console.warn(`⚠️ 타입 캐스팅 누락: ${file}`)
    }
  })
})
```

### 8.2 환경 변수 검증

```javascript
// scripts/validate-env.js
const requiredVars = [
  'DATABASE_URL',
  'PORT',
  'NODE_ENV'
]

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ 필수 환경 변수 누락: ${varName}`)
    process.exit(1)
  }
})

console.log('✅ 모든 필수 환경 변수 설정됨')
```

---

## 9. 문서화 체크리스트

### 9.1 필수 문서

- [ ] README.md - 프로젝트 개요 및 시작 방법
- [ ] API_DOCUMENTATION.md - API 엔드포인트 문서
- [ ] DEPLOYMENT_GUIDE.md - 배포 가이드
- [ ] ENV_VARIABLES.md - 환경 변수 설명
- [ ] DATABASE_SCHEMA.md - 데이터베이스 스키마 문서

### 9.2 코드 주석

- [ ] 복잡한 로직에 주석 추가
- [ ] 타입 변환이 필요한 이유 설명
- [ ] 환경별 동작 차이 설명
- [ ] 에러 처리 로직 설명

---

## 10. 최종 체크리스트

### 개발 시작 전
- [ ] 프로젝트 구조 파악
- [ ] 기술 스택 확인
- [ ] 환경 변수 목록 작성
- [ ] 데이터베이스 스키마 확인

### 코드 작성 시
- [ ] PostgreSQL 쿼리: 명시적 타입 캐스팅
- [ ] JavaScript: 명시적 타입 변환
- [ ] 에러 처리: 상세한 로깅
- [ ] 로깅: 환경별 분기

### 배포 전
- [ ] 로컬 테스트 완료
- [ ] 환경 변수 모두 설정
- [ ] 데이터베이스 마이그레이션 완료
- [ ] CORS 설정 확인

### 배포 후
- [ ] Health check 확인
- [ ] 주요 기능 테스트
- [ ] 로그 확인
- [ ] 에러 모니터링

---

## 핵심 원칙 요약

1. **명시적 타입 변환**: 항상 `String()`, `parseInt()` 등 사용
2. **SQL 타입 캐스팅**: 모든 파라미터에 `::VARCHAR` 등 추가
3. **상세한 에러 로깅**: 문제 해결을 위한 충분한 정보 제공
4. **환경별 로깅**: 프로덕션에서는 최소한의 로그만
5. **에러 코드 확인**: PostgreSQL 에러 코드로 정확한 원인 파악
6. **테스트 우선**: 배포 전 로컬에서 충분히 테스트
7. **문서화**: 나중을 위한 명확한 문서 작성

