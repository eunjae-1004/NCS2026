// PostgreSQL 데이터베이스 연결 설정
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// 데이터베이스 연결 설정
// Railway 등에서 제공하는 DATABASE_URL을 우선 사용
// 없으면 개별 환경 변수 사용
console.log('🔍 데이터베이스 연결 설정 확인:')
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '설정됨' : '없음')
console.log('   DB_HOST:', process.env.DB_HOST || '없음')
console.log('   NODE_ENV:', process.env.NODE_ENV || '없음')

let poolConfig
try {
  if (process.env.DATABASE_URL) {
    // DATABASE_URL 유효성 검사
    const dbUrl = process.env.DATABASE_URL.trim()
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must start with postgresql:// or postgres://')
    }
    
    poolConfig = {
      connectionString: dbUrl,
      ssl: dbUrl.includes('railway.internal')
        ? false
        : (process.env.NODE_ENV === 'production' 
          ? { rejectUnauthorized: false } 
          : false),
    }
  } else {
    poolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ncs_search',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    }
  }
} catch (error) {
  console.error('❌ 데이터베이스 설정 오류:', error.message)
  throw error
}

// 데이터베이스 연결 풀 생성
const pool = new Pool({
  ...poolConfig,
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 타임아웃을 10초로 증가
})

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공')
})

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err)
})

// 쿼리 헬퍼 함수
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    // 프로덕션에서는 쿼리 로그 비활성화 (rate limit 방지)
    if (process.env.NODE_ENV !== 'production' && duration > 1000) {
      console.log('쿼리 실행 (느림):', { text: text.substring(0, 100), duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    console.error('쿼리 오류:', error)
    throw error
  }
}

// 트랜잭션 헬퍼
export const transaction = async (callback) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export default pool


