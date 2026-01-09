// 선택 이력 관련 API 라우트
import express from 'express'
import { query } from '../db.js'
import { normalizeAliasesToCodes } from '../utils/aliasMapper.js'
import { getNcsMainCodes } from '../utils/ncsMapper.js'

const router = express.Router()

// 선택 이력 저장
router.post('/selections', async (req, res) => {
  try {
    // 디버깅: 원본 요청 본문 로그
    console.log('=== 선택 이력 저장 요청 (백엔드 수신) ===')
    console.log('원본 req.body:', JSON.stringify(req.body, null, 2))
    console.log('req.body 타입:', typeof req.body)
    console.log('req.body keys:', Object.keys(req.body || {}))
    
    const { userId, abilityUnitId, industry, department, job } = req.body

    // 디버깅: 구조 분해 후 값 확인
    console.log('구조 분해 후 값:')
    console.log('  - userId:', userId, '(type:', typeof userId, ')')
    console.log('  - abilityUnitId:', abilityUnitId, '(type:', typeof abilityUnitId, ')')
    console.log('  - industry:', industry, '(type:', typeof industry, ', isUndefined:', industry === undefined, ', isNull:', industry === null, ', isEmpty:', industry === '', ', length:', industry?.length)')
    console.log('  - department:', department, '(type:', typeof department, ', isUndefined:', department === undefined, ', isNull:', department === null, ', isEmpty:', department === '', ', length:', department?.length)')
    console.log('  - job:', job, '(type:', typeof job, ', isUndefined:', job === undefined, ', isNull:', job === null, ', isEmpty:', job === '', ', length:', job?.length, ')')

    if (!userId || !abilityUnitId) {
      return res.status(400).json({
        success: false,
        error: 'userId와 abilityUnitId가 필요합니다.',
      })
    }

    // unit_code 추출 (abilityUnitId가 unit_code인 경우)
    const unitCode = abilityUnitId

    // 산업분야/부서/직무를 standard_codes의 code로 변환
    let industryCode = ''
    let departmentCode = ''
    let jobCode = ''

    // 빈 문자열이나 undefined/null 체크
    const hasIndustry = industry && industry.trim() !== ''
    const hasDepartment = department && department.trim() !== ''
    const hasJob = job && job.trim() !== ''

    if (hasIndustry || hasDepartment || hasJob) {
      console.log('별칭 매핑 시도:', { industry, department, job })
      const codes = await normalizeAliasesToCodes({ 
        industry: hasIndustry ? industry : undefined,
        department: hasDepartment ? department : undefined,
        job: hasJob ? job : undefined
      })
      industryCode = codes.industryCode || ''
      departmentCode = codes.departmentCode || ''
      jobCode = codes.jobCode || ''
      console.log('별칭 매핑 결과:', { industryCode, departmentCode, jobCode })
    }

    // code가 제공되지 않은 경우, ncs_main에서 가져온 이름을 code로 변환 (중앙화된 매핑 함수 사용)
    if (!industryCode || !departmentCode) {
      console.log('ncs_main에서 코드 가져오기 시도:', { unitCode, industryCode, departmentCode })
      const ncsCodes = await getNcsMainCodes(unitCode)
      console.log('ncs_main 코드 조회 결과:', ncsCodes)
      if (!industryCode) {
        industryCode = ncsCodes.industryCode || ''
      }
      if (!departmentCode) {
        departmentCode = ncsCodes.departmentCode || ''
      }
      console.log('최종 코드 (ncs_main 반영 후):', { industryCode, departmentCode, jobCode })
    }

    // NULL 값 처리 정책: 최소 하나의 code는 있어야 함 (산업분야 또는 부서)
    // 둘 다 없으면 경고 로그만 남기고 저장은 진행 (데이터 누락 방지)
    if (!industryCode && !departmentCode && !jobCode) {
      console.warn(`⚠️ 선택 이력 저장: unit_code=${unitCode}에 대한 분류 코드가 없습니다.`)
    } else {
      console.log('✅ 최종 저장될 코드:', { industryCode, departmentCode, jobCode })
    }

    const insertQuery = `
      INSERT INTO selection_history (
        user_id, 
        ability_unit_id, 
        unit_code, 
        industry_code,
        department_code,
        job_code,
        selected_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id
    `
    const result = await query(insertQuery, [
      userId, 
      abilityUnitId, 
      unitCode,
      industryCode || null,
      departmentCode || null,
      jobCode || null
    ])

    res.json({ success: true, data: { id: result.rows[0]?.id } })
  } catch (error) {
    console.error('선택 이력 저장 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '이력 저장 중 오류가 발생했습니다.',
    })
  }
})

// 사용자별 선택 이력 조회
router.get('/selections/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    // 뷰를 사용하여 쿼리 단순화
    const selectQuery = `
      SELECT 
        ability_unit_id,
        unit_code,
        industry_code,
        department_code,
        job_code,
        selected_at,
        industry_name,
        department_name,
        job_name
      FROM selection_history_detail
      WHERE user_id = $1
      ORDER BY selected_at DESC
      LIMIT 100
    `
    const result = await query(selectQuery, [userId])

    const history = result.rows.map((row) => ({
      abilityUnitId: row.ability_unit_id,
      unitCode: row.unit_code,
      industryCode: row.industry_code,
      industryName: row.industry_name,
      departmentCode: row.department_code,
      departmentName: row.department_name,
      jobCode: row.job_code,
      jobName: row.job_name,
      selectedAt: row.selected_at,
    }))

    res.json({ success: true, data: history })
  } catch (error) {
    console.error('선택 이력 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '이력 조회 중 오류가 발생했습니다.',
    })
  }
})

export default router


