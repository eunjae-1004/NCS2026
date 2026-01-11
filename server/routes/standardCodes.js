// 표준 코드 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 표준 코드 조회
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params

    if (!['departments', 'industries', 'jobs'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 타입입니다. (departments, industries, jobs)',
      })
    }

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


