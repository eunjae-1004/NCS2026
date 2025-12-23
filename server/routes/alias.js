// 별칭 매핑 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 별칭 매핑
router.post('/map', async (req, res) => {
  try {
    const { input, type } = req.body

    if (!input || !type) {
      return res.status(400).json({
        success: false,
        error: 'input과 type이 필요합니다.',
      })
    }

    const lowerInput = input.toLowerCase().trim()

    // 데이터베이스에서 매핑 조회
    const mappingQuery = `
      SELECT 
        alias,
        standard_code,
        confidence
      FROM alias_mapping
      WHERE LOWER(alias) = $1 AND mapping_type = $2
      LIMIT 1
    `
    const mappingResult = await query(mappingQuery, [lowerInput, type])

    if (mappingResult.rows.length > 0 && mappingResult.rows[0].confidence >= 0.8) {
      // 표준 코드 이름 조회
      const codeQuery = `
        SELECT name
        FROM standard_codes
        WHERE code = $1
        LIMIT 1
      `
      const codeResult = await query(codeQuery, [mappingResult.rows[0].standard_code])
      const standardName = codeResult.rows[0]?.name || mappingResult.rows[0].standard_code

      return res.json({
        success: true,
        data: {
          input,
          standard: standardName,
          confidence: parseFloat(mappingResult.rows[0].confidence),
        },
      })
    }

    // 매핑이 없거나 신뢰도가 낮은 경우 후보 제시
    // type 변환: 'department' -> 'departments', 'industry' -> 'industries', 'job' -> 'jobs'
    const standardCodeType = type === 'department' 
      ? 'departments' 
      : type === 'industry' 
      ? 'industries' 
      : 'jobs'
    
    const candidatesQuery = `
      SELECT name
      FROM standard_codes
      WHERE type = $1
      ORDER BY name
      LIMIT 5
    `
    const candidatesResult = await query(candidatesQuery, [standardCodeType])
    const candidates = candidatesResult.rows.map((row) => row.name)

    res.json({
      success: true,
      data: {
        input,
        standard: input,
        confidence: 0.5,
        candidates,
      },
    })
  } catch (error) {
    console.error('별칭 매핑 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '매핑 중 오류가 발생했습니다.',
    })
  }
})

export default router

