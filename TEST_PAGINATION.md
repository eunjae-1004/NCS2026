# 페이지네이션 테스트 가이드

## 🚀 빠른 시작

### Step 1: 서버 실행 확인

**백엔드 서버:**
```bash
cd server
npm run dev
```

확인: `http://localhost:3000` 접속 시 JSON 응답 확인

**프론트엔드 서버:**
```bash
npm run dev
```

확인: `http://localhost:5173` 접속 시 홈 페이지 표시

### Step 2: 검색 실행

1. 브라우저에서 `http://localhost:5173` 접속
2. 홈 페이지에서 검색 방법 선택:
   - "키워드로 찾기" 클릭
   - 또는 "직무로 찾기" 클릭

3. 검색어 입력:
   - 예: "품질", "관리", "생산" 등
   - 또는 필터 사용

4. 검색 실행

### Step 3: 페이지네이션 확인

검색 결과 페이지에서:

1. **결과 개수 확인**
   - 상단에 "검색 결과 (XXX개)" 표시 확인
   - 20개 이상이면 페이지네이션 표시

2. **페이지네이션 UI 확인**
   - 페이지 하단에 페이지 번호 표시
   - 이전/다음 버튼 표시
   - "X / Y 페이지" 정보 표시

3. **페이지 이동 테스트**
   - 페이지 번호 클릭
   - 이전/다음 버튼 클릭
   - 결과가 변경되는지 확인

4. **필터 변경 테스트**
   - 좌측 필터 변경
   - 자동으로 1페이지로 리셋되는지 확인

## 🧪 API 직접 테스트

### PowerShell에서 테스트

```powershell
# 1페이지 조회
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units?keyword=품질&page=1&limit=20" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 2페이지 조회
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units?keyword=품질&page=2&limit=20" | Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 브라우저에서 테스트

다음 URL을 브라우저 주소창에 입력:

```
http://localhost:3000/api/ability-units?keyword=품질&page=1&limit=20
```

응답에서 `pagination` 객체 확인:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## ✅ 체크리스트

### 기본 기능
- [ ] 검색 결과 페이지 접속
- [ ] 결과가 20개 이상일 때 페이지네이션 표시
- [ ] 페이지 번호 클릭 시 이동
- [ ] 이전/다음 버튼 작동
- [ ] 현재 페이지 강조 표시

### 필터 연동
- [ ] 필터 변경 시 1페이지로 리셋
- [ ] 새로운 검색 결과에 대한 페이지네이션 표시

### UI/UX
- [ ] 페이지 변경 시 상단으로 스크롤
- [ ] 총 개수 올바르게 표시
- [ ] 페이지 정보 올바르게 표시

## 🐛 문제 해결

### 페이지네이션이 표시되지 않음

**원인:**
- 검색 결과가 20개 미만
- API 응답에 `pagination` 객체 없음
- 프론트엔드 재시작 안 함

**해결:**
1. 더 많은 결과가 나오는 검색어 사용
2. 브라우저 콘솔(F12)에서 오류 확인
3. 프론트엔드 재시작: `npm run dev`

### 페이지 이동이 안 됨

**원인:**
- 백엔드 서버 미실행
- API 오류
- 네트워크 오류

**해결:**
1. 백엔드 서버 실행 확인: `cd server && npm run dev`
2. 브라우저 네트워크 탭에서 API 호출 확인
3. API 응답 확인

### 총 개수가 잘못됨

**원인:**
- 데이터베이스 쿼리 오류
- 필터 조건 오류

**해결:**
1. 백엔드 서버 콘솔에서 쿼리 로그 확인
2. 데이터베이스 직접 조회하여 확인

## 📊 예상 결과

### 정상 작동 시

**검색 결과 페이지:**
```
검색 결과 (150개)

[결과 항목 1]
[결과 항목 2]
...
[결과 항목 20]

[◀] [1] [2] [3] ... [8] [▶]  1 / 8 페이지
```

**API 응답:**
```json
{
  "success": true,
  "data": [...20개 항목...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🎯 완료 확인

다음이 모두 작동하면 성공:

1. ✅ 검색 결과 페이지에서 페이지네이션 표시
2. ✅ 페이지 번호 클릭 시 해당 페이지로 이동
3. ✅ 이전/다음 버튼 정상 작동
4. ✅ 필터 변경 시 1페이지로 리셋
5. ✅ 총 개수 및 페이지 정보 올바르게 표시


