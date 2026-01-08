// 별칭 매핑 유틸리티 함수
// 사용자가 입력한 다양한 부서명/산업분야를 표준화된 값으로 변환
import { query } from '../db.js'

/**
 * 입력값을 standard_codes의 code로 변환
 * @param {string} input - 사용자가 입력한 값 (이름 또는 별칭)
 * @param {string} type - 'department' | 'industry' | 'job'
 * @returns {Promise<string>} - standard_codes의 code 값
 */
export async function normalizeAliasToCode(input, type) {
  if (!input || !type) {
    return ''
  }

  const lowerInput = input.toLowerCase().trim()

  // 1. alias_mapping 테이블에서 매핑 조회
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
    // 표준 코드 반환
    const code = mappingResult.rows[0].standard_code
    console.log(`normalizeAliasToCode: alias_mapping에서 찾음: "${input}" -> "${code}" (type: ${type})`)
    return code
  }

  // 2. alias_mapping이 없는 경우, standard_codes에서 직접 이름으로 조회
  const codeType = type === 'department' 
    ? 'departments' 
    : type === 'industry' 
    ? 'industries' 
    : 'jobs'
  
  const directQuery = `
    SELECT code
    FROM standard_codes
    WHERE LOWER(name) = $1 AND type = $2
    LIMIT 1
  `
  const directResult = await query(directQuery, [lowerInput, codeType])
  
  if (directResult.rows.length > 0) {
    const code = directResult.rows[0].code
    console.log(`normalizeAliasToCode: standard_codes에서 직접 찾음: "${input}" -> "${code}" (type: ${type})`)
    return code
  }

  // 3. 매핑이 없는 경우, standard_codes에 자동으로 추가
  // 사용자가 입력한 값을 그대로 standard_codes에 저장하여 분석 가능하도록 함
  const codeType = type === 'department' 
    ? 'departments' 
    : type === 'industry' 
    ? 'industries' 
    : 'jobs'
  
  // 코드 prefix 결정
  const codePrefix = type === 'department' ? 'dept' : type === 'industry' ? 'ind' : 'job'
  
  // 기존 최대 코드 번호 찾기 (더 안전한 방법)
  const maxCodeQuery = `
    SELECT COALESCE(
      MAX(
        CASE 
          WHEN code LIKE $1 || '_%' THEN 
            CAST(SUBSTRING(code FROM LENGTH($1) + 2) AS INTEGER)
          ELSE 0
        END
      ), 
      0
    ) as max_num
    FROM standard_codes
    WHERE type = $2
  `
  const maxResult = await query(maxCodeQuery, [codePrefix, codeType])
  const maxNum = parseInt(maxResult.rows[0]?.max_num || '0', 10)
  
  // 새로운 코드 생성
  const newCode = `${codePrefix}_${String(maxNum + 1).padStart(3, '0')}`
  
  // standard_codes에 추가 (원본 입력값을 name으로 사용)
  // ON CONFLICT는 (code, type)이 UNIQUE이므로 발생하지 않지만, 혹시 모를 경우를 대비
  const insertQuery = `
    INSERT INTO standard_codes (code, name, type)
    VALUES ($1, $2, $3)
    ON CONFLICT (code, type) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING code
  `
  const insertResult = await query(insertQuery, [newCode, input.trim(), codeType])
  
  const createdCode = insertResult.rows[0]?.code || newCode
  console.log(`✅ normalizeAliasToCode: 새로운 code 생성: "${input}" -> "${createdCode}" (type: ${type})`)
  
  return createdCode
}

/**
 * 입력값을 표준화된 이름으로 변환 (기존 호환성 유지)
 * @param {string} input - 사용자가 입력한 값
 * @param {string} type - 'department' | 'industry' | 'job'
 * @returns {Promise<string>} - 표준화된 이름
 */
export async function normalizeAlias(input, type) {
  const code = await normalizeAliasToCode(input, type)
  if (!code) {
    return input || ''
  }

  // code로 이름 조회
  const codeType = type === 'department' 
    ? 'departments' 
    : type === 'industry' 
    ? 'industries' 
    : 'jobs'
  
  const nameQuery = `
    SELECT name
    FROM standard_codes
    WHERE code = $1 AND type = $2
    LIMIT 1
  `
  const nameResult = await query(nameQuery, [code, codeType])
  
  return nameResult.rows[0]?.name || input || ''
}

/**
 * 여러 입력값을 한 번에 표준화 (이름 반환)
 * @param {Object} inputs - { industry?: string, department?: string, job?: string }
 * @returns {Promise<Object>} - { industry: string, department: string, job: string }
 */
export async function normalizeAliases(inputs) {
  const { industry, department, job } = inputs
  
  const [normalizedIndustry, normalizedDepartment, normalizedJob] = await Promise.all([
    industry ? normalizeAlias(industry, 'industry') : Promise.resolve(''),
    department ? normalizeAlias(department, 'department') : Promise.resolve(''),
    job ? normalizeAlias(job, 'job') : Promise.resolve(''),
  ])

  return {
    industry: normalizedIndustry,
    department: normalizedDepartment,
    job: normalizedJob,
  }
}

/**
 * 여러 입력값을 한 번에 standard_codes의 code로 변환
 * @param {Object} inputs - { industry?: string, department?: string, job?: string }
 * @returns {Promise<Object>} - { industryCode: string, departmentCode: string, jobCode: string }
 */
export async function normalizeAliasesToCodes(inputs) {
  const { industry, department, job } = inputs
  
  const [industryCode, departmentCode, jobCode] = await Promise.all([
    industry ? normalizeAliasToCode(industry, 'industry') : Promise.resolve(''),
    department ? normalizeAliasToCode(department, 'department') : Promise.resolve(''),
    job ? normalizeAliasToCode(job, 'job') : Promise.resolve(''),
  ])

  return {
    industryCode,
    departmentCode,
    jobCode,
  }
}

