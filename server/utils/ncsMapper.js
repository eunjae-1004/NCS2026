// NCS 메인 데이터와 standard_codes 매핑 유틸리티
// ncs_main 테이블의 데이터를 standard_codes의 code로 변환하는 중앙화된 로직
import { query } from '../db.js'

/**
 * ncs_main의 산업분야 이름을 standard_codes의 code로 변환
 * @param {string} industryName - ncs_main.major_category_name
 * @returns {Promise<string>} - standard_codes의 code (없으면 빈 문자열)
 */
export async function mapIndustryNameToCode(industryName) {
  if (!industryName) {
    return ''
  }

  const codeQuery = `
    SELECT code
    FROM standard_codes
    WHERE name = $1 AND type = 'industries'
    LIMIT 1
  `
  const result = await query(codeQuery, [industryName])
  const code = result.rows[0]?.code || ''
  
  if (!code) {
    console.warn(`⚠️ mapIndustryNameToCode: industryName="${industryName}"에 해당하는 code를 standard_codes에서 찾을 수 없습니다.`)
    console.log('standard_codes에서 industries 타입 조회:', {
      searchedName: industryName,
      availableCodes: (await query(`SELECT code, name FROM standard_codes WHERE type = 'industries' LIMIT 10`, [])).rows
    })
  }
  
  return code
}

/**
 * ncs_main의 부서 이름을 standard_codes의 code로 변환
 * @param {string} departmentName - ncs_main.sub_category_name
 * @returns {Promise<string>} - standard_codes의 code (없으면 빈 문자열)
 */
export async function mapDepartmentNameToCode(departmentName) {
  if (!departmentName) {
    return ''
  }

  const codeQuery = `
    SELECT code
    FROM standard_codes
    WHERE name = $1 AND type = 'departments'
    LIMIT 1
  `
  const result = await query(codeQuery, [departmentName])
  const code = result.rows[0]?.code || ''
  
  if (!code) {
    console.warn(`⚠️ mapDepartmentNameToCode: departmentName="${departmentName}"에 해당하는 code를 standard_codes에서 찾을 수 없습니다.`)
    console.log('standard_codes에서 departments 타입 조회:', {
      searchedName: departmentName,
      availableCodes: (await query(`SELECT code, name FROM standard_codes WHERE type = 'departments' LIMIT 10`, [])).rows
    })
  }
  
  return code
}

/**
 * ncs_main의 직무 이름을 standard_codes의 code로 변환
 * @param {string} jobName - 직무 이름
 * @returns {Promise<string>} - standard_codes의 code (없으면 빈 문자열)
 */
export async function mapJobNameToCode(jobName) {
  if (!jobName) {
    return ''
  }

  const codeQuery = `
    SELECT code
    FROM standard_codes
    WHERE name = $1 AND type = 'jobs'
    LIMIT 1
  `
  const result = await query(codeQuery, [jobName])
  return result.rows[0]?.code || ''
}

/**
 * unit_code로부터 ncs_main에서 산업분야/부서 정보를 가져와 code로 변환
 * @param {string} unitCode - 능력단위 코드
 * @returns {Promise<Object>} - { industryCode: string, departmentCode: string }
 */
export async function getNcsMainCodes(unitCode) {
  if (!unitCode) {
    return { industryCode: '', departmentCode: '' }
  }

  const ncsQuery = `
    SELECT DISTINCT 
      major_category_name,
      sub_category_name
    FROM ncs_main
    WHERE unit_code = $1
    LIMIT 1
  `
  const ncsResult = await query(ncsQuery, [unitCode])
  
  if (ncsResult.rows.length === 0) {
    return { industryCode: '', departmentCode: '' }
  }

  const row = ncsResult.rows[0]
  
  console.log('getNcsMainCodes: ncs_main에서 가져온 값:', {
    unitCode,
    major_category_name: row.major_category_name,
    sub_category_name: row.sub_category_name,
  })
  
  // 병렬로 code 변환
  const [industryCode, departmentCode] = await Promise.all([
    row.major_category_name 
      ? mapIndustryNameToCode(row.major_category_name) 
      : Promise.resolve(''),
    row.sub_category_name 
      ? mapDepartmentNameToCode(row.sub_category_name) 
      : Promise.resolve('')
  ])

  console.log('getNcsMainCodes: standard_codes로 변환된 결과:', {
    industryCode,
    departmentCode,
    industryName: row.major_category_name,
    departmentName: row.sub_category_name,
  })

  return { industryCode, departmentCode }
}

/**
 * 여러 unit_code에 대해 일괄 매핑 (성능 최적화)
 * @param {string[]} unitCodes - 능력단위 코드 배열
 * @returns {Promise<Map<string, Object>>} - unitCode -> { industryCode, departmentCode } 맵
 */
export async function batchGetNcsMainCodes(unitCodes) {
  if (!unitCodes || unitCodes.length === 0) {
    return new Map()
  }

  const ncsQuery = `
    SELECT DISTINCT 
      unit_code,
      major_category_name,
      sub_category_name
    FROM ncs_main
    WHERE unit_code = ANY($1)
  `
  const ncsResult = await query(ncsQuery, [unitCodes])
  
  const resultMap = new Map()
  
  // 각 행에 대해 code 변환
  const promises = ncsResult.rows.map(async (row) => {
    const [industryCode, departmentCode] = await Promise.all([
      row.major_category_name 
        ? mapIndustryNameToCode(row.major_category_name) 
        : Promise.resolve(''),
      row.sub_category_name 
        ? mapDepartmentNameToCode(row.sub_category_name) 
        : Promise.resolve('')
    ])
    
    resultMap.set(row.unit_code, { industryCode, departmentCode })
  })
  
  await Promise.all(promises)
  
  return resultMap
}

