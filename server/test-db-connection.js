// 데이터베이스 연결 테스트 스크립트
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ncs_search',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

console.log('🔍 데이터베이스 연결 테스트 중...')
console.log('설정:')
console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`)
console.log(`  Port: ${process.env.DB_PORT || 5432}`)
console.log(`  Database: ${process.env.DB_NAME || 'ncs_search'}`)
console.log(`  User: ${process.env.DB_USER || 'postgres'}`)
console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(비어있음)'}`)
console.log('')

try {
  // 연결 테스트
  const result = await pool.query('SELECT NOW() as current_time, current_database() as db_name, current_user as user_name')
  
  console.log('✅ 데이터베이스 연결 성공!')
  console.log('  현재 시간:', result.rows[0].current_time)
  console.log('  데이터베이스:', result.rows[0].db_name)
  console.log('  사용자:', result.rows[0].user_name)
  console.log('')

  // 테이블 목록 확인
  const tablesResult = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `)
  
  console.log('📊 테이블 목록:')
  tablesResult.rows.forEach(row => {
    console.log(`  - ${row.table_name}`)
  })
  console.log('')

  // 주요 테이블 데이터 개수 확인
  const tables = ['ncs_main', 'ksa', 'organizations', 'standard_codes', 'unit_definition', 'performance_criteria']
  
  console.log('📈 데이터 개수:')
  for (const table of tables) {
    try {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
      console.log(`  ${table}: ${countResult.rows[0].count}개`)
    } catch (error) {
      console.log(`  ${table}: 테이블 없음 또는 오류`)
    }
  }

  await pool.end()
  console.log('')
  console.log('✅ 테스트 완료!')
  process.exit(0)
} catch (error) {
  console.error('❌ 데이터베이스 연결 실패!')
  console.error('오류:', error.message)
  console.error('')
  console.error('확인 사항:')
  console.error('  1. PostgreSQL이 실행 중인지 확인')
  console.error('  2. .env 파일의 DB_NAME, DB_USER, DB_PASSWORD가 올바른지 확인')
  console.error('  3. 데이터베이스가 생성되었는지 확인')
  console.error('  4. 사용자 권한이 올바른지 확인')
  
  await pool.end()
  process.exit(1)
}


