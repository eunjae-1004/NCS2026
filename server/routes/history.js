// 선택 이력 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 선택 이력 저장
router.post('/selections', async (req, res) => {
  try {
    const { userId, abilityUnitId } = req.body

    if (!userId || !abilityUnitId) {
      return res.status(400).json({
        success: false,
        error: 'userId와 abilityUnitId가 필요합니다.',
      })
    }

    // unit_code 추출 (abilityUnitId가 unit_code인 경우)
    const unitCode = abilityUnitId

    const insertQuery = `
      INSERT INTO selection_history (user_id, ability_unit_id, unit_code, selected_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
      RETURNING id
    `
    const result = await query(insertQuery, [userId, abilityUnitId, unitCode])

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

    const selectQuery = `
      SELECT 
        ability_unit_id,
        unit_code,
        selected_at
      FROM selection_history
      WHERE user_id = $1
      ORDER BY selected_at DESC
      LIMIT 100
    `
    const result = await query(selectQuery, [userId])

    const history = result.rows.map((row) => ({
      abilityUnitId: row.ability_unit_id,
      unitCode: row.unit_code,
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


