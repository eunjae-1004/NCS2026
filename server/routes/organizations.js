// 기관 및 표준 코드 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 기관 목록 조회
router.get('/', async (req, res) => {
  try {
    const selectQuery = `
      SELECT 
        id,
        name,
        type
      FROM organizations
      ORDER BY name
    `
    const result = await query(selectQuery, [])

    const organizations = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
    }))

    res.json({ success: true, data: organizations })
  } catch (error) {
    console.error('기관 목록 조회 오류:', error)
    // 데이터베이스 오류 시 빈 배열 반환
    res.json({ success: true, data: [] })
  }
})

export default router


