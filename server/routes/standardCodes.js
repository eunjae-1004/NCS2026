// 표준 코드 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 4단계 계층구조 목록 조회 (major -> middle -> small -> sub)
router.get('/hierarchical', async (req, res) => {
  try {
    // ncs_main에서 4단계 계층구조를 id_ncs 오름차순으로 조회
    const hierarchicalQuery = `
      SELECT 
        n.id_ncs,
        n.major_category_name,
        n.middle_category_name,
        n.small_category_name,
        n.sub_category_name
      FROM ncs_main n
      WHERE n.major_category_name IS NOT NULL 
        AND n.major_category_name != ''
      ORDER BY n.id_ncs ASC
    `
    const result = await query(hierarchicalQuery, [])
    
    console.log('계층구조 조회 결과:', result.rows.length, '개 행')
    if (result.rows.length > 0) {
      console.log('첫 번째 행 예시:', result.rows[0])
    }

    // 4단계 계층구조로 변환 (id_ncs 순서 유지)
    const hierarchical = {}
    const majorOrder = []

    result.rows.forEach((row) => {
      const major = row.major_category_name
      const middle = row.middle_category_name
      const small = row.small_category_name
      const sub = row.sub_category_name

      // Major 레벨
      if (!hierarchical[major]) {
        hierarchical[major] = {}
        majorOrder.push(major)
      }

      // Middle 레벨
      if (middle) {
        if (!hierarchical[major][middle]) {
          hierarchical[major][middle] = {}
        }

        // Small 레벨
        if (small) {
          if (!hierarchical[major][middle][small]) {
            hierarchical[major][middle][small] = []
          }

          // Sub 레벨 (중복 제거하면서 순서 유지)
          if (sub && !hierarchical[major][middle][small].includes(sub)) {
            hierarchical[major][middle][small].push(sub)
          }
        }
      }
    })

    // 배열 형태로 변환
    const data = majorOrder.map((major) => {
      const middleData = Object.keys(hierarchical[major])
        .map((middle) => {
          const smallData = Object.keys(hierarchical[major][middle])
            .map((small) => ({
              name: small,
              subs: hierarchical[major][middle][small],
            }))
          return {
            name: middle,
            smalls: smallData,
          }
        })
      return {
        major,
        middles: middleData,
      }
    })

    console.log('변환된 계층구조 데이터:', data.length, '개 major')
    if (data.length > 0) {
      console.log('첫 번째 major 예시:', JSON.stringify(data[0], null, 2))
    }

    res.json({ success: true, data })
  } catch (error) {
    console.error('계층구조 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '계층구조 목록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 단계별 목록 조회 (major, middle, small, sub)
router.get('/category/:level', async (req, res) => {
  try {
    const { level } = req.params
    const { parent } = req.query

    if (!['major', 'middle', 'small', 'sub'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 레벨입니다. (major, middle, small, sub)',
      })
    }

    let query = ''
    let params = []

    if (level === 'major') {
      query = `
        SELECT DISTINCT ON (major_category_name)
          major_category_name as name,
          id_ncs
        FROM ncs_main
        WHERE major_category_name IS NOT NULL 
          AND major_category_name != ''
        ORDER BY major_category_name, id_ncs ASC
      `
    } else if (level === 'middle') {
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'parent 파라미터가 필요합니다.',
        })
      }
      query = `
        SELECT DISTINCT ON (middle_category_name)
          middle_category_name as name,
          id_ncs
        FROM ncs_main
        WHERE major_category_name = $1
          AND middle_category_name IS NOT NULL 
          AND middle_category_name != ''
        ORDER BY middle_category_name, id_ncs ASC
      `
      params = [parent]
    } else if (level === 'small') {
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'parent 파라미터가 필요합니다.',
        })
      }
      const [major, middle] = parent.split('|')
      query = `
        SELECT DISTINCT ON (small_category_name)
          small_category_name as name,
          id_ncs
        FROM ncs_main
        WHERE major_category_name = $1
          AND middle_category_name = $2
          AND small_category_name IS NOT NULL 
          AND small_category_name != ''
        ORDER BY small_category_name, id_ncs ASC
      `
      params = [major, middle]
    } else if (level === 'sub') {
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: 'parent 파라미터가 필요합니다.',
        })
      }
      const [major, middle, small] = parent.split('|')
      query = `
        SELECT DISTINCT ON (sub_category_name)
          sub_category_name as name,
          id_ncs
        FROM ncs_main
        WHERE major_category_name = $1
          AND middle_category_name = $2
          AND small_category_name = $3
          AND sub_category_name IS NOT NULL 
          AND sub_category_name != ''
        ORDER BY sub_category_name, id_ncs ASC
      `
      params = [major, middle, small]
    }

    const result = await query(query, params)
    const data = result.rows.map((row) => row.name)

    res.json({ success: true, data })
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '카테고리 목록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 표준 코드 조회 (기존 호환성 유지)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params
    const startTime = Date.now()

    if (!['departments', 'industries', 'jobs'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 타입입니다. (departments, industries, jobs)',
      })
    }

    console.log(`[표준 코드 조회] 타입: ${type}, 시작 시간: ${new Date().toISOString()}`)

    // industries, jobs, departments 타입 모두 standard_codes에서 조회
    // code와 name을 함께 반환 (추천 검색 및 선택 이력 관리에서 code 필요)
    const selectQuery = `
      SELECT code, name
      FROM standard_codes
      WHERE type = $1
      ORDER BY name ASC
    `
    
    const queryStartTime = Date.now()
    const result = await query(selectQuery, [type])
    const queryTime = Date.now() - queryStartTime

    console.log(`[표준 코드 조회] 쿼리 실행 시간: ${queryTime}ms, 결과 개수: ${result.rows.length}`)
    
    // 결과가 없을 경우 경고
    if (result.rows.length === 0) {
      console.warn(`[표준 코드 조회] ⚠️ 데이터 없음 - type: ${type}`)
      console.warn(`[표준 코드 조회] 데이터베이스에 ${type} 타입의 데이터가 없습니다.`)
      console.warn(`[표준 코드 조회] populate_standard_codes_from_ncs.sql 또는 populate_24_industries.sql 스크립트를 실행하세요.`)
    }

    // code와 name을 함께 반환
    const codes = result.rows.map((row) => ({
      code: row.code,
      name: row.name,
    }))

    const totalTime = Date.now() - startTime
    console.log(`[표준 코드 조회] 총 소요 시간: ${totalTime}ms, 타입: ${type}, 개수: ${codes.length}`)
    
    if (codes.length > 0) {
      console.log(`[표준 코드 조회] 샘플 데이터 (처음 3개):`, codes.slice(0, 3))
    }

    res.json({ success: true, data: codes })
  } catch (error) {
    console.error('[표준 코드 조회 오류]', {
      type: req.params.type,
      error: error.message,
      stack: error.stack,
    })
    res.status(500).json({
      success: false,
      error: error.message || '표준 코드 조회 중 오류가 발생했습니다.',
    })
  }
})

export default router


