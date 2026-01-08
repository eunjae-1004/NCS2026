// API 테스트 스크립트
// 사용법: node scripts/test-api.js <base-url>
// 예시: node scripts/test-api.js https://your-app.railway.app

const BASE_URL = process.argv[2] || 'http://localhost:3000'

console.log('🧪 API 테스트 시작')
console.log(`📍 Base URL: ${BASE_URL}\n`)

const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/api',
    expectedStatus: 200,
  },
  {
    name: '능력단위 검색',
    method: 'GET',
    path: '/api/ability-units?keyword=품질',
    expectedStatus: 200,
  },
  {
    name: '기관 목록 조회',
    method: 'GET',
    path: '/api/organizations',
    expectedStatus: 200,
  },
  {
    name: '추천 API (산업분야+부서)',
    method: 'GET',
    path: '/api/recommendations?industry=제조업&department=품질관리',
    expectedStatus: 200,
  },
]

async function runTest(test) {
  try {
    const url = `${BASE_URL}${test.path}`
    console.log(`\n📌 ${test.name}`)
    console.log(`   ${test.method} ${url}`)
    
    const response = await fetch(url, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const status = response.status
    const isSuccess = status === test.expectedStatus
    
    if (isSuccess) {
      console.log(`   ✅ 성공 (${status})`)
      const data = await response.json()
      if (data.success !== undefined) {
        console.log(`   📊 Success: ${data.success}`)
        if (data.data && Array.isArray(data.data)) {
          console.log(`   📦 결과 개수: ${data.data.length}`)
        }
      }
    } else {
      console.log(`   ❌ 실패 (예상: ${test.expectedStatus}, 실제: ${status})`)
      const text = await response.text()
      console.log(`   📄 응답: ${text.substring(0, 200)}`)
    }
    
    return isSuccess
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}`)
    return false
  }
}

async function runAllTests() {
  console.log('='.repeat(60))
  
  const results = []
  for (const test of tests) {
    const result = await runTest(test)
    results.push({ name: test.name, success: result })
    await new Promise(resolve => setTimeout(resolve, 500)) // 요청 간 딜레이
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 테스트 결과 요약:')
  console.log('='.repeat(60))
  
  let successCount = 0
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${icon} ${result.name}`)
    if (result.success) successCount++
  })
  
  console.log('='.repeat(60))
  console.log(`\n총 ${results.length}개 테스트 중 ${successCount}개 성공`)
  
  if (successCount === results.length) {
    console.log('🎉 모든 테스트 통과!')
    process.exit(0)
  } else {
    console.log('⚠️ 일부 테스트 실패')
    process.exit(1)
  }
}

// Node.js 18+ fetch 지원 확인
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18 이상이 필요합니다. (fetch API 지원)')
  console.error('   또는 node-fetch 패키지를 설치하세요: npm install node-fetch')
  process.exit(1)
}

runAllTests().catch(error => {
  console.error('❌ 테스트 실행 중 오류:', error)
  process.exit(1)
})

