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
    console.log('구조 분해 후 값:', { userId, abilityUnitId, industry, department, job })

    if (!userId || !abilityUnitId) {
      return res.status(400).json({
        success: false,
        error: 'userId와 abilityUnitId가 필요합니다.',
      })
    }

    // unit_code 추출 (abilityUnitId가 unit_code인 경우)
    const unitCode = abilityUnitId

    // 사용자 정보에서 기본값 가져오기
    const userQuery = `SELECT industry_code, department_code, job_code FROM users WHERE id = $1`
    const userResult = await query(userQuery, [userId])
    const userInfo = userResult.rows[0] || {}
    
    // 산업분야/부서/직무를 standard_codes의 code로 변환
    let industryCode = userInfo.industry_code || ''
    let departmentCode = userInfo.department_code || ''
    let jobCode = userInfo.job_code || ''

    // 빈 문자열이나 undefined/null 체크
    const hasIndustry = industry && industry.trim() !== ''
    const hasDepartment = department && department.trim() !== ''
    const hasJob = job && job.trim() !== ''

    // 사용자가 명시적으로 입력한 값이 있으면 우선 사용
    if (hasIndustry || hasDepartment || hasJob) {
      console.log('별칭 매핑 시도:', { industry, department, job })
      const codes = await normalizeAliasesToCodes({ 
        industry: hasIndustry ? industry : undefined,
        department: hasDepartment ? department : undefined,
        job: hasJob ? job : undefined
      })
      // 사용자 입력값이 있으면 덮어쓰기
      if (hasIndustry && codes.industryCode) {
        industryCode = codes.industryCode
      }
      if (hasDepartment && codes.departmentCode) {
        departmentCode = codes.departmentCode
      }
      if (hasJob && codes.jobCode) {
        jobCode = codes.jobCode
      }
      console.log('별칭 매핑 결과:', { industryCode, departmentCode, jobCode })
    } else {
      console.log('사용자 기본값 사용:', { industryCode, departmentCode, jobCode })
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
      ON CONFLICT DO NOTHING
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

// 사용자별 선택 이력 조회 (상세 정보 포함)
router.get('/selections/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { industryCode, departmentCode, jobCode } = req.query

    // 필터 조건 구성
    let whereClause = 'WHERE sh.user_id = $1'
    const params = [userId]
    let paramIndex = 2

    if (industryCode) {
      whereClause += ` AND sh.industry_code = $${paramIndex}`
      params.push(industryCode)
      paramIndex++
    }
    if (departmentCode) {
      whereClause += ` AND sh.department_code = $${paramIndex}`
      params.push(departmentCode)
      paramIndex++
    }
    if (jobCode) {
      whereClause += ` AND sh.job_code = $${paramIndex}`
      params.push(jobCode)
      paramIndex++
    }

    // 뷰를 사용하여 쿼리 단순화
    const selectQuery = `
      SELECT 
        sh.id,
        sh.ability_unit_id,
        sh.unit_code,
        sh.industry_code,
        sh.department_code,
        sh.job_code,
        sh.selected_at,
        sh.industry_name,
        sh.department_name,
        sh.job_name,
        n.unit_name,
        n.unit_level,
        n.major_category_name,
        n.sub_category_name,
        n.small_category_name
      FROM selection_history_detail sh
      LEFT JOIN ncs_main n ON sh.unit_code = n.unit_code
      ${whereClause}
      ORDER BY sh.selected_at DESC
      LIMIT 1000
    `
    const result = await query(selectQuery, params)

    const history = result.rows.map((row) => ({
      id: row.id,
      abilityUnitId: row.ability_unit_id,
      unitCode: row.unit_code,
      unitName: row.unit_name,
      unitLevel: row.unit_level,
      industryCode: row.industry_code,
      industryName: row.industry_name,
      departmentCode: row.department_code,
      departmentName: row.department_name,
      jobCode: row.job_code,
      jobName: row.job_name,
      selectedAt: row.selected_at,
      ncsIndustry: row.major_category_name,
      ncsDepartment: row.sub_category_name,
      ncsJob: row.small_category_name,
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

// 선택 이력 수정 (개별)
router.put('/selections/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, industryCode, departmentCode, jobCode } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 업데이트할 필드 구성
    const updates = []
    const params = []
    let paramIndex = 1

    if (industryCode !== undefined) {
      updates.push(`industry_code = $${paramIndex}`)
      params.push(industryCode || null)
      paramIndex++
    }
    if (departmentCode !== undefined) {
      updates.push(`department_code = $${paramIndex}`)
      params.push(departmentCode || null)
      paramIndex++
    }
    if (jobCode !== undefined) {
      updates.push(`job_code = $${paramIndex}`)
      params.push(jobCode || null)
      paramIndex++
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: '수정할 필드가 없습니다.',
      })
    }

    params.push(id, userId)
    const updateQuery = `
      UPDATE selection_history
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, industry_code, department_code, job_code
    `

    const result = await query(updateQuery, params)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '선택 이력을 찾을 수 없습니다.',
      })
    }

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('선택 이력 수정 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '이력 수정 중 오류가 발생했습니다.',
    })
  }
})

// 선택 이력 일괄 수정 (다중/전체)
router.put('/selections', async (req, res) => {
  try {
    const { userId, ids, industryCode, departmentCode, jobCode } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 업데이트할 필드 구성
    const updates = []
    const params = []
    let paramIndex = 1

    if (industryCode !== undefined) {
      updates.push(`industry_code = $${paramIndex}`)
      params.push(industryCode || null)
      paramIndex++
    }
    if (departmentCode !== undefined) {
      updates.push(`department_code = $${paramIndex}`)
      params.push(departmentCode || null)
      paramIndex++
    }
    if (jobCode !== undefined) {
      updates.push(`job_code = $${paramIndex}`)
      params.push(jobCode || null)
      paramIndex++
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: '수정할 필드가 없습니다.',
      })
    }

    // WHERE 조건 구성
    let whereClause = `user_id = $${paramIndex}`
    params.push(userId)
    paramIndex++

    if (ids && Array.isArray(ids) && ids.length > 0) {
      whereClause += ` AND id = ANY($${paramIndex})`
      params.push(ids)
      paramIndex++
    }

    const updateQuery = `
      UPDATE selection_history
      SET ${updates.join(', ')}
      WHERE ${whereClause}
      RETURNING id, industry_code, department_code, job_code
    `

    const result = await query(updateQuery, params)

    res.json({ 
      success: true, 
      data: { 
        updatedCount: result.rows.length,
        updated: result.rows
      } 
    })
  } catch (error) {
    console.error('선택 이력 일괄 수정 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '이력 일괄 수정 중 오류가 발생했습니다.',
    })
  }
})export default router
