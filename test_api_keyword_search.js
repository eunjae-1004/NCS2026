// API 키워드 검색 테스트 스크립트
// 사용법: node test_api_keyword_search.js

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

async function testKeywordSearch() {
  const keyword = '급여'
  const url = `${API_BASE_URL}/ability-units?keyword=${encodeURIComponent(keyword)}&page=1&limit=20`
  
  console.log('=== API 키워드 검색 테스트 ===')
  console.log('테스트 키워드:', keyword)
  console.log('요청 URL:', url)
  console.log('')
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    console.log('응답 상태:', response.status, response.statusText)
    console.log('응답 데이터:', JSON.stringify(data, null, 2))
    console.log('')
    
    if (data.success && data.data) {
      const results = data.data.data || []
      const pagination = data.data.pagination || {}
      
      console.log('✅ 검색 성공!')
      console.log('결과 개수:', results.length)
      console.log('총 개수:', pagination.total)
      console.log('페이지:', pagination.page)
      console.log('')
      
      if (results.length > 0) {
        console.log('첫 5개 결과:')
        results.slice(0, 5).forEach((item, idx) => {
          console.log(`${idx + 1}. [${item.code}] ${item.name}`)
          console.log(`   세분류: ${item.jobCategory || 'N/A'}`)
        })
      } else {
        console.log('⚠️ 결과가 없습니다.')
      }
    } else {
      console.error('❌ 검색 실패:', data.error || '알 수 없는 오류')
    }
  } catch (error) {
    console.error('❌ 요청 오류:', error.message)
    console.error('스택:', error.stack)
  }
}

// 실행
testKeywordSearch()
