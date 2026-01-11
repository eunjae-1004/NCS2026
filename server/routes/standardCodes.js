// 표준 코드 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 계층구조 목록 조회 (산업분야별 직무군)
router.get('/hierarchical', async (req, res) => {
  try {
    // ncs_main에서 산업분야(major_category_name)와 직무군(sub_category_name)을 계층구조로 조회
    const hierarchicalQuery = `
      SELECT DISTINCT
        n.major_category_name as industry,
        n.sub_category_name as job_category
      FROM ncs_main n
      WHERE n.major_category_name IS NOT NULL 
        AND n.major_category_name != ''
        AND n.sub_category_name IS NOT NULL 
        AND n.sub_category_name != ''
      ORDER BY n.major_category_name, n.sub_category_name
    `
    const result = await query(hierarchicalQuery, [])

    // 계층구조로 변환
    const hierarchical = {}
    result.rows.forEach((row) => {
      const industry = row.industry
      const jobCategory = row.job_category

      if (!hierarchical[industry]) {
        hierarchical[industry] = []
      }

      // 중복 제거
      if (!hierarchical[industry].includes(jobCategory)) {
        hierarchical[industry].push(jobCategory)
      }
    })

    // 배열 형태로 변환
    const data = Object.keys(hierarchical)
      .sort()
      .map((industry) => ({
        industry,
        jobCategories: hierarchical[industry].sort(),
      }))

    res.json({ success: true, data })
  } catch (error) {
    console.error('계층구조 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '계층구조 목록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 표준 코드 조회 (기존 호환성 유지)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params

    if (!['departments', 'industries', 'jobs'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 타입입니다. (departments, industries, jobs)',
      })
    }

    // industries 타입인 경우 ncs_main에서 major_category_name 조회
    if (type === 'industries') {
      const industriesQuery = `
        SELECT DISTINCT major_category_name as name
        FROM ncs_main
        WHERE major_category_name IS NOT NULL 
          AND major_category_name != ''
        ORDER BY major_category_name
      `
      const result = await query(industriesQuery, [])
      const codes = result.rows.map((row) => row.name)
      return res.json({ success: true, data: codes })
    }

    // jobs 타입인 경우 ncs_main에서 sub_category_name 조회
    if (type === 'jobs') {
      const jobsQuery = `
        SELECT DISTINCT sub_category_name as name
        FROM ncs_main
        WHERE sub_category_name IS NOT NULL 
          AND sub_category_name != ''
        ORDER BY sub_category_name
      `
      const result = await query(jobsQuery, [])
      const codes = result.rows.map((row) => row.name)
      return res.json({ success: true, data: codes })
    }

    // departments 타입은 기존대로 standard_codes에서 조회
    const selectQuery = `
      SELECT name
      FROM standard_codes
      WHERE type = $1
      ORDER BY code ASC
    `
    const result = await query(selectQuery, [type])

    const codes = result.rows.map((row) => row.name)

    res.json({ success: true, data: codes })
  } catch (error) {
    console.error('표준 코드 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '표준 코드 조회 중 오류가 발생했습니다.',
    })
  }
})

export default router


