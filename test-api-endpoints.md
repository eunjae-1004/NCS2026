# API 엔드포인트 테스트 가이드

## ✅ 서버 상태 확인

서버가 정상적으로 실행 중입니다:
- URL: `http://localhost:3000`
- Status: `running`

## 🔍 테스트할 API 엔드포인트

### 1. 능력단위 검색

**키워드 검색:**
```
http://localhost:3000/api/ability-units?keyword=품질
```

**레벨 필터:**
```
http://localhost:3000/api/ability-units?level=3
```

**복합 필터:**
```
http://localhost:3000/api/ability-units?keyword=관리&level=3
```

### 2. 능력단위 상세 조회 (KSA 포함)

```
http://localhost:3000/api/ability-units/0101010101_17v2
```

**예상 응답:**
- 능력단위 기본 정보
- 능력단위 요소
- 수행준거
- **KSA (지식/기술/태도)** ← 새로 추가됨!

### 3. 기관 목록

```
http://localhost:3000/api/organizations
```

### 4. 표준 코드 조회

**부서:**
```
http://localhost:3000/api/standard-codes/departments
```

**산업:**
```
http://localhost:3000/api/standard-codes/industries
```

**직무:**
```
http://localhost:3000/api/standard-codes/jobs
```

### 5. 추천 능력단위

```
http://localhost:3000/api/recommendations?industry=제조업
http://localhost:3000/api/recommendations?department=품질관리
```

## 🧪 테스트 방법

### 브라우저에서 테스트

1. 위의 URL을 브라우저 주소창에 입력
2. JSON 응답 확인
3. 데이터가 실제 DB에서 조회되었는지 확인

### PowerShell에서 테스트

```powershell
# 능력단위 검색
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units?keyword=품질" | Select-Object -ExpandProperty Content

# 상세 조회
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units/0101010101_17v2" | Select-Object -ExpandProperty Content
```

## ✅ 확인 사항

### 능력단위 상세 조회 응답에 포함되어야 할 항목:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "code": "...",
    "name": "...",
    "definition": "...",
    "elements": [...],
    "performanceCriteria": [...],
    "knowledge": ["지식 항목 1", "지식 항목 2"],  ← 확인!
    "skills": ["기술 항목 1", "기술 항목 2"],     ← 확인!
    "attitudes": ["태도 항목 1", "태도 항목 2"]   ← 확인!
  }
}
```

## 🎯 다음 단계

API 테스트가 성공하면:

1. ✅ 프론트엔드 `.env` 파일 생성
2. ✅ 프론트엔드 재시작
3. ✅ 실제 API 사용 확인
4. ✅ 전체 시스템 통합 테스트


