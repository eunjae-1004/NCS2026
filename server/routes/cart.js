import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 사용자별 장바구니 조회
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 장바구니 아이템 조회 및 능력단위 정보 조회
    const itemsQuery = `
      SELECT 
        ci.unit_code,
        ci.memo,
        ci.added_at,
        n.unit_name,
        n.unit_level,
        n.sub_category_code,
        n.sub_category_name,
        n.small_category_code,
        n.small_category_name,
        n.middle_category_name,
        n.major_category_name,
        ud.unit_definition
      FROM cart_items ci
      LEFT JOIN ncs_main n ON ci.unit_code = n.unit_code
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      WHERE ci.user_id = $1::VARCHAR
      GROUP BY ci.unit_code, ci.memo, ci.added_at, n.unit_name, n.unit_level,
               n.sub_category_code, n.sub_category_name, n.small_category_code,
               n.small_category_name, n.middle_category_name, n.major_category_name,
               ud.unit_definition
      ORDER BY ci.added_at DESC
    `

    const itemsResult = await query(itemsQuery, [String(userId)])

    // 능력단위 요소 조회
    const items = await Promise.all(
      itemsResult.rows.map(async (row) => {
        // 능력단위 요소 조회
        const elementsQuery = `
          SELECT DISTINCT
            unit_element_code as id,
            unit_element_code as code,
            unit_element_name as name,
            unit_element_level as level
          FROM ncs_main
          WHERE unit_code = $1
          ORDER BY unit_element_code
        `
        const elementsResult = await query(elementsQuery, [row.unit_code])

        // 수행준거 조회
        const criteriaQuery = `
          SELECT id, performance_criteria as content
          FROM performance_criteria
          WHERE unit_code = $1
          ORDER BY id
        `
        const criteriaResult = await query(criteriaQuery, [row.unit_code])

        // KSA 조회
        const ksaQuery = `
          SELECT type, content
          FROM ksa
          WHERE unit_code = $1
          ORDER BY 
            CASE type
              WHEN '지식' THEN 1
              WHEN '기술' THEN 2
              WHEN '태도' THEN 3
            END,
            id
        `
        const ksaResult = await query(ksaQuery, [row.unit_code])

        const knowledge = ksaResult.rows
          .filter((k) => k.type === '지식')
          .map((k) => k.content)
        const skills = ksaResult.rows
          .filter((k) => k.type === '기술')
          .map((k) => k.content)
        const attitudes = ksaResult.rows
          .filter((k) => k.type === '태도')
          .map((k) => k.content)

        return {
          abilityUnit: {
            id: row.unit_code,
            code: row.unit_code,
            name: row.unit_name,
            summary: row.unit_definition
              ? row.unit_definition.substring(0, 100) + '...'
              : row.unit_name,
            definition: row.unit_definition || '',
            industry: row.major_category_name,
            department: row.sub_category_name,
            jobCategory: row.small_category_name,
            smallCategoryCode: row.small_category_code,
            subCategoryCode: row.sub_category_code,
            level: row.unit_level,
            elements: elementsResult.rows.map((el) => ({
              id: el.id,
              code: el.code,
              name: el.name,
              description: `${el.name} (레벨 ${el.level})`,
            })),
            performanceCriteria: criteriaResult.rows.map((pc) => ({
              id: pc.id.toString(),
              content: pc.content,
              highlighted: false,
            })),
            knowledge,
            skills,
            attitudes,
            keywords: [],
          },
          memo: row.memo || undefined,
          addedAt: row.added_at,
        }
      })
    )

    res.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error('장바구니 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '장바구니 조회 중 오류가 발생했습니다.',
    })
  }
})

// 장바구니 아이템 추가
router.post('/', async (req, res) => {
  try {
    const { userId, unitCode, memo } = req.body

    // 입력값 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    if (!unitCode) {
      return res.status(400).json({
        success: false,
        error: 'unitCode가 필요합니다.',
      })
    }

    // unitCode 정규화 및 검증
    const unitCodeStr = String(unitCode).trim()
    
    if (!unitCodeStr) {
      return res.status(400).json({
        success: false,
        error: 'unitCode는 빈 값일 수 없습니다.',
      })
    }

    // 사용자가 존재하는지 확인 (없으면 생성)
    // Guest 사용자는 email이 없을 수 있으므로 조건부로 처리
    // 타입 불일치 방지를 위해 명시적 타입 캐스팅 추가
    const userCheckQuery = `
      INSERT INTO users (id, name, role, created_at)
      VALUES ($1::VARCHAR, $2::VARCHAR, COALESCE((SELECT role FROM users WHERE id = $1::VARCHAR), 'user'::VARCHAR), CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `
    await query(userCheckQuery, [String(userId), String(userId)]) // 이름은 일단 userId로 설정

    // unitCode가 실제로 존재하는지 확인 (데이터 무결성 검증)
    const unitCheckQuery = `
      SELECT unit_code 
      FROM ncs_main 
      WHERE unit_code = $1 
      LIMIT 1
    `
    const unitCheckResult = await query(unitCheckQuery, [unitCodeStr])
    
    if (unitCheckResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `능력단위 코드 "${unitCodeStr}"를 찾을 수 없습니다.`,
      })
    }

    // 중복 확인 및 추가 (ON CONFLICT로 중복 방지)
    const insertQuery = `
      INSERT INTO cart_items (user_id, unit_code, memo, added_at)
      VALUES ($1::VARCHAR, $2::VARCHAR, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, unit_code) DO UPDATE
      SET memo = COALESCE(EXCLUDED.memo, cart_items.memo),
          added_at = CURRENT_TIMESTAMP
      RETURNING id, unit_code, memo, added_at
    `

    const result = await query(insertQuery, [String(userId), unitCodeStr, memo || null])

    if (result.rows.length === 0) {
      return res.status(500).json({
        success: false,
        error: '선택목록 추가에 실패했습니다.',
      })
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        unitCode: result.rows[0].unit_code,
        memo: result.rows[0].memo,
        addedAt: result.rows[0].added_at,
      },
    })
  } catch (error) {
    console.error('장바구니 추가 오류:', error)
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
      userId: req.body?.userId,
      unitCode: req.body?.unitCode,
    })
    
    // 데이터베이스 제약 조건 오류 처리
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 사용자 또는 능력단위 코드입니다.',
      })
    }
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: '이미 선택목록에 추가된 능력단위입니다.',
      })
    }

    res.status(500).json({
      success: false,
      error: error.message || '장바구니 추가 중 오류가 발생했습니다.',
    })
  }
})

// 장바구니 아이템 여러 개 추가
router.post('/multiple', async (req, res) => {
  try {
    const { userId, items } = req.body

    // 입력값 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'items 배열이 필요합니다.',
      })
    }

    if (items.length === 0) {
      return res.json({
        success: true,
        data: { count: 0, added: 0, skipped: 0 },
      })
    }

    // 사용자가 존재하는지 확인 (없으면 생성)
    const userCheckQuery = `
      INSERT INTO users (id, name, role, created_at)
      VALUES ($1::VARCHAR, $2::VARCHAR, COALESCE((SELECT role FROM users WHERE id = $1::VARCHAR), 'user'::VARCHAR), CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING
    `
    await query(userCheckQuery, [String(userId), String(userId)])

    // 유효한 unitCode만 필터링 (빈 값 제거)
    const validItems = items
      .map((item) => {
        const unitCode = String(item.abilityUnit?.code || item.abilityUnit?.id || '').trim()
        return unitCode ? { unitCode, memo: item.memo || null } : null
      })
      .filter((item) => item !== null)

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: '유효한 능력단위 코드가 없습니다.',
      })
    }

    // 여러 아이템 추가 (중복 시 무시)
    // 성능 최적화: 한 번의 쿼리로 여러 아이템 추가
    const values = validItems
      .map((item, index) => {
        const baseIndex = index * 3
        return `($${baseIndex + 1}::VARCHAR, $${baseIndex + 2}::VARCHAR, $${baseIndex + 3}, CURRENT_TIMESTAMP)`
      })
      .join(', ')

    const params = validItems.flatMap((item) => [
      String(userId),
      item.unitCode,
      item.memo,
    ])

    const insertQuery = `
      INSERT INTO cart_items (user_id, unit_code, memo, added_at)
      VALUES ${values}
      ON CONFLICT (user_id, unit_code) DO NOTHING
      RETURNING unit_code
    `

    const result = await query(insertQuery, params)
    const addedCount = result.rows.length
    const skippedCount = validItems.length - addedCount

    res.json({
      success: true,
      data: {
        count: validItems.length,
        added: addedCount,
        skipped: skippedCount,
      },
    })
  } catch (error) {
    console.error('장바구니 여러 개 추가 오류:', error)
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
      userId: req.body?.userId,
      itemsCount: req.body?.items?.length,
    })
    
    // 데이터베이스 제약 조건 오류 처리
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 사용자 또는 능력단위 코드가 포함되어 있습니다.',
      })
    }

    res.status(500).json({
      success: false,
      error: error.message || '장바구니 추가 중 오류가 발생했습니다.',
    })
  }
})

// 장바구니 아이템 삭제
router.delete('/:unitCode', async (req, res) => {
  try {
    const { unitCode } = req.params
    const { userId } = req.query

    // 입력값 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // unitCode 정규화 및 검증
    const unitCodeStr = String(unitCode).trim()
    
    if (!unitCodeStr) {
      return res.status(400).json({
        success: false,
        error: 'unitCode는 빈 값일 수 없습니다.',
      })
    }

    const deleteQuery = `
      DELETE FROM cart_items
      WHERE user_id = $1::VARCHAR AND unit_code = $2::VARCHAR
      RETURNING id
    `

    const result = await query(deleteQuery, [String(userId), unitCodeStr])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '선택목록에서 해당 능력단위를 찾을 수 없습니다.',
      })
    }

    res.json({
      success: true,
      message: '장바구니 아이템이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('장바구니 삭제 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '장바구니 삭제 중 오류가 발생했습니다.',
    })
  }
})

// 장바구니 메모 업데이트
router.put('/:unitCode/memo', async (req, res) => {
  try {
    const { unitCode } = req.params
    const { userId, memo } = req.body

    // 입력값 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // unitCode 정규화 및 검증
    const unitCodeStr = String(unitCode).trim()
    
    if (!unitCodeStr) {
      return res.status(400).json({
        success: false,
        error: 'unitCode는 빈 값일 수 없습니다.',
      })
    }

    // memo는 선택사항이므로 null 허용 (빈 문자열도 null로 처리)
    const memoValue = memo && String(memo).trim() ? String(memo).trim() : null

    const updateQuery = `
      UPDATE cart_items
      SET memo = $1
      WHERE user_id = $2::VARCHAR AND unit_code = $3::VARCHAR
      RETURNING id, unit_code, memo
    `

    const result = await query(updateQuery, [memoValue, String(userId), unitCodeStr])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '선택목록에서 해당 능력단위를 찾을 수 없습니다.',
      })
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        unitCode: result.rows[0].unit_code,
        memo: result.rows[0].memo,
      },
    })
  } catch (error) {
    console.error('장바구니 메모 업데이트 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '메모 업데이트 중 오류가 발생했습니다.',
    })
  }
})

// 장바구니 전체 삭제
router.delete('/', async (req, res) => {
  try {
    const { userId } = req.query

    // 입력값 검증
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    const deleteQuery = `
      DELETE FROM cart_items 
      WHERE user_id = $1::VARCHAR
      RETURNING id
    `
    const result = await query(deleteQuery, [String(userId)])

    const deletedCount = result.rows.length

    res.json({
      success: true,
      message: '장바구니가 비워졌습니다.',
      data: {
        deletedCount,
      },
    })
  } catch (error) {
    console.error('장바구니 전체 삭제 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '장바구니 삭제 중 오류가 발생했습니다.',
    })
  }
})

export default router

