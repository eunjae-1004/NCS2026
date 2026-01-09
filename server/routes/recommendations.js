// 추천 관련 API 라우트
// 산업분야+부서별 능력단위 활용 빈도수를 기반으로 맞춤형 추천
import express from 'express'
import { query } from '../db.js'
import { normalizeAliasesToCodes } from '../utils/aliasMapper.js'

const router = express.Router()

// 추천 능력단위 조회
// 사용자가 산업분야와 부서 정보를 입력하면, selection_history를 분석하여 맞춤형 추천
router.get('/', async (req, res) => {
  try {
    let { industry, department, job } = req.query
    console.log('추천 API 요청 (원본):', { industry, department, job })

    // 필수 파라미터 검증: 산업분야 또는 부서 중 하나는 필수
    if (!industry && !department) {
      return res.status(400).json({
        success: false,
        error: '산업분야 또는 부서 정보 중 하나는 필수입니다.',
      })
    }

    // 1. alias_mapping을 활용하여 입력값을 standard_codes의 code로 변환
    let industryCode = ''
    let departmentCode = ''
    let jobCode = ''

    if (industry || department || job) {
      const codes = await normalizeAliasesToCodes({ industry, department, job })
      industryCode = codes.industryCode
      departmentCode = codes.departmentCode
      jobCode = codes.jobCode
      console.log('추천 API 요청 (code 변환 후):', { industryCode, departmentCode, jobCode })
    }

    // code가 없으면 입력값이 표준화되지 않은 것으로 간주
    if (industry && !industryCode) {
      console.warn(`산업분야 "${industry}"에 대한 표준 코드를 찾을 수 없습니다.`)
    }
    if (department && !departmentCode) {
      console.warn(`부서 "${department}"에 대한 표준 코드를 찾을 수 없습니다.`)
    }

    // 2. code로 standard_codes에서 이름 조회 (ncs_main 필터링 및 추천 이유 생성용)
    let industryName = industry
    let departmentName = department
    let jobName = job

    if (industryCode) {
      const nameQuery = `SELECT name FROM standard_codes WHERE code = $1 AND type = 'industries' LIMIT 1`
      const nameResult = await query(nameQuery, [industryCode])
      industryName = nameResult.rows[0]?.name || industry
    }
    if (departmentCode) {
      const nameQuery = `SELECT name FROM standard_codes WHERE code = $1 AND type = 'departments' LIMIT 1`
      const nameResult = await query(nameQuery, [departmentCode])
      departmentName = nameResult.rows[0]?.name || department
    }
    if (jobCode) {
      const nameQuery = `SELECT name FROM standard_codes WHERE code = $1 AND type = 'jobs' LIMIT 1`
      const nameResult = await query(nameQuery, [jobCode])
      jobName = nameResult.rows[0]?.name || job
    }

    // 3. ncs_main 필터링 조건 구성
    let whereClause = 'WHERE 1=1'
    const params = []
    let paramIndex = 1

    // 산업분야 필터 (major_category_name으로 검색)
    if (industryName) {
      const trimmedIndustry = industryName.trim()
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (trimmedIndustry) {
        // 여러 단어 검색 지원 (공백으로 구분된 단어들을 모두 포함하는 결과 검색)
        const industryKeywords = trimmedIndustry.split(/\s+/).filter(k => k.length > 0)
        
        if (industryKeywords.length > 0) {
          // 각 키워드에 대해 검색 조건 생성
          const industryConditions = []
          
          industryKeywords.forEach((kw, idx) => {
            const industryParam = `%${kw}%`
            const currentParamIndex = paramIndex + idx
            
            // 검색 대상: 대분류명 (major_category_name)
            industryConditions.push(`n.major_category_name ILIKE $${currentParamIndex}`)
            params.push(industryParam)
          })
          
          // 모든 키워드가 포함되어야 함 (AND 조건)
          whereClause += ` AND (${industryConditions.join(' AND ')})`
          paramIndex += industryKeywords.length
        }
      }
    }

    // 부서 필터 (sub_category_name으로 검색)
    if (departmentName) {
      const trimmedDepartment = departmentName.trim()
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (trimmedDepartment) {
        // 여러 단어 검색 지원 (공백으로 구분된 단어들을 모두 포함하는 결과 검색)
        const departmentKeywords = trimmedDepartment.split(/\s+/).filter(k => k.length > 0)
        
        if (departmentKeywords.length > 0) {
          // 각 키워드에 대해 검색 조건 생성
          const departmentConditions = []
          
          departmentKeywords.forEach((kw, idx) => {
            const departmentParam = `%${kw}%`
            const currentParamIndex = paramIndex + idx
            
            // 검색 대상: 소분류명 (sub_category_name)
            departmentConditions.push(`n.sub_category_name ILIKE $${currentParamIndex}`)
            params.push(departmentParam)
          })
          
          // 모든 키워드가 포함되어야 함 (AND 조건)
          whereClause += ` AND (${departmentConditions.join(' AND ')})`
          paramIndex += departmentKeywords.length
        }
      }
    }

    // 직무 필터 (job 파라미터 활용, small_category_name으로 검색)
    if (jobName) {
      const trimmedJob = jobName.trim()
      
      // 빈 문자열이나 공백만 있는 경우 무시
      if (trimmedJob) {
        // 여러 단어 검색 지원 (공백으로 구분된 단어들을 모두 포함하는 결과 검색)
        const jobKeywords = trimmedJob.split(/\s+/).filter(k => k.length > 0)
        
        if (jobKeywords.length > 0) {
          // 각 키워드에 대해 검색 조건 생성
          const jobConditions = []
          
          jobKeywords.forEach((kw, idx) => {
            const jobParam = `%${kw}%`
            const currentParamIndex = paramIndex + idx
            
            // 검색 대상:
            // 1. 세분류명 (small_category_name) - 직무군/직무
            // 2. 능력단위명 (unit_name) - 직무 제목과 유사할 수 있음
            jobConditions.push(`(
              n.small_category_name ILIKE $${currentParamIndex} OR
              n.unit_name ILIKE $${currentParamIndex}
            )`)
            params.push(jobParam)
          })
          
          // 모든 키워드가 포함되어야 함 (AND 조건)
          whereClause += ` AND (${jobConditions.join(' AND ')})`
          paramIndex += jobKeywords.length
        }
      }
    }

    // 4. 맞춤형 추천 로직
    // 추천 우선순위:
    // 1순위: 산업분야+부서 조합으로 정확히 일치하는 선택 이력이 많은 능력단위
    // 2순위: 산업분야 또는 부서 중 하나만 일치하는 선택 이력이 많은 능력단위
    // 3순위: 필터 조건에 맞지만 선택 이력이 없는 능력단위

    // 통계 뷰를 활용하여 성능 최적화
    // 서브쿼리를 사용하여 GROUP BY 오류 방지
    let usageStatsSubquery = ''
    let exactMatchSubquery = ''
    const usageStatsParams = []
    let usageStatsParamIndex = paramIndex
    
    if (industryCode && departmentCode) {
      // 산업분야+부서 조합으로 정확히 일치하는 경우 (최우선)
      usageStatsSubquery = `(
        SELECT COALESCE(aus.selection_count, 0)
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.industry_code = $${usageStatsParamIndex}
          AND aus.department_code = $${usageStatsParamIndex + 1}
        LIMIT 1
      )`
      exactMatchSubquery = `(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.industry_code = $${usageStatsParamIndex}
          AND aus.department_code = $${usageStatsParamIndex + 1}
      )`
      usageStatsParams.push(industryCode, departmentCode)
      usageStatsParamIndex += 2
    } else if (industryCode) {
      // 산업분야만 일치하는 경우
      usageStatsSubquery = `(
        SELECT COALESCE(MAX(aus.selection_count), 0)
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.industry_code = $${usageStatsParamIndex}
      )`
      exactMatchSubquery = `(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.industry_code = $${usageStatsParamIndex}
      )`
      usageStatsParams.push(industryCode)
      usageStatsParamIndex++
    } else if (departmentCode) {
      // 부서만 일치하는 경우
      usageStatsSubquery = `(
        SELECT COALESCE(MAX(aus.selection_count), 0)
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.department_code = $${usageStatsParamIndex}
      )`
      exactMatchSubquery = `(
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM ability_unit_usage_stats aus
        WHERE aus.unit_code = n.unit_code
          AND aus.department_code = $${usageStatsParamIndex}
      )`
      usageStatsParams.push(departmentCode)
      usageStatsParamIndex++
    } else {
      // code가 없는 경우
      usageStatsSubquery = '0'
      exactMatchSubquery = '0'
    }

    // usageStatsParams를 params에 추가
    params.push(...usageStatsParams)

    // 5. 최종 추천 쿼리 (서브쿼리 활용)
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
        ${usageStatsSubquery} as selection_count,
        ${exactMatchSubquery} as exact_match_score
      FROM ncs_main n
      LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
      ${whereClause}
      GROUP BY n.unit_code, n.unit_name, n.unit_level, n.sub_category_code,
               n.sub_category_name, n.small_category_name, n.middle_category_name,
               n.major_category_name, ud.unit_definition
      ORDER BY 
        exact_match_score DESC,
        selection_count DESC,
        n.unit_code
      LIMIT 20
    `

    console.log('추천 쿼리:', sql)
    console.log('추천 파라미터:', params)
    
    const result = await query(sql, params)
    console.log('추천 결과 개수:', result.rows.length)

    // 6. 결과를 Recommendation 형식으로 변환 (맞춤형 추천 이유 포함)
    const recommendations = result.rows.map((row) => {
      let reason = ''
      let reasonType = 'recommended'

      if (industryCode && departmentCode) {
        // 산업분야+부서 조합
        if (row.selection_count > 0) {
          reason = `${industryName} 산업의 ${departmentName} 부서에서 ${row.selection_count}회 선택된 인기 능력단위입니다`
          reasonType = 'customized'
        } else {
          reason = `${industryName} 산업의 ${departmentName} 부서에 적합한 능력단위입니다`
          reasonType = 'mapping'
        }
      } else if (industryCode) {
        // 산업분야만
        if (row.selection_count > 0) {
          reason = `${industryName} 산업에서 ${row.selection_count}회 선택된 인기 능력단위입니다`
          reasonType = 'popular'
        } else {
          reason = `${industryName} 산업에 적합한 능력단위입니다`
          reasonType = 'mapping'
        }
      } else if (departmentCode) {
        // 부서만
        if (row.selection_count > 0) {
          reason = `${departmentName} 부서에서 ${row.selection_count}회 선택된 인기 능력단위입니다`
          reasonType = 'popular'
        } else {
          reason = `${departmentName} 부서에 적합한 능력단위입니다`
          reasonType = 'mapping'
        }
      } else {
        reason = '추천하는 능력단위입니다'
        reasonType = 'recommended'
      }

      // 디버깅: 첫 번째 결과만 로그 출력
      const isFirst = recommendations.length === 0
      if (isFirst) {
        console.log('=== 추천 결과 첫 번째 항목 디버깅 ===')
        console.log('DB에서 가져온 원본 데이터:', {
          unit_code: row.unit_code,
          major_category_name: row.major_category_name,
          sub_category_name: row.sub_category_name,
          small_category_name: row.small_category_name,
          major_category_name_type: typeof row.major_category_name,
          sub_category_name_type: typeof row.sub_category_name,
          major_category_name_is_null: row.major_category_name === null,
          sub_category_name_is_null: row.sub_category_name === null,
        })
      }

      return {
        abilityUnit: {
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
          level: row.unit_level,
          elements: [],
          performanceCriteria: [],
          knowledge: [],
          skills: [],
          attitudes: [],
          keywords: [],
        },
        reason,
        reasonType,
        selectionCount: row.selection_count,
      }
    })

    res.json({
      success: true,
      data: recommendations,
      meta: {
        industry: industryName,
        department: departmentName,
        job: jobName,
        totalResults: recommendations.length,
      },
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

