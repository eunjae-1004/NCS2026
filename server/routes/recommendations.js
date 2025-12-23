// 추천 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 추천 능력단위 조회
router.get('/', async (req, res) => {
  try {
    const { industry, department } = req.query
    console.log('추천 API 요청:', { industry, department })

    let whereClause = 'WHERE 1=1'
    const params = []
    let paramIndex = 1

    // 산업 필터
    if (industry) {
      whereClause += ` AND n.major_category_name ILIKE $${paramIndex}`
      params.push(`%${industry}%`)
      paramIndex++
    }

    // 부서 필터
    if (department) {
      whereClause += ` AND n.sub_category_name ILIKE $${paramIndex}`
      params.push(`%${department}%`)
      paramIndex++
    }

    // 추천 능력단위 조회
    // 추천 기준:
    // 1. 선택 이력(selection_history)이 많은 능력단위 (인기순)
    // 2. 선택 이력이 없어도 필터 조건에 맞는 모든 능력단위 표시
    // 3. 필터가 없으면 모든 능력단위 중 인기순으로 표시
    const sql = `
      SELECT DISTINCT
        n.unit_code,
        n.unit_name,
        n.unit_level,
        n.sub_category_code,
        n.sub_category_name,
        n.small_category_name,
        n.middle_category_name,
        n.major_category_name,
        ud.unit_definition as definition,
        COALESCE(COUNT(DISTINCT sh.id), 0) as selection_count
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      LEFT JOIN selection_history sh ON n.unit_code = sh.unit_code
      ${whereClause}
      GROUP BY n.unit_code, n.unit_name, n.unit_level, n.sub_category_code,
               n.sub_category_name, n.small_category_name, n.middle_category_name,
               n.major_category_name, ud.unit_definition
      ORDER BY selection_count DESC, n.unit_code
      LIMIT 20
    `

    console.log('추천 쿼리:', sql)
    console.log('추천 파라미터:', params)
    
    const result = await query(sql, params)
    console.log('추천 결과 개수:', result.rows.length)

    // 결과를 Recommendation 형식으로 변환
    const recommendations = result.rows.map((row) => ({
      abilityUnit: {
        id: row.unit_code,
        code: row.unit_code,
        name: row.unit_name,
        summary: row.definition
          ? row.definition.substring(0, 100) + '...'
          : row.unit_name,
        definition: row.definition || '',
        industry: row.major_category_name,
        department: row.sub_category_name,
        jobCategory: row.small_category_name,
        level: row.unit_level,
        elements: [],
        performanceCriteria: [],
        knowledge: [],
        skills: [],
        attitudes: [],
        keywords: [],
      },
      reason: department
        ? `${department} 부서에서 많이 선택한 능력단위입니다`
        : industry
        ? `${industry} 산업에서 인기 있는 능력단위입니다`
        : '인기 있는 능력단위입니다',
      reasonType: department ? 'mapping' : 'popular',
    }))

    res.json({
      success: true,
      data: recommendations,
    })
  } catch (error) {
    console.error('추천 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '추천 조회 중 오류가 발생했습니다.',
    })
  }
})

export default router

