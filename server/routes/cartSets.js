import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 세트 저장
router.post('/', async (req, res) => {
  try {
    const { userId, name, items } = req.body

    if (!userId || !name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'userId, name, items가 필요합니다.',
      })
    }

    // 세트 ID 생성 (타임스탬프 기반)
    const setId = Date.now().toString()

    // 트랜잭션 시작
    await query('BEGIN')

    try {
      // 세트 저장
      const setQuery = `
        INSERT INTO cart_sets (id, user_id, name, created_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id, name, created_at
      `
      const setResult = await query(setQuery, [setId, userId, name])

      // 세트 아이템 저장
      const itemQueries = items.map((item) => {
        return query(
          `INSERT INTO cart_set_items (cart_set_id, unit_code, memo)
           VALUES ($1, $2, $3)`,
          [setId, item.abilityUnit.code, item.memo || null]
        )
      })

      await Promise.all(itemQueries)

      // 트랜잭션 커밋
      await query('COMMIT')

      res.json({
        success: true,
        data: {
          id: setResult.rows[0].id,
          name: setResult.rows[0].name,
          createdAt: setResult.rows[0].created_at,
          itemsCount: items.length,
        },
      })
    } catch (error) {
      // 트랜잭션 롤백
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('세트 저장 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '세트 저장 중 오류가 발생했습니다.',
    })
  }
})

// 사용자별 세트 목록 조회
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 세트 목록 조회 (아이템 개수 포함)
    const query = `
      SELECT 
        cs.id,
        cs.name,
        cs.created_at,
        COUNT(csi.id) as items_count
      FROM cart_sets cs
      LEFT JOIN cart_set_items csi ON cs.id = csi.cart_set_id
      WHERE cs.user_id = $1
      GROUP BY cs.id, cs.name, cs.created_at
      ORDER BY cs.created_at DESC
    `

    const result = await query(query, [userId])

    const sets = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.created_at,
      itemsCount: parseInt(row.items_count) || 0,
    }))

    res.json({
      success: true,
      data: sets,
    })
  } catch (error) {
    console.error('세트 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '세트 목록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 세트 상세 조회 (아이템 포함)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 세트 기본 정보 조회
    const setQuery = `
      SELECT id, name, created_at
      FROM cart_sets
      WHERE id = $1 AND user_id = $2
    `
    const setResult = await query(setQuery, [id, userId])

    if (setResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '세트를 찾을 수 없습니다.',
      })
    }

    const cartSet = setResult.rows[0]

    // 세트 아이템 조회 및 능력단위 정보 조회
    const itemsQuery = `
      SELECT 
        csi.unit_code,
        csi.memo,
        n.unit_name,
        n.unit_level,
        n.sub_category_code,
        n.sub_category_name,
        n.small_category_code,
        n.small_category_name,
        n.middle_category_name,
        n.major_category_name,
        ud.unit_definition
      FROM cart_set_items csi
      LEFT JOIN ncs_main n ON csi.unit_code = n.unit_code
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      WHERE csi.cart_set_id = $1
      GROUP BY csi.unit_code, csi.memo, n.unit_name, n.unit_level,
               n.sub_category_code, n.sub_category_name, n.small_category_code,
               n.small_category_name, n.middle_category_name, n.major_category_name,
               ud.unit_definition
      ORDER BY csi.unit_code
    `

    const itemsResult = await query(itemsQuery, [id])

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
          addedAt: cartSet.created_at,
        }
      })
    )

    res.json({
      success: true,
      data: {
        id: cartSet.id,
        name: cartSet.name,
        createdAt: cartSet.created_at,
        items,
      },
    })
  } catch (error) {
    console.error('세트 상세 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '세트 상세 조회 중 오류가 발생했습니다.',
    })
  }
})

// 세트 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId가 필요합니다.',
      })
    }

    // 세트 존재 확인 및 소유자 확인
    const checkQuery = `
      SELECT id FROM cart_sets
      WHERE id = $1 AND user_id = $2
    `
    const checkResult = await query(checkQuery, [id, userId])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '세트를 찾을 수 없습니다.',
      })
    }

    // 세트 삭제 (CASCADE로 인해 아이템도 자동 삭제됨)
    const deleteQuery = `DELETE FROM cart_sets WHERE id = $1`
    await query(deleteQuery, [id])

    res.json({
      success: true,
      message: '세트가 삭제되었습니다.',
    })
  } catch (error) {
    console.error('세트 삭제 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '세트 삭제 중 오류가 발생했습니다.',
    })
  }
})

export default router

