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

  // 3. 매핑이 없는 경우 빈 문자열 반환 (또는 null)
  console.warn(`⚠️ normalizeAliasToCode: "${input}" (type: ${type})에 해당하는 code를 찾을 수 없습니다.`)
  return ''
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

