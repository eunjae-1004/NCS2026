// 능력단위 관련 API 라우트
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 능력단위 검색
router.get('/', async (req, res) => {
  try {
    const {
      industry,
      department,
      jobCategory,
      jobTitle,
      level,
      keyword,
      subCategoryCode,
      smallCategoryCode,
      page = '1',
      limit = '20',
    } = req.query

    // 페이지네이션 파라미터
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 20
    const offset = (pageNum - 1) * limitNum

    // WHERE 조건 구성
    let whereClause = 'WHERE 1=1'
    const params = []
    let paramIndex = 1
    let hasKeywordSearch = false // keyword 검색 여부 추적
    let keywordForOrderingParamIndex = null // 정렬용 키워드 파라미터 인덱스

    // 부서 필터 (sub_category_name으로 검색)
    if (department) {
      whereClause += ` AND n.sub_category_name ILIKE $${paramIndex}`
      params.push(`%${department}%`)
      paramIndex++
    }

    // 직무 필터 (small_category_name, unit_name 등에서 검색)
    if (jobCategory) {
      const trimmedJobCategory = jobCategory.trim()
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (trimmedJobCategory) {
        // 여러 단어 검색 지원 (공백으로 구분된 단어들을 모두 포함하는 결과 검색)
        const jobKeywords = trimmedJobCategory.split(/\s+/).filter(k => k.length > 0)
        
        if (jobKeywords.length > 0) {
          // 각 키워드에 대해 검색 조건 생성
          const jobConditions = []
          
          jobKeywords.forEach((kw, idx) => {
            const jobParam = `%${kw}%`
            const currentParamIndex = paramIndex + idx
            
            // 검색 대상:
            // 1. 세분류명 (small_category_name) - 직무군/직무
            // 2. 능력단위명 (unit_name) - 직무 제목과 유사할 수 있음
            // 3. 능력단위요소명 (unit_element_name)
            jobConditions.push(`(
              n.small_category_name ILIKE $${currentParamIndex} OR
              n.unit_name ILIKE $${currentParamIndex} OR
              n.unit_element_name ILIKE $${currentParamIndex}
            )`)
            params.push(jobParam)
          })
          
          // 모든 키워드가 포함되어야 함 (AND 조건)
          whereClause += ` AND (${jobConditions.join(' AND ')})`
          paramIndex += jobKeywords.length
        }
      }
    }

    // 직무 제목 필터 (jobTitle이 별도로 제공된 경우)
    if (jobTitle) {
      const trimmedJobTitle = jobTitle.trim()
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (trimmedJobTitle) {
        // 직무 제목은 주로 능력단위명에서 검색
        whereClause += ` AND n.unit_name ILIKE $${paramIndex}`
        params.push(`%${trimmedJobTitle}%`)
        paramIndex++
      }
    }

    // 산업 필터 (major_category_name으로 검색)
    if (industry) {
      whereClause += ` AND n.major_category_name ILIKE $${paramIndex}`
      params.push(`%${industry}%`)
      paramIndex++
    }

    if (subCategoryCode) {
      console.log('소분류 코드 필터 적용:', {
        subCategoryCode,
        length: subCategoryCode.length,
        type: typeof subCategoryCode,
      })
      whereClause += ` AND n.sub_category_code = $${paramIndex}`
      params.push(subCategoryCode.trim())
      paramIndex++
      console.log('소분류 코드 필터 파라미터:', params[params.length - 1])
    }

    if (smallCategoryCode) {
      console.log('세분류 코드 필터 적용:', {
        smallCategoryCode,
        length: smallCategoryCode.length,
        type: typeof smallCategoryCode,
      })
      // 정확히 일치하는 8자리 세분류 코드로 필터링
      // 만약 small_category_code가 6자리로 저장되어 있다면, unit_code의 앞 8자리와 비교
      const trimmedCode = smallCategoryCode.trim()
      if (trimmedCode.length === 8) {
        // 8자리 코드: unit_code의 앞 8자리만 비교 (정확한 매칭)
        // small_category_code는 6자리로 저장되어 있을 수 있으므로 unit_code 기준으로만 비교
        whereClause += ` AND SUBSTRING(n.unit_code, 1, 8) = $${paramIndex}`
        params.push(trimmedCode)
        paramIndex++
        console.log('세분류 코드 필터 파라미터 (8자리, unit_code 기준):', trimmedCode)
        console.log('필터 조건: SUBSTRING(n.unit_code, 1, 8) =', trimmedCode)
      } else {
        // 6자리 이하 코드: small_category_code로만 비교
        whereClause += ` AND n.small_category_code = $${paramIndex}`
        params.push(trimmedCode)
        paramIndex++
        console.log('세분류 코드 필터 파라미터 (6자리 이하):', trimmedCode)
      }
    }

    if (level) {
      whereClause += ` AND n.unit_level = $${paramIndex}`
      params.push(parseInt(level))
      paramIndex++
    }

    if (keyword) {
      // 키워드 검색: 입력값 검증 및 정규화
      const trimmedKeyword = keyword.trim()
      
      console.log('키워드 검색 시작:', { keyword, trimmedKeyword })
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (!trimmedKeyword) {
        console.log('키워드가 비어있어 검색을 건너뜁니다.')
        // keyword 파라미터는 있지만 값이 비어있으면 무시
      } else {
        hasKeywordSearch = true
        
        // 여러 단어 검색 지원 (공백으로 구분된 단어들을 모두 포함하는 결과 검색)
        const keywords = trimmedKeyword.split(/\s+/).filter(k => k.length > 0)
        
        console.log('추출된 키워드:', keywords)
        
        if (keywords.length > 0) {
          // 정렬용으로 첫 번째 키워드의 파라미터 인덱스 저장
          keywordForOrderingParamIndex = paramIndex
          
          // 각 키워드에 대해 검색 조건 생성
          const keywordConditions = []
          
          keywords.forEach((kw, idx) => {
            const keywordParam = `%${kw}%`
            const currentParamIndex = paramIndex + idx
            
            console.log(`키워드 "${kw}" 검색 조건 생성 (파라미터 인덱스: ${currentParamIndex})`)
            
            // 검색 대상:
            // 1. 세분류명 (small_category_name)
            // 2. 능력단위명 (unit_name)
            // 3. 능력단위요소명 (unit_element_name) - EXISTS로 처리하여 GROUP BY 문제 해결
            // 4. 능력단위 정의 (unit_definition)
            // 5. 수행준거 (performance_criteria)
            keywordConditions.push(`(
              (n.small_category_name IS NOT NULL AND n.small_category_name ILIKE $${currentParamIndex}) OR
              (n.unit_name IS NOT NULL AND n.unit_name ILIKE $${currentParamIndex}) OR
              EXISTS (
                SELECT 1 FROM ncs_main n_elem
                WHERE n_elem.unit_code = n.unit_code
                  AND n_elem.unit_element_name IS NOT NULL
                  AND n_elem.unit_element_name ILIKE $${currentParamIndex}
              ) OR
              (ud.unit_definition IS NOT NULL AND ud.unit_definition ILIKE $${currentParamIndex}) OR
              EXISTS (
                SELECT 1 FROM performance_criteria pc
                WHERE pc.unit_code = n.unit_code
                  AND pc.performance_criteria IS NOT NULL
                  AND pc.performance_criteria ILIKE $${currentParamIndex}
              )
            )`)
            params.push(keywordParam)
          })
          
          // 모든 키워드가 포함되어야 함 (AND 조건)
          const keywordWhereClause = `(${keywordConditions.join(' AND ')})`
          whereClause += ` AND ${keywordWhereClause}`
          paramIndex += keywords.length
          
          console.log('키워드 검색 조건 추가 완료:', {
            keywordCount: keywords.length,
            whereClause: keywordWhereClause,
            paramIndex
          })
        }
      }
    }

    // 총 개수 조회 (limit, offset 추가 전의 파라미터 사용)
    const countParams = [...params] // 현재까지의 파라미터 복사
    const countSql = `
      SELECT COUNT(DISTINCT n.unit_code) as total
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      ${whereClause}
    `
    console.log('카운트 쿼리:', countSql)
    console.log('카운트 파라미터:', countParams)
    const countResult = await query(countSql, countParams)
    const total = parseInt(countResult.rows[0].total) || 0

    // 데이터 조회 (limit, offset 파라미터 추가)
    // keyword 검색 시 unit_element_name이 매칭되면 여러 행이 나올 수 있으므로 DISTINCT 사용
    const sql = `
      SELECT DISTINCT
        n.unit_code,
        n.unit_name,
        n.unit_level,
        n.sub_category_code,
        n.sub_category_name,
        n.small_category_code,
        n.small_category_name,
        n.middle_category_name,
        n.major_category_name,
        COALESCE(ud.unit_definition, '') as definition,
        STRING_AGG(DISTINCT n.unit_element_name, ', ') FILTER (WHERE n.unit_element_name IS NOT NULL) as element_names
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      ${whereClause}
      GROUP BY n.unit_code, n.unit_name, n.unit_level, n.sub_category_code,
               n.sub_category_name, n.small_category_code, n.small_category_name, n.middle_category_name,
               n.major_category_name, ud.unit_definition
      ORDER BY 
        ${hasKeywordSearch && keywordForOrderingParamIndex !== null
          ? `CASE 
              WHEN n.unit_name IS NOT NULL AND n.unit_name ILIKE $${keywordForOrderingParamIndex} THEN 1
              WHEN n.small_category_name IS NOT NULL AND n.small_category_name ILIKE $${keywordForOrderingParamIndex} THEN 2
              WHEN EXISTS (
                SELECT 1 FROM ncs_main n2 
                WHERE n2.unit_code = n.unit_code 
                  AND n2.unit_element_name IS NOT NULL 
                  AND n2.unit_element_name ILIKE $${keywordForOrderingParamIndex}
              ) THEN 3
              ELSE 4
            END,`
          : ''}
        n.unit_code
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limitNum, offset)
    
    console.log('검색 쿼리:', sql)
    console.log('검색 파라미터:', params)
    console.log('필터 값:', { 
      department, 
      jobCategory, 
      industry, 
      keyword, 
      level,
      subCategoryCode,
      smallCategoryCode,
    })
    
    const result = await query(sql, params)
    console.log('검색 결과 개수:', result.rows.length)
    console.log('검색 결과 총 개수 (total):', total)
    
    // 키워드 검색 시 디버깅 정보 추가
    if (hasKeywordSearch && keyword) {
      console.log('=== 키워드 검색 디버깅 정보 ===')
      console.log('검색 키워드:', keyword)
      console.log('검색된 결과 개수:', result.rows.length)
      console.log('총 개수 (COUNT):', total)
      
      if (result.rows.length === 0 && total === 0) {
        console.warn('⚠️ 키워드 검색 결과가 없습니다. 다음을 확인하세요:')
        console.warn('1. 데이터베이스에 해당 키워드가 포함된 데이터가 있는지 확인')
        console.warn('2. 생성된 SQL 쿼리를 확인하여 검색 조건이 올바른지 확인')
        console.warn('3. 키워드 파라미터가 올바르게 전달되었는지 확인')
      } else if (result.rows.length > 0) {
        console.log('✅ 검색 성공! 첫 번째 결과:', {
          unit_code: result.rows[0].unit_code,
          unit_name: result.rows[0].unit_name,
          small_category_name: result.rows[0].small_category_name,
        })
      }
    }
    
    // 검색 결과의 unit_code 앞 8자리 확인 (디버깅)
    if (smallCategoryCode && smallCategoryCode.trim().length === 8) {
      const targetCode = smallCategoryCode.trim()
      const matchedCodes = result.rows.map(row => ({
        unit_code: row.unit_code,
        unit_code_prefix: row.unit_code?.substring(0, 8),
        small_category_code: row.small_category_code,
        matches: row.unit_code?.substring(0, 8) === targetCode
      }))
      console.log('검색 결과 unit_code 앞 8자리 확인:', matchedCodes)
      const mismatched = matchedCodes.filter(item => !item.matches)
      if (mismatched.length > 0) {
        console.warn('⚠️ 필터 조건과 일치하지 않는 항목:', mismatched)
      }
    }

    // 결과를 AbilityUnit 형식으로 변환
    const abilityUnits = result.rows.map((row) => {
      // 디버깅: 첫 번째 결과만 로그 출력
      if (result.rows.indexOf(row) === 0) {
        console.log('=== 검색 결과 첫 번째 항목 디버깅 ===')
        console.log('DB에서 가져온 원본 데이터:', {
          unit_code: row.unit_code,
          major_category_name: row.major_category_name,
          sub_category_name: row.sub_category_name,
          small_category_name: row.small_category_name,
          major_category_name_type: typeof row.major_category_name,
          sub_category_name_type: typeof row.sub_category_name,
          major_category_name_is_null: row.major_category_name === null,
          sub_category_name_is_null: row.sub_category_name === null,
          major_category_name_is_empty: row.major_category_name === '',
          sub_category_name_is_empty: row.sub_category_name === '',
        })
      }
      
      return {
        id: row.unit_code,
        code: row.unit_code,
        name: row.unit_name,
        summary: row.definition
          ? row.definition.substring(0, 100) + '...'
          : row.unit_name,
        definition: row.definition || '',
        industry: row.major_category_name || null,
        department: row.sub_category_name || null,
        jobCategory: row.small_category_name || null,
        smallCategoryCode: row.small_category_code, // 세분류 코드
        subCategoryCode: row.sub_category_code, // 소분류 코드 추가
        level: row.unit_level,
        elements: [],
        performanceCriteria: [],
        knowledge: [],
        skills: [],
        attitudes: [],
        keywords: [],
      }
    })

    // 페이지네이션 메타데이터
    const totalPages = Math.ceil(total / limitNum)
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    }

    // 응답 구조: { success: true, data: { data: [...], pagination: {...} } }
    res.json({ 
      success: true, 
      data: {
        data: abilityUnits,
        pagination
      }
    })
  } catch (error) {
    console.error('능력단위 검색 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '검색 중 오류가 발생했습니다.',
    })
  }
})

// 능력단위 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 능력단위 기본 정보
    const unitQuery = `
      SELECT DISTINCT
        n.unit_code,
        n.unit_name,
        n.unit_level,
        n.sub_category_code,
        n.sub_category_name,
        n.small_category_code,
        n.small_category_name,
        n.middle_category_name,
        n.major_category_name,
        ud.unit_definition
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      WHERE n.unit_code = $1
      LIMIT 1
    `
    const unitResult = await query(unitQuery, [id])

    if (unitResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '능력단위를 찾을 수 없습니다.',
      })
    }

    const unit = unitResult.rows[0]
    console.log('=== 상세 조회 - 조회된 데이터 ===')
    console.log('DB에서 가져온 원본 데이터:', {
      unit_code: unit.unit_code,
      major_category_name: unit.major_category_name,
      sub_category_name: unit.sub_category_name,
      small_category_name: unit.small_category_name,
      major_category_name_type: typeof unit.major_category_name,
      sub_category_name_type: typeof unit.sub_category_name,
      major_category_name_is_null: unit.major_category_name === null,
      sub_category_name_is_null: unit.sub_category_name === null,
      major_category_name_is_empty: unit.major_category_name === '',
      sub_category_name_is_empty: unit.sub_category_name === '',
      small_category_code: unit.small_category_code,
      small_category_code_length: unit.small_category_code?.length,
      small_category_code_type: typeof unit.small_category_code,
      sub_category_code: unit.sub_category_code,
      sub_category_code_length: unit.sub_category_code?.length,
    })
    
    // small_category_code가 없거나 6자리 이하인 경우 경고
    if (!unit.small_category_code || unit.small_category_code.length < 8) {
      console.warn('⚠️ small_category_code가 8자리가 아닙니다:', {
        value: unit.small_category_code,
        length: unit.small_category_code?.length,
        sub_category_code: unit.sub_category_code,
      })
    }

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
    const elementsResult = await query(elementsQuery, [id])

    // 수행준거 조회
    const criteriaQuery = `
      SELECT 
        id,
        performance_criteria as content
      FROM performance_criteria
      WHERE unit_code = $1
      ORDER BY id
    `
    const criteriaResult = await query(criteriaQuery, [id])

    // KSA (지식/기술/태도) 조회
    const ksaQuery = `
      SELECT 
        type,
        content
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
    const ksaResult = await query(ksaQuery, [id])

    // KSA를 타입별로 분류
    const knowledge = ksaResult.rows
      .filter((k) => k.type === '지식')
      .map((k) => k.content)
    const skills = ksaResult.rows
      .filter((k) => k.type === '기술')
      .map((k) => k.content)
    const attitudes = ksaResult.rows
      .filter((k) => k.type === '태도')
      .map((k) => k.content)

    // 결과 구성
    const abilityUnit = {
      id: unit.unit_code,
      code: unit.unit_code,
      name: unit.unit_name,
      summary: unit.unit_definition
        ? unit.unit_definition.substring(0, 100) + '...'
        : unit.unit_name,
      definition: unit.unit_definition || '',
      industry: unit.major_category_name || null,
      department: unit.sub_category_name || null,
      jobCategory: unit.small_category_name || null,
      smallCategoryCode: unit.small_category_code, // 세분류 코드
      subCategoryCode: unit.sub_category_code, // 소분류 코드 추가
      level: unit.unit_level,
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
    }
    
    console.log('=== 상세 조회 - 응답 데이터 ===')
    console.log('응답에 포함될 industry/department:', {
      industry: abilityUnit.industry,
      department: abilityUnit.department,
      jobCategory: abilityUnit.jobCategory,
    })

    res.json({ success: true, data: abilityUnit })
  } catch (error) {
    console.error('능력단위 상세 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '조회 중 오류가 발생했습니다.',
    })
  }
})

// 유사 능력단위 조회
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params

    // 현재 능력단위 정보 조회
    const currentUnitQuery = `
      SELECT sub_category_code, unit_level
      FROM ncs_main
      WHERE unit_code = $1
      LIMIT 1
    `
    const currentResult = await query(currentUnitQuery, [id])

    if (currentResult.rows.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const current = currentResult.rows[0]

    // 유사 능력단위 조회 (같은 분류, 유사한 레벨)
    const similarQuery = `
      SELECT DISTINCT
        n.unit_code,
        n.unit_name,
        n.unit_level,
        ud.unit_definition
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      WHERE n.unit_code != $1
        AND n.sub_category_code = $2
        AND ABS(n.unit_level - $3) <= 1
      ORDER BY ABS(n.unit_level - $3), n.unit_code
      LIMIT 10
    `
    const similarResult = await query(similarQuery, [
      id,
      current.sub_category_code,
      current.unit_level,
    ])

    const similarUnits = similarResult.rows.map((row) => ({
      id: row.unit_code,
      code: row.unit_code,
      name: row.unit_name,
      summary: row.unit_definition
        ? row.unit_definition.substring(0, 100) + '...'
        : row.unit_name,
      definition: row.unit_definition || '',
      level: row.unit_level,
      elements: [],
      performanceCriteria: [],
      knowledge: [],
      skills: [],
      attitudes: [],
      keywords: [],
    }))

    res.json({ success: true, data: similarUnits })
  } catch (error) {
    console.error('유사 능력단위 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '조회 중 오류가 발생했습니다.',
    })
  }
})

export default router

