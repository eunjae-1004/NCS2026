// 회원가입 API 테스트 스크립트
const API_BASE_URL = process.argv[2] || 'https://ncssearch-backend-production.up.railway.app/api'

async function testRegister() {
  console.log('🧪 회원가입 API 테스트')
  console.log('API Base URL:', API_BASE_URL)
  console.log('요청 URL:', `${API_BASE_URL}/auth/register`)
  console.log('')

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123456',
        name: '테스트 사용자',
        industryCode: 'ind_001',
        departmentCode: 'dept_001',
        jobCode: 'job_001',
      }),
    })

    console.log('응답 상태:', response.status, response.statusText)
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()))

    const text = await response.text()
    console.log('응답 본문:', text)

    if (response.ok) {
      const data = JSON.parse(text)
      console.log('✅ 성공:', data)
    } else {
      console.log('❌ 실패:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    console.error('스택:', error.stack)
  }
}

testRegister()
